package main

import (
	"database/sql"
	"net/http"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"

	"github.com/cs130-w22/Group-A3/backend/handler"
)

var connString string

// Sensible default values for parameters.
func init() {
	connString = "host=localhost port=5432 dbname=gradebetter user=admin password=admin sslmode=disable"
}

func main() {
	e := echo.New()
	e.HideBanner = true
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Open a database connection for each request of concern.
	db, err := sql.Open("postgres", connString)
	if err != nil {
		e.Logger.Error("Failed to open DB")
	}
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			conn, err := db.Conn(c.Request().Context())
			if err != nil {
				e.Logger.Errorf("Failed to open connection: %v", err)
				return c.NoContent(http.StatusInternalServerError)
			}
			cc := &handler.Context{
				Context: c,
				Conn:    conn,
			}
			return next(cc)
		}
	})

	// Smoke test.
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "It works.")
	})

	// Login or create a user.
	e.POST("/login", handler.LoginUser)
	e.POST("/user", handler.CreateUser)

	// Things that require the user to be logged in.
	classApi := e.Group("/class")
	classApi.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(cc echo.Context) error {
			c := cc.(*handler.Context)

			token, err := jwt.Parse(c.Request().Header.Get(echo.HeaderAuthorization), func(token *jwt.Token) (interface{}, error) {
				return []byte("secret"), nil
			})
			if err != nil {
				return c.NoContent(http.StatusUnauthorized)
			}
			c.Token = token.Claims.(*handler.JWT)
			return next(c)
		}
	})
	e.GET("/class/:classId/info", Unimplemented)
	e.GET("/class/:classId/:assignmentId", Unimplemented)
	e.POST("/:classId/:assignmentId/script", Unimplemented)
	e.POST("/:classId/:assignmentId/upload", Unimplemented)
	e.POST("/class", Unimplemented)
	e.POST("/class/:classId/invite", Unimplemented)
	e.POST("/class/:classId/join", Unimplemented)

	// Start serving the backend on port 8080.
	e.Logger.Fatal(e.Start(":8080"))
}

// This endpoint hasn't been implemented yet!
func Unimplemented(c echo.Context) error {
	return nil
}
