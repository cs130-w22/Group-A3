package handler

import (
	"encoding/base64"
	"math/rand"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/argon2"

	"github.com/cs130-w22/Group-A3/backend/jwt"
)

func randBytes(size int) (blk []byte, err error) {
	blk = make([]byte, size)
	_, err = rand.Read(blk)
	return
}

// Compute the hash from a hash and salt pair.
func computeHashed(password, salt string) string {
	decode, _ := base64.StdEncoding.DecodeString(password)
	decodeSalt, _ := base64.StdEncoding.DecodeString(salt)
	hashed := argon2.Key(decode, decodeSalt, 1, 64*1024, 4, 32)
	return base64.StdEncoding.EncodeToString(hashed)
}

// Create a new hash and salt pair for a given password.
func generateHashSalt(password string) (hash string, salt string) {
	decode, _ := base64.StdEncoding.DecodeString(password)
	saltBytes, _ := randBytes(64)
	hash = base64.StdEncoding.EncodeToString(argon2.Key(decode, saltBytes, 1, 64*1024, 4, 32))
	salt = base64.StdEncoding.EncodeToString(saltBytes)
	return
}

// Log in an user to the backend, returning a JWT token.
func LoginUser(cc echo.Context) error {
	c := cc.(*Context)
	var body struct {
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.Bind(&body); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// Get salt, then validate credentials.
	salt := ""
	if err := c.Conn.QueryRowContext(c,
		`SELECT salt
	FROM Accounts
	WHERE username = $1`, body.Username).Scan(&salt); err != nil {
		return c.NoContent(http.StatusNotFound)
	}
	computed := computeHashed(body.Password, salt)

	userId := uint(0)
	if err := c.Conn.QueryRowContext(c,
		`SELECT id
	FROM Accounts
	WHERE username = $1
	AND password = $2`, body.Username, computed).Scan(&userId); err != nil {
		c.Logger().Error(err)
		return echo.ErrUnauthorized
	}

	token, err := jwt.EncodeClaims(userId)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, echo.Map{
		"token": token,
	})
}

func CreateUser(cc echo.Context) error {
	c := cc.(*Context)
	var body struct {
		Type     string `json:"type"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.Bind(&body); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusBadRequest)
	}

	// Generate salt.
	hashed, salt := generateHashSalt(body.Password)

	userId := uint(0)
	err := c.Conn.QueryRowContext(c, `
	INSERT INTO Accounts (username, password, salt, professor)
	VALUES ($1, $2, $3, $4)
	RETURNING id
	`, body.Username, hashed, salt, body.Type == "professor").Scan(&userId)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	token, err := jwt.EncodeClaims(userId)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"token": token,
	})
}

// Get all relevant information about the logged-in user.
func GetUser(cc echo.Context) error {
	c := cc.(*Context)

	var response struct {
		ID        int    `json:"id"`
		Username  string `json:"username"`
		Professor bool   `json:"professor"`
		Classes   []struct {
			ID   int    `json:"id"`
			Name string `json:"name"`
		} `json:"classes"`
		Assignments []struct {
			ID             int       `json:"id"`
			Class          int       `json:"class"`
			Name           string    `json:"name"`
			DueDate        time.Time `json:"dueDate"`
			PointsPossible float64   `json:"pointsPossible"`
		} `json:"assignments"`
	}
	response.ID = int(c.Claims.UserID)

	// Get username and professor status.
	if err := c.Conn.QueryRowContext(c, `
	SELECT username, professor
	FROM Accounts
	WHERE id = $1
	`, c.Claims.UserID).Scan(&response.Username, &response.Professor); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusNotFound)
	}

	// Get all class information.
	rows, err := c.Conn.QueryContext(c, `
	SELECT L.class_id AS id, R.name AS name
	FROM ClassMembers L
	JOIN Courses R
	ON L.class_id = R.id
	WHERE L.user_id = $1
	`, c.Claims.UserID)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}
	for ok := rows.Next(); ok; ok = rows.Next() {
		id := 0
		name := ""
		if err := rows.Scan(&id, &name); err != nil {
			c.Logger().Error(err)
		}
		response.Classes = append(response.Classes, struct {
			ID   int    "json:\"id\""
			Name string "json:\"name\""
		}{id, name})
	}

	// Get all assignment information for classes the student is in.
	rows, err = c.Conn.QueryContext(c, `
	SELECT id, class, name, due_date, points
	FROM Assignments L
	JOIN ClassMembers R
	ON L.class = R.class_id
	WHERE R.user_id = $1
	`, c.Claims.UserID)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}
	for ok := rows.Next(); ok; ok = rows.Next() {
		id, class, name, dueDate, points := 0, 0, "", time.Time{}, float64(0)
		if err := rows.Scan(&id, &class, &name, &dueDate, &points); err != nil {
			c.Logger().Error(err)
		}
		response.Assignments = append(response.Assignments, struct {
			ID             int       "json:\"id\""
			Class          int       "json:\"class\""
			Name           string    "json:\"name\""
			DueDate        time.Time "json:\"dueDate\""
			PointsPossible float64   "json:\"pointsPossible\""
		}{id, class, name, dueDate, points})
	}

	return c.JSON(http.StatusOK, &response)
}
