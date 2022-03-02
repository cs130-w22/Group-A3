package handler

import (
	"encoding/base64"
	"math/rand"
	"net/http"

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
