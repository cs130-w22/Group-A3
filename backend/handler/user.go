package handler

import (
	"net/http"
	"time"

	"github.com/blockloop/scan"
	"github.com/labstack/echo/v4"

	"github.com/cs130-w22/Group-A3/backend/jwt"
)

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

	// Validate credentials.
	userId := uint(0)
	err := c.Conn.QueryRowContext(c,
		`SELECT id
	FROM Accounts
	WHERE username = $1
	AND password = crypt($2, password)`, body.Username, body.Password).Scan(&userId)
	if err != nil {
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

	userId := uint(0)
	err := c.Conn.QueryRowContext(c, `
	INSERT INTO Accounts (username, password, professor)
	VALUES ($1, $2, $3)
	RETURNING id
	`, body.Username, body.Password, body.Type == "professor").Scan(&userId)
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
		return c.NoContent(http.StatusNotFound)
	}

	// Get all class information.
	rows, err := c.Conn.QueryContext(c, `
	SELECT class_id, name
	FROM ClassMembers L
	JOIN Classes R
	ON L.class_id = R.id
	WHERE L.user_id = $1
	`, c.Claims.UserID)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	if err := scan.Rows(&response.Classes, rows); err != nil {
		return c.NoContent(http.StatusInternalServerError)
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
		return c.NoContent(http.StatusInternalServerError)
	}
	if err := scan.Rows(&response.Assignments, rows); err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusOK, &response)
}
