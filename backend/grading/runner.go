package grading

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"database/sql"
	"fmt"
	"io"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

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
func (r *Runner) Results(ctx context.Context, jobId string) <-chan Result {
	output := make(chan Result, 5)
	go func() {
		conn, _ := r.store.Conn(ctx)
		ticker := time.NewTicker(500 * time.Millisecond)
		for range ticker.C {
			conn.QueryContext(ctx, `
			SELECT
				submitted_on,
				points_earned,
				test_id,
				hidden,
				test_name,
				score,
				message
			FROM Submissions L
			JOIN Results R
			ON L.id = R.submission_id
			WHERE id = $1
			`, jobId)
			output <- Result{
				Score: 100,
			}
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

			// TODO: For each result of the grading script, write it back to the database.
			go func() {
				for result := range results {
					conn.ExecContext(ctx, `
					INSERT INTO Results (test_id)
					VALUES $1
					`, result.TestID)
				}
			}()
		}
	}()

	return &runner
}

// Channels are opened, fed objects from some other file.
func Grade(id string, job Job, results chan<- Result) {
	defer close(results)

	// job.file will be hosted locally, somewhere.
	// Not going to worry about it here.
	zr, err := gzip.NewReader(job.File)
	if err != nil {
		return
	}
	defer zr.Close()
	tr := tar.NewReader(zr)

	// Stick to bigmoney pattern for creating the temp assignment directory.
	dirPfx := "./run"
	dir := path.Join(dirPfx, dirPfx+"-"+strings.ReplaceAll(id, "-", ""))
	if err := os.MkdirAll(dir, 0640); err != nil {
		panic(err)
	}
	defer os.RemoveAll(dir)

	for header, err := tr.Next(); err == nil; header, err = tr.Next() {
		tmpFile, err := os.Create(path.Join(dir, header.Name))
		if err != nil {
			fmt.Println(err)
		}
		if err := os.Chmod(tmpFile.Name(), 0640); err != nil {
			fmt.Println(err)
		}
		if _, err := io.Copy(tmpFile, tr); err != nil {
			fmt.Println(err)
		}
	}

	// Execute grading script driver.
	cmd := job.Script
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
	for _, result := range parsed {
		results <- result
	}
	if err := cmd.Wait(); err != nil {
		fmt.Println(err)
		return
	}
}
