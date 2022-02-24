package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

// Upload a file to the server, spawning a new submission job.
func UploadSubmission(cc echo.Context) error {
	c := cc.(*Context)

	submittedFile, _ := c.FormFile("file")

	file, _ := submittedFile.Open()
	defer file.Close()

	return c.NoContent(http.StatusCreated)
}
