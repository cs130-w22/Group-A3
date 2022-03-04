package grading

import (
	"io"
	"os/exec"
)

type Job struct {
	File io.ReadCloser

	// Path to the script to run on the Job.
	Script *exec.Cmd
}

// Result from a single test case in the grading script.
type Result struct {
	Hidden   bool    `json:"hidden"`
	TestID   int     `json:"testId"`
	TestName string  `json:"testName"`
	Score    float64 `json:"score"`
	Msg      string  `json:"msg"`
}
