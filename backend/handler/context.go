package handler

import (
	"database/sql"

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
	Conn  *sql.Conn
	Token *jwt.Claims
}
