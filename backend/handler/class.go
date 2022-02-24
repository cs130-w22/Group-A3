package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
)

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
	INSERT INTO Classes (name, owner)
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
	JOIN Classes R
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
