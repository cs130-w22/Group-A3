package main

import (
	"database/sql"
	"flag"
	"net/http"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"

	"github.com/cs130-w22/Group-A3/backend/grading"
	"github.com/cs130-w22/Group-A3/backend/handler"
	"github.com/cs130-w22/Group-A3/backend/jwt"
)

var (
	connString string
	secretKey  string
	port       string
	maxJobs    uint
)

func main() {
	// Sensible default values for parameters.
	flag.StringVar(&connString, "c", "host=localhost port=5432 dbname=gradebetter user=admin password=admin sslmode=disable", "postgres connection string")
	flag.StringVar(&port, "p", os.Getenv("PORT"), "`port` to serve the HTTP server on")
	flag.StringVar(&secretKey, "k", "", "secret `key` to use in JWT minting")
	flag.UintVar(&maxJobs, "j", 1, "Maximum number of concurrent test scripts running at a given time.")
	flag.Parse()

	// Set the application's JWT secret key.
	jwt.UseKey([]byte(secretKey))

	// Configure the HTTP server.
	e := echo.New()
	e.HideBanner = true
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Create a work queue for grading scripts, then spawn a task runner
	// to execute grading script jobs in parallel.
	jobQueue := make(chan grading.Job, maxJobs)
	go func() {
		occupied := make(chan bool, maxJobs)
		for job := range jobQueue {
			occupied <- true
			go grading.Grade(job, occupied)
		}
	}()

	// Open a database connection for each request. Attach it
	// and a copy of the job queue channel.
	db, err := sql.Open("postgres", connString)
	if err != nil {
		e.Logger.Error("Failed to open DB")
	}
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

			// Attach the job queue.
			c.JobQueue = jobQueue
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
	e.POST("/:classId/:assignmentId/script", Unimplemented)
	e.POST("/:classId/:assignmentId/upload", Unimplemented)
	classApi.POST("/:classId/invite", handler.CreateInvite)
	e.POST("/class/:classId/join", Unimplemented)

	// Start serving the backend on port 8080.
	e.Logger.Fatal(e.Start(":" + port))
}

// This endpoint hasn't been implemented yet!
func Unimplemented(c echo.Context) error {
	return nil
}
