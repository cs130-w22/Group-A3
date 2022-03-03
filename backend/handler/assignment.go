package handler

import (
	"encoding/json"
	"io"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/blockloop/scan"
	"github.com/cs130-w22/Group-A3/backend/grading"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
)

// Create a new assignment.
func CreateAssignment(cc echo.Context) error {
	c := cc.(*Context)

	assignmentName, dueDateStr, pointsStr := c.FormValue("name"), c.FormValue("dueDate"), c.FormValue("points")
	if strings.ContainsAny(assignmentName, "/.") {
		return c.String(http.StatusBadRequest, "'/' and '.' are not allowed in assignment names")
	}
	points, err := strconv.ParseFloat(pointsStr, 64)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	dueDate, err := strconv.ParseInt(dueDateStr, 10, 64)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// Create a new file for the assignment locally.
	submittedFile, err := c.FormFile("file")
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	file, err := submittedFile.Open()
	if err != nil {
		c.Logger().Error(file)
		return c.NoContent(http.StatusBadRequest)
	}
	defer file.Close()
	if err := os.MkdirAll("./assignments", 0644); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}
	outFile, err := os.Create("assignments/" + assignmentName)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}
	if _, err := io.Copy(outFile, file); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	assignmentId := 0
	if err := c.Conn.QueryRowContext(c, `
	INSERT INTO Assignments (class, name, due_date, points)
	VALUES ($1, $2, $3, $4)
	RETURNING id
	`, c.Param("classId"), assignmentName, time.UnixMilli(dueDate).Format("2006-01-01 00:00:00"), points).Scan(&assignmentId); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"id": assignmentId,
	})
}

func UploadSubmission(cc echo.Context) error {
	c := cc.(*Context)

	submittedFile, _ := c.FormFile("file")

	file, _ := submittedFile.Open()
	defer file.Close()

	return c.JSON(http.StatusCreated, echo.Map{
		"id": c.Runner.Add(grading.Job{
			File: file,
		})})
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
		ID           string    `json:"id"`
		Date         time.Time `json:"date"`
		PointsEarned float64   `json:"pointsEarned"`
	}
	rows, err := c.Conn.QueryContext(c, `
	SELECT id, submitted_on, points_earned
	FROM Submissions
	WHERE assignment = $1
		AND owner = $2`,
		assignmentId, c.Claims.UserID)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if err := scan.Rows(&submissions, rows); err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
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
			bytes, err := json.Marshal(result)
			if err != nil {
				c.Logger().Warn(err)
			}
			if err := websocket.Message.Send(ws, bytes); err != nil {
				c.Logger().Error(err)
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
