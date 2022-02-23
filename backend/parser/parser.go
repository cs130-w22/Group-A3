package main

import (	
	"archive/tar"
	"bufio"
	"compress/gzip"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"os"
	"os/exec"
	"path"
	"strconv"
	"strings"
)

type Job struct {
	id			string
	file 		io.Reader
	assignment	string
}

type Result struct {
	Hidden 		bool
	TestID 		int
	TestName 	string
	Score 		float64
	Msg 		string
}

// Channels are opened, fed objects from some other file.
// Might not need a db connection if assignment file is passed in through the Job.
func gradingScript(db *sql.Conn, job Job, results chan<- Result, jobQueue <-chan bool) error {
	defer func() { <-jobQueue }()
	
	// job.file will be hosted locally, somewhere.
	// Not going to worry about it here.
	zr, err := gzip.NewReader(job.file)
	if err != nil {
		return err
	}
	defer zr.Close()
	tr := tar.NewReader(zr)

	// Stick to bigmoney pattern for creating the temp assignment directory.
	dirPfx := "./run"
	dir := path.Join(dirPfx, dirPfx+"-"+strings.ReplaceAll(job.id, "-", ""))
	if err := os.MkdirAll(dir, 0640); err != nil {
		panic(err)
	}
	defer os.RemoveAll(dir)

	for header, err := tr.Next(); err == nil; header, err = tr.Next() {
		tmpFile, err := os.Create(path.Join(dir, header.Name))
		os.Chmod(tmpfile.Name(), 0640)
		if err != nil {
			fmt.Println(err)
		}
		if _, err := io.Copy(tmpFile, tr); err != nil {
			fmt.Println(err)
		}
	}

	// Execute grading script driver.
	cmd := exec.Command(config.GradingScript, dir)
	output, err := cmd.StdoutPipe()
	if err != nil {
		return err
	}
	if err := cmd.Start(); err != nil {
		return err
	}
	
	// Parse the output of running the driver.
	parsed, err := parseOutput(output)
	if err != nil {
		return err
	}
	for _, result := range parsed {
		results <- result
	}
	if err := cmd.Wait(); err != nil {
		return err
	}
	return nil
}

func parseOutput(stdout io.Reader) ([]Result, error) {
	stdoutLines := bufio.NewScanner(stdout)
	result := make([]Result, 0)

	// Each test case should be of the format:
	// ### 		(Test ID)
	// HIDDEN 	(if hidden)
	//   	 	(if HIDDEN, then only score is required)
	// NAME TestName
	//   	 	(if NAME is omitted, then all text until the score is treated as a message)
	// Message
	// SCORE 	(Score)
	for stdoutLines.Scan() {
		hidden := false
		testName := ""
		resultScore := float64(-1)
		msg := ""
		testIdStr := stdoutLines.Text()
		testId, err := strconv.Atoi(testIdStr)
		if err != nil {
			// testId not a valid number!
			return nil, err
		}

		msgLines := make([]string, 0)

		// Get all lines till an empty line is reached:
		for stdoutLines.Scan() {
			text := stdoutLines.Text()
			textSplit := strings.Split(text, " "); 

			switch textSplit[0] {
			case "":
				break
			case "HIDDEN":
				hidden = true
			case "NAME":
				// If there's at least a space after NAME...
				if len(testName) >= 5 {
					testName = text[5:]
				}
			case "SCORE":
				if len(textSplit) != 3 {
					// Should be [SCORE NUM NUM]
					return nil, errors.New("Wrong number of arguments after SCORE")
				}
				weight, err := strconv.ParseFloat(textSplit[1], 64)
				if err != nil {
					return nil, err
				}
				score, err := strconv.ParseFloat(textSplit[2], 64)
				if err != nil {
					return nil, err
				}
				resultScore += weight * score
			default:
				msgLines = append(msgLines, text)
			}
		}

		if resultsScore == -1 {
			return nil, errors.New("No SCORE reported for test case " + testIdStr)
		}

		results = append(results, Result{
			Hidden: 	hidden,
			TestID: 	testId,
			TestName: 	testName,
			Msg:      	strings.Join(msgLines, "\n"),
			Score:    	resultScore,
		})
	}
	return results, nil
}