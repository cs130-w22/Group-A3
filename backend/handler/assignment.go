package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/cs130-w22/Group-A3/backend/grading"
	"github.com/labstack/echo/v4"
	"golang.org/x/net/websocket"
)

//@Summary Create a new assignment.
//@Description Create a new assignment
//@Tags Users (Professors, TAs)
//@Accept json
//@Param name body string true "{"name": "My cool class"}"
//@Success 201 {created}
//@Produce json { "id": "new_class_id"}
//Failure 400 {bad request}, 401 {Unauthorized}, 500 {server error}
//Router POST /class
func CreateAssignment(cc echo.Context) error {
	c := cc.(*Context)

	assignmentName, dueDateStr, path := c.FormValue("name"), c.FormValue("dueDate"), c.FormValue("path")
	dueDate, err := strconv.ParseInt(dueDateStr, 10, 64)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// TODO: parse output of --summary option to get test case information.
	assignmentId := 0
	if err := c.Conn.QueryRowContext(c, `
	INSERT INTO Assignments (class, name, due_date, points, script_path)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING id
	`, c.Param("classId"), assignmentName, time.UnixMilli(dueDate).Format("2006-01-01 00:00:00"), 100, path).Scan(&assignmentId); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"id": assignmentId,
	})
}

//@Summary Upload a submission.
//@Description Upload a submission
//@Tags Users (Students)
//@Accept json
//@Param assignment ID, request body <input type="file" name="file">
//@Success 204 {OK. Assignment has been uploaded successfully.}
//@Produce none
//Failure 400 {bad request}, 401 {Unauthorized}, 500 {server error}
//Router POST //<class_id>/<assignment_id>/upload
func UploadSubmission(cc echo.Context) error {
	c := cc.(*Context)

	// TODO: check that user is able to submit to the assignment.

	assignmentId := c.Param("assignmentId")
	submittedFile, err := c.FormFile("file")
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusBadRequest)
	}

	file, err := submittedFile.Open()
	if err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	// Script to execute
	scriptPath := ""
	if err := c.Conn.QueryRowContext(c, `
	SELECT script_path
	FROM Assignments
	WHERE id = $1`, assignmentId).Scan(&scriptPath); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusBadRequest)
	}

	uid := c.Runner.Add(grading.Job{
		File:   file,
		Script: scriptPath,
	})

	if _, err := c.Conn.ExecContext(c, `
	INSERT INTO Submissions (id, assignment, owner)
	VALUES ($1, $2, $3)`, uid, assignmentId, c.Claims.UserID); err != nil {
		c.Logger().Error(err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.JSON(http.StatusCreated, echo.Map{
		"id": uid,
	})
}

// Get information about an assignment.
// Requires two path parameters: classId and assignmentId.
//@Summary Get information about an assignment, such as name, DueDate, and how many points its worth
//@Description Get information about an assignment.
//@Tags Users
//@Accept json
//@Param assignment ID, class ID
//@Success 200 {OK}
//@Produce Json, Response Format: {"name": "Cool assigment one", "dueDate": "1647205512354","points": 100.0,"submissions": [{"date": "1643663222161", "pointsEarned": 100.0}]}
//Failure 400 {bad request}, 401 {Unauthorized}, 500 {server error}
//Router GET /class/<class_id>/<assignment_id>
func GetAssignment(cc echo.Context) error {
	c := cc.(*Context)

	classId, assignmentId := c.Param("classId"), c.Param("assignmentId")

	// Confirm that the user is in the class.
	if !c.InClass(classId) {
		return c.NoContent(http.StatusUnauthorized)
	}

	// Collect assignment information.
	var assignment struct {
		Name    string    `json:"name"`
		DueDate time.Time `json:"dueDate"`
		Points  float64   `json:"points"`
	}
	err := c.Conn.QueryRowContext(c, `
	SELECT name, due_date, points
	FROM Assignments
	WHERE id = $1
		AND class = $2`, assignmentId, classId).Scan(&assignment.Name, &assignment.DueDate, &assignment.Points)
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}

	// Collect submission information.
	var submissions []struct {
		ID            string    `json:"id"`
		OwnerUsername string    `json:"owner"`
		Date          time.Time `json:"date"`
		PointsEarned  float64   `json:"pointsEarned"`
	}
	rows, err := c.Conn.QueryContext(c, `
	SELECT R.id AS id, username, submitted_on, points_earned
	FROM Accounts L
	JOIN Submissions R
		ON L.id = R.owner
	WHERE R.assignment = $1
		AND (L.id = $2 OR $3)`,
		assignmentId, c.Claims.UserID, c.IsProfessor())
	if err != nil {
		return c.NoContent(http.StatusInternalServerError)
	}
	for ok := rows.Next(); ok; ok = rows.Next() {
		id, owner, date, points := "", "", time.Time{}, float64(0)
		if err := rows.Scan(&id, &owner, &date, &points); err != nil {
			c.Logger().Error(err)
		}
		submissions = append(submissions, struct {
			ID            string    "json:\"id\""
			OwnerUsername string    "json:\"owner\""
			Date          time.Time "json:\"date\""
			PointsEarned  float64   "json:\"pointsEarned\""
		}{id, owner, date, points})
	}
	rows.Close()

	return c.JSON(http.StatusOK, echo.Map{
		"professor":   c.IsProfessor(),
		"name":        assignment.Name,
		"dueDate":     assignment.DueDate,
		"points":      assignment.Points,
		"submissions": submissions,
	})
}

// Get a live feed of results for the given submission ID.
//@Summary Get a live feed of results for the given submission ID.
//@Description Get a live feed of results for the given submission ID.
//@Tags Users
//@Accept json
//@Param submission ID
//@Success 200 {OK}
//@Produce Json, Response Format: { "hidden": bool,"testId": 0,"testName": "name","score": 100.0,"msg": "Error message or further information."}If the hidden field is set to true, the msg and testName fields will be empty.
//Failure 400 {bad request}, 401 {Unauthorized}, 500 {server error}
//Router GET /live/<assignment_id>
func LiveResults(cc echo.Context) error {
	c := cc.(*Context)

	websocket.Handler(func(ws *websocket.Conn) {
		defer ws.Close()

		// Receive submission ID
		submissionId := c.Param("submissionId")

		// Fetch the results channel and begin relaying results.
		for result := range c.Runner.Results(c, submissionId) {
			if err := websocket.JSON.Send(ws, result); err != nil {
				c.Logger().Error(err)
			}
		}
	}).ServeHTTP(c.Response(), c.Request())
	return nil
}
