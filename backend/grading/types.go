package grading

import (
	"io"
)

type Job struct {
	ID   string
	File io.Reader

	// Path to the script to run on the Job.
	Script string

	// Channel to send results down to the Job requester.
	Results chan<- Result
}

// Result from a single test case in the grading script.
type Result struct {
	Hidden   bool
	TestID   int
	TestName string
	Score    float64
	Msg      string
}
