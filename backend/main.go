package main

import (
	"database/sql"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	_ "github.com/lib/pq"
)

// Context for all requests against the backend.
// Contains a connection to the postgres DB that is
// automatically closed with the context, and
// optionally includes user credentials, if they
// are logged in.
type Context struct {
	echo.Context
	conn  *sql.Conn
	token *JWT
}

// Description of claims made by our JWT.
type JWT struct {
	UserID uint `json:"id"`
	jwt.RegisteredClaims
}

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
			cc := &Context{
				Context: c,
				conn:    conn,
			}
			return next(cc)
		}
	})

	// Smoke test.
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "It works.")
	})

	// Login or create a user.
	e.POST("/login", LoginUser)
	e.POST("/user", Unimplemented)

	// Things that require the user to be logged in.
	classApi := e.Group("/class")
	classApi.Use(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(cc echo.Context) error {
			c := cc.(*Context)

			token, err := jwt.Parse(c.Request().Header.Get(echo.HeaderAuthorization), func(token *jwt.Token) (interface{}, error) {
				return []byte("secret"), nil
			})
			if err != nil {
				return c.NoContent(http.StatusUnauthorized)
			}
			c.token = token.Claims.(*JWT)
			e.Logger.Info(c.token)
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

// Log in an user to the backend, returning a JWT token.
func LoginUser(cc echo.Context) error {
	c := cc.(*Context)
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	c.Bind(&body)

	// Validate credentials.
	userId := uint(0)
	err := c.conn.QueryRowContext(c.Request().Context(),
		`SELECT id
	FROM Accounts
	WHERE username = $1
	AND password = crypt($2, password)`, body.Username, body.Password).Scan(&userId)
	if err != nil {
		return echo.ErrUnauthorized
	}

	// Create token with provided claims.
	claims := &JWT{
		UserID: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour * 24 * 30)),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	// Generate encoded token and send it as response.
	t, err := token.SignedString([]byte("secret"))
	if err != nil {
		return err
	}

	return c.JSON(http.StatusOK, echo.Map{
		"token": t,
	})
}
