package handler

import (
	"database/sql"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
)

// Context for all requests against the backend.
// Contains a connection to the postgres DB that is
// automatically closed with the context, and
// optionally includes user credentials, if they
// are logged in.
type Context struct {
	echo.Context
	Conn  *sql.Conn
	Token *JWT
}

// Description of claims made by our JWT.
type JWT struct {
	UserID uint `json:"id"`
	jwt.RegisteredClaims
}
