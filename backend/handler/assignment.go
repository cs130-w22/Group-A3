package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/cs130-w22/Group-A3/backend/grading"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
)

// Create a new assignment.
func CreateAssignment(cc echo.Context) error {
	c := cc.(*Context)

	assignmentName, dueDateStr, path := c.FormValue("name"), c.FormValue("dueDate"), c.FormValue("path")
	dueDate, err := strconv.ParseInt(dueDateStr, 10, 64)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// TODO: parse output of --summary option to get test case information.
	assignmentId := 0
	if err := c.Conn.QueryRowContext(c, `
	INSERT INTO Assignments (class, name, due_date, points, script_path)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id
	`, c.Param("classId"), assignmentName, time.UnixMilli(dueDate).Format("2006-01-01 00:00:00"), 100, path).Scan(&assignmentId); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"id": assignmentId,
	})
}

func UploadSubmission(cc echo.Context) error {
	c := cc.(*Context)

	// TODO: check that user is able to submit to the assignment.

	assignmentId := c.Param("assignmentId")
	submittedFile, err := c.FormFile("file")
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusBadRequest)
	}

	file, err := submittedFile.Open()
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	// Script to execute
	scriptPath := ""
	if err := c.Conn.QueryRowContext(c, `
	SELECT script_path
	FROM Assignments
	WHERE id = $1`, assignmentId).Scan(&scriptPath); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusBadRequest)
	}

	uid := c.Runner.Add(grading.Job{
		File:   file,
		Script: scriptPath,
	})

	if _, err := c.Conn.ExecContext(c, `
	INSERT INTO Submissions (id, assignment, owner)
	VALUES ($1, $2, $3)`, uid, assignmentId, c.Claims.UserID); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"id": uid,
	})
}

// Get information about an assignment.
// Requires two path parameters: classId and assignmentId.
func GetAssignment(cc echo.Context) error {
	c := cc.(*Context)

	classId, assignmentId := c.Param("classId"), c.Param("assignmentId")

	// Confirm that the user is in the class.
	if !c.InClass(classId) {
		return c.NoContent(http.StatusUnauthorized)
	}

	// Collect assignment information.
	var assignment struct {
		Name    string    `json:"name"`
		DueDate time.Time `json:"dueDate"`
		Points  float64   `json:"points"`
	}
	err := c.Conn.QueryRowContext(c, `
	SELECT name, due_date, points
	FROM Assignments
	WHERE id = $1
		AND class = $2`, assignmentId, classId).Scan(&assignment.Name, &assignment.DueDate, &assignment.Points)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	// Collect submission information.
	var submissions []struct {
		ID            string    `json:"id"`
		OwnerUsername string    `json:"owner"`
		Date          time.Time `json:"date"`
		PointsEarned  float64   `json:"pointsEarned"`
	}
	rows, err := c.Conn.QueryContext(c, `
	SELECT R.id AS id, username, submitted_on, points_earned
	FROM Accounts L
	JOIN Submissions R
		ON L.id = R.owner
	WHERE R.assignment = $1
		AND (L.id = $2 OR $3)`,
		assignmentId, c.Claims.UserID, c.IsProfessor())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	for ok := rows.Next(); ok; ok = rows.Next() {
		id, owner, date, points := "", "", time.Time{}, float64(0)
		rows.Scan(&id, &owner, &date, &points)
		submissions = append(submissions, struct {
			ID            string    "json:\"id\""
			OwnerUsername string    "json:\"owner\""
			Date          time.Time "json:\"date\""
			PointsEarned  float64   "json:\"pointsEarned\""
		}{id, owner, date, points})
	}
	rows.Close()

	return c.JSON(http.StatusOK, echo.Map{
		"professor":   c.IsProfessor(),
		"name":        assignment.Name,
		"dueDate":     assignment.DueDate,
		"points":      assignment.Points,
		"submissions": submissions,
	})
}

// Get a live feed of results for the given submission ID.
func LiveResults(cc echo.Context) error {
	c := cc.(*Context)

	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		// Receive submission ID
		submissionId := c.Param("submissionId")

		// Fetch the results channel and begin relaying results.
		for result := range c.Runner.Results(c, submissionId) {
			if err := websocket.JSON.Send(ws, result); err != nil {
				c.Logger().Error(err)
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
