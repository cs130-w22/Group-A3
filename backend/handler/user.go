package handler

import (
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
)

// Create token with provided claims.
func createToken(userId uint) (string, error) {
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
			return "", err
		}
		return t, nil
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

	// Validate credentials.
	userId := uint(0)
	err := c.Conn.QueryRowContext(c.Request().Context(),
		`SELECT id
	FROM Accounts
	WHERE username = $1
	AND password = crypt($2, password)`, body.Username, body.Password).Scan(&userId)
	if err != nil {
		return echo.ErrUnauthorized
	}

	token, err := createToken(userId)
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
		Type string `json:"type"`
		Username string `json:"username"`
		Password string `json:"password"`
	}
	if err := c.Bind(&body); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusBadRequest)
	}

	userId := uint(0)
	err := c.Conn.QueryRowContext(c.Request().Context(), `
	INSERT INTO Accounts (username, password, professor)
	VALUES ($1, $2, $3)
	RETURNING *
	`, body.Username, body.Password, body.Type == "professor").Scan(&userId)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	token, err := createToken(userId)
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"token": token,
	})
}