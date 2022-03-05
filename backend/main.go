package main

import (
	"context"
	"database/sql"
	"flag"
	"fmt"
	"net/http"

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
	databaseFile     string
	secretKey        string
	port             string
	maxJobs          uint
	initializeTables bool
	resetTables      bool
)

func main() {
	// Sensible default values for parameters.
	flag.StringVar(&databaseFile, "c", "gradebetter.db", "sqlite database `filename`")
	flag.StringVar(&port, "p", "8080", "`port` to serve the HTTP server on")
	flag.StringVar(&secretKey, "k", "gradebetter", "secret `key` to use in JWT minting")
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

	e.Static("/", "build")
	e.File("/", "build/index.html")

	// Set up our database.
	db, err := sql.Open("sqlite3", fmt.Sprintf("file:%s?cache=shared&mode=rwc", databaseFile))
	if err != nil {
		e.Logger.Error(err)
		return
	}
	defer db.Close()

	e.Logger.Info("Initializing tables...")
	if err := schemas.Migrate(db, resetTables); err != nil {
		e.Logger.Error(err)
		return
	}
	e.Logger.Info("Done.")
	if resetTables {
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
	classApi.POST("/:classId/:assignmentId/upload", handler.UploadSubmission)
	classApi.POST("/:classId/invite", handler.CreateInvite)
	classApi.POST("/join", handler.EnrollStudent)

	// Websockets
	e.GET("/live/:submissionId", handler.LiveResults)

	// Start serving the backend on port 8080.
	e.Logger.Fatal(e.Start(":" + port))
}
