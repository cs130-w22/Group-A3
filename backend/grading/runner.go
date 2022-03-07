package grading

import (
	"context"
	"database/sql"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path"
	"sync"
	"time"

	"github.com/google/uuid"
)

// Time to refresh results, in milliseconds.
const REFRESH_MILLIS = 500

// Multi-threaded job runner.
type Runner struct {
	store   *sql.DB
	queue   chan jobWithID
	running sync.Map
}

type jobWithID struct {
	job Job
	id  string
}

// Add a job to the runner, returning its associated job ID.
func (r *Runner) Add(job Job) string {
	withId := jobWithID{
		job: job,
		id:  uuid.NewString(),
	}
	r.queue <- withId
	return withId.id
}

// Get a receive-only channel of results for a given job. If the job has
// terminated, will return an already-closed channel of Results.
func (r *Runner) Results(ctx context.Context, jobId string) <-chan []Result {
	output := make(chan []Result, 5)
	lastRows := 0
	lastEqual := 0

	go func() {
		conn, _ := r.store.Conn(ctx)
		ticker := time.NewTicker(REFRESH_MILLIS * time.Millisecond)
		for range ticker.C {
			rows, err := conn.QueryContext(ctx, `
			SELECT
				hidden,
				test_id,
				test_name,
				score,
				message
			FROM Submissions L
			JOIN Results R
			ON L.id = R.submission_id
			WHERE id = $1
			`, jobId)
			if err != nil {
				fmt.Println(err)
				close(output)
				return
			}

			nRows := 0
			var results []Result
			for ok := rows.Next(); ok; ok = rows.Next() {
				var result Result
				if err := rows.Scan(&result.Hidden, &result.TestID, &result.TestName, &result.Score, &result.Msg); err != nil {
					fmt.Println(err)
					close(output)
					return
				}
				results = append(results, result)
				nRows++
			}
			if nRows == lastRows {
				lastEqual++
				if lastEqual > (REFRESH_MILLIS/1000)*20 {
					close(output)
					return
				}
			} else {
				lastRows = nRows
			}

			output <- results
		}
	}()
	return output
}

// Start a new work runner for controlling batch jobs.
func Start(ctx context.Context, store *sql.DB) *Runner {
	// Create a work queue for grading scripts, then spawn a task runner
	// to execute grading script jobs in parallel.
	occupied := make(chan bool, 5)
	queue := make(chan jobWithID, 5)

	runner := Runner{
		store:   store,
		queue:   queue,
		running: sync.Map{},
	}

	go func() {
		for jobAndID := range queue {
			occupied <- true
			conn, _ := store.Conn(ctx)
			results := make(chan Result, 5)
			go Grade(jobAndID.id, jobAndID.job, results)

			// For each result of the grading script, write it back to the database.
			go func(jobAndID jobWithID) {
				for result := range results {
					_, err := conn.ExecContext(ctx, `
					INSERT INTO Results (
						submission_id,
						test_id,
						hidden,
						test_name,
						score,
						message
					)
					VALUES ($1, $2, $3, $4, $5, $6)
					`, jobAndID.id,
						result.TestID,
						result.Hidden,
						result.TestName,
						result.Score,
						result.Msg)
					if err != nil {
						fmt.Println(err)
					}
				}

				// Writeback final results.
				if _, err := conn.ExecContext(ctx, `
				UPDATE Submissions
				SET points_earned = L.new_points
				FROM (
						SELECT SUM(score) AS new_points
						FROM Results
						WHERE submission_id = $1
				) L
				WHERE id = $1
				`, jobAndID.id); err != nil {
					fmt.Println(err)
				}
			}(jobAndID)
		}
	}()

	return &runner
}

// Channels are opened, fed objects from some other file.
func Grade(id string, job Job, results chan<- Result) {
	defer close(results)
	defer job.File.Close()

	// Create a temporary directory for running submissions.
	dir, err := os.MkdirTemp(os.TempDir(), "gradebetter-*")
	if err != nil {
		fmt.Println(err)
	}
	fmt.Println("Using directory ", dir)
	defer os.RemoveAll(dir)
	studentWorkFilePath := path.Join(dir, "work.tar.gz")
	tmpFile, _ := os.Create(studentWorkFilePath)
	defer tmpFile.Close()
	if _, err := io.Copy(tmpFile, job.File); err != nil {
		fmt.Println(err)
		return
	}

	// Execute grading script driver.
	cmd := exec.Command(job.Script, dir)
	output, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println(err)
		return
	}
	if err := cmd.Start(); err != nil {
		fmt.Println(err)
		return
	}

	// Parse the output of running the driver.
	parsed, err := parseOutput(output)
	if err != nil {
		fmt.Println(err)
		return
	}
	for result := range parsed {
		results <- result
	}
	if err := cmd.Wait(); err != nil {
		fmt.Println(err)
		return
	}
}
