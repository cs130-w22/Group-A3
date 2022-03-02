package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/blockloop/scan"
	"github.com/labstack/echo/v4"
)

// Get listing of all information, assignments, etc. for a class.
// Requires one path parameter: classId. User must be authorized for
// this request.
func GetClass(cc echo.Context) error {
	c := cc.(*Context)

	classId := c.Param("classId")

	// Confirm that the user is in the class.
	if !c.InClass(classId) {
		return c.NoContent(http.StatusUnauthorized)
	}

	// Get the class' general information.
	className := ""
	if err := c.Conn.QueryRowContext(c, `
	SELECT name
	FROM Courses
	WHERE id = $1`, classId).Scan(&className); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	// Collect assignment information.
	var assignments []struct {
		ID      int       `json:"id"`
		Name    string    `json:"name"`
		DueDate time.Time `json:"dueDate"`
		Points  float64   `json:"points"`
	}
	rows, err := c.Conn.QueryContext(c, "SELECT id, name, due_date, points FROM Assignments WHERE class = $1", classId)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}
	if err := scan.Rows(&assignments, rows); err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	rows.Close()

	// Collect user information.
	var members []struct {
		ID       int    `json:"id"`
		Username string `json:"username"`
	}
	rows, err = c.Conn.QueryContext(c, `
	SELECT id, username
	FROM Accounts L
	JOIN ClassMembers R
	ON L.id = R.user_id
	WHERE R.class_id = $1
	AND L.deleted IS NULL`,
		classId)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if err := scan.Rows(&members, rows); err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	rows.Close()

	return c.JSON(http.StatusOK, echo.Map{
		"name":        className,
		"assignments": assignments,
		"members":     members,
	})
}

// Create a class in the backend.
func CreateClass(cc echo.Context) error {
	c := cc.(*Context)

	var body struct {
		Name string `json:"name"`
	}
	if err := c.Bind(&body); err != nil || body.Name == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	// Confirm that the user is a professor (and exists).
	professor := false
	if err := c.Conn.QueryRowContext(c, `
	SELECT professor
	FROM Accounts
	WHERE id = $1
	`, c.Claims.UserID).Scan(&professor); err != nil || !professor {
		return c.NoContent(http.StatusUnauthorized)
	}

	classId := 0
	err := c.Conn.QueryRowContext(c, `
	INSERT INTO Courses (name, owner)
	VALUES ($1, $2)
	RETURNING id
	`, body.Name, c.Claims.UserID).Scan(&classId)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"id": classId,
	})
}

// Create an invite to a given class. Expects a path parameter classId.
func CreateInvite(cc echo.Context) error {
	c := cc.(*Context)

	classId := c.Get("classId")
	var body struct {
		ValidUntil time.Time `json:"validUntil"`
	}
	if err := c.Bind(&body); err != nil || (body.ValidUntil == time.Time{}) || classId == "" {
		return c.NoContent(http.StatusBadRequest)
	}

	// Confirm that the user is a professor and owns the class.
	professor := false
	if err := c.Conn.QueryRowContext(c, `
	SELECT professor
	FROM Accounts L
	JOIN Courses R
	ON L.id = R.owner
	WHERE L.id = $1
		AND L.professor = 'true'
		AND R.id = $2
	`, c.Claims.UserID, classId).Scan(&professor); err != nil || !professor {
		return c.NoContent(http.StatusUnauthorized)
	}

	inviteCode := ""
	err := c.Conn.QueryRowContext(c, `
	INSERT INTO Invites (invites_to, expires, created_by)
	VALUES ($1, $2, $3)
	RETURNING id
	`, classId, body.ValidUntil, c.Claims.UserID).Scan(&inviteCode)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"inviteCode": inviteCode,
	})
}

// Drop a student from the class, or drop the own user.
func DropStudent(cc echo.Context) error {
	c := cc.(*Context)

	var body struct {
		ID string `json:"id"`
	}
	classId := c.Get("classId")
	if err := c.Bind(&body); err != nil || body.ID == "" {
		return c.NoContent(http.StatusBadRequest)
	}
	IDToDrop64, err := strconv.ParseUint(body.ID, 10, 32)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}
	IDToDrop := uint(IDToDrop64)

	// If the user to drop is themselves, the user must be a student,
	// not a professor.
	isProfessor := c.IsProfessor()
	if c.Claims.UserID == IDToDrop && isProfessor {
		return c.NoContent(http.StatusUnauthorized)
	}
	if c.Claims.UserID != IDToDrop && !isProfessor {
		return c.NoContent(http.StatusUnauthorized)
	}
	_, err = c.Conn.ExecContext(c, `
		DELETE FROM ClassMembers
		WHERE user_id = $1
			AND class_id = $2
		`, IDToDrop, classId)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.NoContent(http.StatusOK)
}
