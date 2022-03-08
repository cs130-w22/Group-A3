package handler

import (
	"os"

	"net/http"
	"net/http/httptest"
	"github.com/labstack/echo/v4"

	"strings"
	"fmt"

	"encoding/json"

	"database/sql"
	_ "github.com/mattn/go-sqlite3"

	"testing"
	"github.com/stretchr/testify/assert"

	"github.com/cs130-w22/Group-A3/backend/schemas"
	"github.com/cs130-w22/Group-A3/backend/jwt"
)

var (
	userJSON = `{"type":"professor","username":"VideoKojima","password":"12345"}`
	classJSON = `{"name":"MGS3"}`
	tokenString = ""
	db *sql.DB
)

type Token struct {
	Token string
}

func TestCreateUser(t *testing.T) {
	// First, get token from CreateUser:
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost,"/",strings.NewReader(userJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	////// SETUP CONTEXT //////
	cc := e.NewContext(req, rec)
	c := &Context{
		Context: cc,
	}

	// Set up our database.
	db, _ = sql.Open("sqlite3", "file:handlertest.db?cache=shared&mode=rwc")
	serr := schemas.Migrate(db, false)
	if serr != nil {
		fmt.Println(serr)
		return
	}

	// Attach a database connection.
	conn, _ := db.Conn(c)
	c.Conn = conn
	///////////////////////////

	assert.NoError(t, CreateUser(c))
	assert.Equal(t, rec.Code, http.StatusCreated)
	tokenString = rec.Body.String()
}

func TestGetUser(t *testing.T) {
	// Extract token from CreateUser() call and pass to GetUser():
	e := echo.New()
	var token Token
	uerr := json.Unmarshal([]byte(tokenString), &token)
	if uerr != nil {
		fmt.Println(uerr)
		return
	}

	req := httptest.NewRequest(http.MethodGet,"/",nil)
	rec := httptest.NewRecorder()
	
	////// SETUP CONTEXT //////
	cc := e.NewContext(req, rec)
	c := &Context{
		Context: cc,
	}

	// Attach a database connection.
	conn, _ := db.Conn(c)
	c.Conn = conn
	c.Claims, _ = jwt.ParseClaims(token.Token)
	///////////////////////////

	assert.NoError(t, GetUser(c))
	assert.Equal(t, rec.Code, http.StatusOK)
	assert.Equal(
		t, 
		rec.Body.String(),
		`{"id":1,"username":"VideoKojima","professor":true,"classes":null,"assignments":null}` + "\n",
	)
}

func TestCreateClass(t *testing.T) {
	e := echo.New()
	req := httptest.NewRequest(http.MethodPost,"/",strings.NewReader(classJSON))
	req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
	rec := httptest.NewRecorder()

	var token Token
	uerr := json.Unmarshal([]byte(tokenString), &token)	
	if uerr != nil {
		fmt.Println(uerr)
		return
	}

	////// SETUP CONTEXT //////
	cc := e.NewContext(req, rec)
	c := &Context{
		Context: cc,
	}

	// Attach a database connection.
	conn, _ := db.Conn(c)
	c.Conn = conn
	c.Claims, _ = jwt.ParseClaims(token.Token)
	///////////////////////////

	assert.NoError(t, CreateClass(c))
	assert.Equal(t, rec.Code, http.StatusCreated)
	assert.Equal(
			t, 
			rec.Body.String(),
			`{"id":1}` + "\n",
		)
}

func TestCleanup(t *testing.T) {
	db.Close()
	os.Remove("handlertest.db")
}