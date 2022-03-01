package grading

import (
	"bufio"
	"errors"
	"io"
	"strconv"
	"strings"
)

func parseOutput(stdout io.Reader) ([]Result, error) {
	stdoutLines := bufio.NewScanner(stdout)
	results := make([]Result, 0)

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
		resultScore := float64(0)
		testIdStr := stdoutLines.Text()
		testId, err := strconv.Atoi(testIdStr)
		if err != nil {
			// testId not a valid number!
			return nil, err
		}

		msgLines := make([]string, 0)

	// Get all lines till an empty line is reached:
	scan:
		for stdoutLines.Scan() {
			text := stdoutLines.Text()
			textSplit := strings.Split(text, " ")

			switch textSplit[0] {
			case "":
				break scan
			case "HIDDEN":
				hidden = true
			case "NAME":
				// If there's at least a space after NAME, record it.
				// Otherwise, we say the name is an empty string.
				if len(text) >= 5 {
					testName = text[5:]
				}
			case "SCORE":
				if len(textSplit) != 3 {
					// Should be [SCORE NUM NUM]
					return nil, errors.New("wrong number of arguments after SCORE")
				}
				weight, err := strconv.ParseFloat(textSplit[1], 64)
				if err != nil {
					return nil, err
				}
				score, err := strconv.ParseFloat(textSplit[2], 64)
				if err != nil {
					return nil, err
				}
				resultScore = weight * score
			default:
				msgLines = append(msgLines, text)
			}
		}

		if resultScore == -1 {
			return nil, errors.New("no SCORE reported for test case " + testIdStr)
		}

		results = append(results, Result{
			Hidden:   hidden,
			TestID:   testId,
			TestName: testName,
			Msg:      strings.Join(msgLines, "\n"),
			Score:    resultScore,
		})
	}
	return results, nil
}
