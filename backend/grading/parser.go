package grading

import (
	"bufio"
	"errors"
	"io"
	"strconv"
	"strings"
)

func parseOutput(stdout io.Reader) (<-chan Result, error) {
	stdoutLines := bufio.NewScanner(stdout)
	results := make(chan Result, 5)

	go func() error {

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
			foundScore := false
			resultScore := float64(0)
			testIdStr := stdoutLines.Text()
			testId, err := strconv.Atoi(testIdStr)
			if err != nil {
				// testId not a valid number!
				return err
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
					// If there's at least a space after NAME...
					if len(text) >= 5 {
						testName = text[5:]
					}
				case "SCORE":
					if len(textSplit) != 3 {
						// Should be [SCORE NUM NUM]
						return errors.New("wrong number of arguments after SCORE")
					}
					weight, err := strconv.ParseFloat(textSplit[1], 64)
					if err != nil {
						return err
					}
					score, err := strconv.ParseFloat(textSplit[2], 64)
					if err != nil {
						return err
					}
					foundScore = true
					resultScore = weight * score
				default:
					msgLines = append(msgLines, text)
				}
			}

			if !foundScore {
				return errors.New("no SCORE reported for test case " + testIdStr)
			}

			results <- Result{
				Hidden:   hidden,
				TestID:   testId,
				TestName: testName,
				Msg:      strings.Join(msgLines, "\n"),
				Score:    resultScore,
			}
		}
		close(results)
		return nil
	}()
	return results, nil
}
