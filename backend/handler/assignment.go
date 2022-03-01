package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/blockloop/scan"
	"github.com/labstack/echo/v4"
)

// Create a new assignment.
func CreateAssignment(cc echo.Context) error {
	c := cc.(*Context)

	// TODO: Put the grading script in another spot.
	submittedFile, err := c.FormFile("file")
	if err != nil {
		return c.String(http.StatusBadRequest, err.Error())
	}
	file, _ := submittedFile.Open()
	defer file.Close()

	assignmentName, dueDateStr, pointsStr := c.FormValue("name"), c.FormValue("dueDate"), c.FormValue("points")
	points, err := strconv.ParseFloat(pointsStr, 64)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	dueDate, err := strconv.ParseUint(dueDateStr, 10, 64)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	assignmentId := 0
	if err := c.Conn.QueryRowContext(c, `
	INSERT INTO Assignments (class, name, due_date, points)
	VALUES $1, $2, $3, $4
	RETURNING id
	`, c.Param("classId"), assignmentName, dueDate, points).Scan(&assignmentId); err != nil {
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

	return c.NoContent(http.StatusCreated)
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
	rows, err := c.Conn.QueryContext(c, `
	SELECT name, due_date, points
	FROM Assignments
	WHERE id = $1
		AND class = $2`, assignmentId, classId)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if err := scan.Row(&assignment, rows); err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	// Collect submission information.
	var submissions []struct {
		ID           string    `json:"id"`
		Date         time.Time `json:"date"`
		PointsEarned float64   `json:"pointsEarned"`
	}
	rows, err = c.Conn.QueryContext(c, `
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
