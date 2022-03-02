package grading

import (
	"io"
)

type Job struct {
	File io.Reader

	// Path to the script to run on the Job.
	Script string
}

// Result from a single test case in the grading script.
type Result struct {
	Hidden   bool    `json:"hidden"`
	TestID   int     `json:"testId"`
	TestName string  `json:"testName"`
	Score    float64 `json:"score"`
	Msg      string  `json:"msg"`
}
