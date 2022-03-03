package main

import (
	"context"
	"database/sql"
	"flag"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/labstack/gommon/log"
	_ "github.com/mattn/go-sqlite3"

	"github.com/cs130-w22/Group-A3/backend/grading"
	"github.com/cs130-w22/Group-A3/backend/handler"
	"github.com/cs130-w22/Group-A3/backend/jwt"
	"github.com/cs130-w22/Group-A3/backend/schemas"
)

var (
	connString       string
	secretKey        string
	port             string
	maxJobs          uint
	initializeTables bool
	resetTables      bool
)

func main() {
	// Sensible default values for parameters.
	flag.StringVar(&connString, "c", "file:test.db?cache=shared&mode=rwc", "sqlite `connection string`")
	flag.StringVar(&port, "p", os.Getenv("PORT"), "`port` to serve the HTTP server on")
	flag.StringVar(&secretKey, "k", "", "secret `key` to use in JWT minting")
	flag.UintVar(&maxJobs, "j", 1, "Maximum number of concurrent test scripts running at a given time")
	flag.BoolVar(&initializeTables, "I", false, "Initialize SQLite schema then exit (if no prior database exists)")
	flag.BoolVar(&resetTables, "D", false, "Reset SQLite database schema then exit (DROP ALL TABLES)")
	flag.Parse()

	// Set the application's JWT secret key.
	jwt.UseKey([]byte(secretKey))

	// Configure the HTTP server.
	e := echo.New()
	e.HideBanner = true
	e.Logger.SetLevel(log.INFO)
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Set up our database.
	db, err := sql.Open("sqlite3", connString)
	if err != nil {
		e.Logger.Error(err)
		return
	}
	defer db.Close()

	if resetTables || initializeTables {
		e.Logger.Info("Migrating...")
		if err := schemas.Migrate(db, resetTables); err != nil {
			e.Logger.Error(err)
			return
		}
		e.Logger.Info("Done.")
		return
	}

	// Create a work queue for grading scripts, then spawn a task runner
	// to execute grading script jobs in parallel.
	runner := grading.Start(context.Background(), db)

	// Open a database connection for each request. Attach it
	// and a copy of the job queue channel.
	e.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(cc echo.Context) error {
			c := &handler.Context{
				Context: cc,
			}

			// Attach a database connection.
			conn, err := db.Conn(c)
			if err != nil {
				e.Logger.Errorf("Failed to open connection: %v", err)
				return c.NoContent(http.StatusInternalServerError)
			}
			c.Conn = conn

			// Attach the runner.
			c.Runner = runner
			return next(c)
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

	// Automatically capture the authentication token from a request
	// and apply it to the context of downstream request handlers.
	classApi.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(cc echo.Context) error {
			c := cc.(*handler.Context)
			claims, err := jwt.ParseClaims(c.Request().Header.Get(echo.HeaderAuthorization))
			if err != nil {
				return c.NoContent(http.StatusUnauthorized)
			}
			c.Claims = claims
			return next(c)
		}
	})
	classApi.POST("", handler.CreateClass)
	classApi.POST("/", handler.CreateClass)
	classApi.GET("/me", handler.GetUser)
	classApi.POST("/:classId/drop", handler.DropStudent)
	classApi.GET("/:classId/info", handler.GetClass)
	classApi.GET("/:classId/:assignmentId", handler.GetAssignment)
	classApi.POST("/:classId/assignment", handler.CreateAssignment)
	e.POST("/:classId/:assignmentId/script", Unimplemented)
	e.POST("/:classId/:assignmentId/upload", Unimplemented)
	classApi.POST("/:classId/invite", handler.CreateInvite)
	e.POST("/class/:classId/join", Unimplemented)

	// Websockets
	e.GET("/live/:submissionId", handler.LiveResults)

	// Start serving the backend on port 8080.
	e.Logger.Fatal(e.Start(":" + port))
}

// This endpoint hasn't been implemented yet!
func Unimplemented(c echo.Context) error {
	return nil
}
