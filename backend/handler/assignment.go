package handler

import (
	"net/http"
	"time"

	"github.com/blockloop/scan"
	"github.com/labstack/echo/v4"
)

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
	var assignment []struct {
		ID      int       `json:"id"`
		Name    string    `json:"name"`
		DueDate time.Time `json:"dueDate"`
		Points  float64   `json:"points"`
	}
	rows, err := c.Conn.QueryContext(c, `
	SELECT id, name, due_date, points
	FROM Assignments
	WHERE id = $1
		AND class = $2`, assignmentId, classId)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	scan.Rows(&assignment, rows)
	rows.Close()

	// Collect submission information.
	var submission []struct {
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
	scan.Rows(&submission, rows)
	rows.Close()

	return c.JSON(http.StatusOK, assignment)
}
