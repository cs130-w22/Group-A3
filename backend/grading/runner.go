package grading

import (
	"archive/tar"
	"compress/gzip"
	"context"
	"database/sql"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path"
	"strings"
	"sync"

	"github.com/google/uuid"
)

type Runner struct {
	Store sql.Conn
	queue chan jobWithID
}

// A job in progress - cached.
type JobManager struct {
	sync.Mutex
	liveResults   <-chan Result
	cachedResults []Result
	listeners     []chan<- Result
}

type jobWithID struct {
	job Job
	id  string
}

func (j *JobManager) addListener(listener chan<- Result) {
	j.Lock()
	defer j.Unlock()

	// Add a listener to the JobManager.
	j.listeners = append(j.listeners, listener)

	// Write existing results to keep up to date.
	for _, result := range j.cachedResults {
		listener <- result
	}
}

func startJob(ctx context.Context, id string, j Job, writeback *sql.Conn) *JobManager {
	// TODO: if the job has already run, then a SQL query will return the results
	// of the submission. In this case, we can just write back all the pre-run
	// results to the user.

	live := make(chan Result, 10)
	go Grade(id, j, live)

	progress := JobManager{
		liveResults:   live,
		cachedResults: nil,
		listeners:     nil,
	}

	go func() {
		// For each result we receive, cache it.
		for result := range live {
			progress.Lock()
			progress.cachedResults = append(progress.cachedResults, result)
			progress.Unlock()
		}

		// When the channel closes, writeback.
		// TODO: use sqlx to prepare from cache slice
		insertion := `
			INSERT INTO Results (submission_id, test_id, hidden, test_name, score, message)
			VALUES ($1, :TestID, :Hidden, :TestName, :Score, :Msg),
		`
		writeback.ExecContext(ctx, insertion)
	}()

	return &progress
}

// Add a job to the runner, returning its job ID.
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
func (r *Runner) Results(jobId string) <-chan Result {
	// TODO: add subscriber to job ID.
	return nil
}

// Start a new work runner.
func Start(ctx context.Context, store *sql.DB) Runner {
	// Create a work queue for grading scripts, then spawn a task runner
	// to execute grading script jobs in parallel.
	occupied := make(chan bool, 5)
	queue := make(chan Job, 5)
	go func() {
		for job := range queue {
			occupied <- true
			conn, _ := store.Conn(ctx)
			jobId := uuid.NewString()
			startJob(ctx, jobId, job, conn)
			<-occupied
		}
	}()

	return Runner{}
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
	for _, result := range parsed {
		results <- result
	}
	if err := cmd.Wait(); err != nil {
		fmt.Println(err)
		return
	}
}
