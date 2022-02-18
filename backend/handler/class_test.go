package handler_test

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/cs130-w22/Group-A3/backend/handler"
	"github.com/cs130-w22/Group-A3/backend/jwt"
	"github.com/labstack/echo/v4"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestCreateClass(t *testing.T) {
	t.Run("missingContentTypeHeader", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		rec := httptest.NewRecorder()
		cc := e.NewContext(req, rec)
		c := &handler.Context{
			Context: cc,
		}
		if assert.NoError(t, handler.CreateClass(c)) {
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		}
	})
	t.Run("missingBody", func(t *testing.T) {
		e := echo.New()
		req := httptest.NewRequest(http.MethodPost, "/", nil)
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		cc := e.NewContext(req, rec)
		c := &handler.Context{
			Context: cc,
		}
		if assert.NoError(t, handler.CreateClass(c)) {
			assert.Equal(t, http.StatusBadRequest, rec.Code)
		}
	})
	t.Run("missingPerms", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		require.NoError(t, err)
		defer db.Close()

		userId := uint(1)
		className := "myclass"

		e := echo.New()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{ "name": "`+className+`" }`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		cc := e.NewContext(req, rec)
		c := &handler.Context{
			Context: cc,
			Claims: &jwt.Claims{
				UserID: userId,
			},
		}

		connection, err := db.Conn(c)
		require.NoError(t, err)
		c.Conn = connection

		mock.ExpectQuery("SELECT").WithArgs(userId).WillReturnRows(sqlmock.NewRows([]string{"professor"}).AddRow(false))
		if assert.NoError(t, handler.CreateClass(c)) {
			assert.Equal(t, http.StatusUnauthorized, rec.Code)
		}
	})
	t.Run("correctPerms", func(t *testing.T) {
		db, mock, err := sqlmock.New()
		require.NoError(t, err)
		defer db.Close()

		userId := uint(1)
		className := "myclass"
		newClassId := 1

		e := echo.New()
		req := httptest.NewRequest(http.MethodPost, "/", strings.NewReader(`{ "name": "`+className+`" }`))
		req.Header.Set(echo.HeaderContentType, echo.MIMEApplicationJSON)
		rec := httptest.NewRecorder()
		cc := e.NewContext(req, rec)
		c := &handler.Context{
			Context: cc,
			Claims: &jwt.Claims{
				UserID: userId,
			},
		}

		connection, err := db.Conn(c)
		require.NoError(t, err)
		c.Conn = connection

		mock.ExpectQuery("SELECT").WithArgs(userId).WillReturnRows(sqlmock.NewRows([]string{"professor"}).AddRow(true))
		mock.ExpectQuery("INSERT INTO Classes").WithArgs(className, userId).WillReturnRows(sqlmock.NewRows([]string{"id"}).AddRow(newClassId))
		assert.NoError(t, handler.CreateClass(c))
	})
}
