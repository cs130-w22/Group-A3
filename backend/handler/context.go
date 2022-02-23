package handler

import (
	"database/sql"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/cs130-w22/Group-A3/backend/jwt"
)

// Context for all requests against the backend.
// Contains a connection to the postgres DB that is
// automatically closed with the context, and
// optionally includes user credentials, if they
// are logged in.
type Context struct {
	echo.Context
	Conn   *sql.Conn
	Claims *jwt.Claims
}

func (c Context) Deadline() (time.Time, bool) {
	return c.Request().Context().Deadline()
}

func (c Context) Done() <-chan struct{} {
	return c.Request().Context().Done()
}

func (c Context) Err() error {
	return c.Request().Context().Err()
}

func (c Context) Value(key interface{}) interface{} {
	return c.Request().Context().Value(key)
}

// Returns whether the user described in the provided JWT is, in fact, a professor.
func (c *Context) IsProfessor() bool {
	if c.Claims == nil {
		return false
	}

	isProfessor := false
	err := c.Conn.QueryRowContext(c, `
		SELECT professor
		FROM Accounts
		WHERE id = $1
	`, c.Claims.UserID).Scan(&isProfessor)
	if err != nil {
		return false
	}
	return isProfessor
}
