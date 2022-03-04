# backend

The backend for our grading solution supports operations on user-sensitive data.

## Get Started Developing

You will need:
* [`make`](https://www.gnu.org/software/make/)
* [`go` >= go1.16.3](https://go.dev/doc/install)

```sh
# make sure you're in the backend directory
make
./backend
```

The `handler` folder is where code for our endpoints goes. All endpoints can expect
to be passed a `Context` of type [`handler.Context`](./handler/context.go). Please
consult the provided type and below code sample for information.

```go
// The below handler shows how to acquire a `handler.Context` object
// from the wrapping `echo.Context`.
//
// The contained Context type supplies a database connection and JWT
// authorization claims, if a user has supplied a token in the
// "Authorization" header of their request.
func MyHandler(cc echo.Context) error {
  c := cc.(*Context)
  return nil
}
```

## Exposed Endpoints

### Conventions

Responses are formatted with JSON. Variable names passed in the request are documented
using `snake_case`, but responses will provide variable names that **are actually** in
`camelCase`.

All endpoints except for `POST /login` and `POST /user` expect an `Authorization` header
in the HTTP request bearing a JWT returned by either of these endpoints.

Any `GET` request does not require a body, only an `Authorization` header.

### `POST /user`

Login as an user, returning a JWT for future requests. Please please **please** only
send this on TLS.

#### Request Body

```json
{
  "username": "Smallberg",
  "password": "MYSECRETPASSWORD DONT TELL ANYONE LOL",
  "type":     "professor",
}
```

#### Response Format

```json
{
  "token": "SomeLongStringOfBase64"
}
```

Status Code | Semantic
:-|:-
201 | CREATED
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `POST /login`

Login as an user, returning a JWT for future requests. Please please **please** only
send this on TLS.

#### Request Body

```json
{
  "username": "Smallberg",
  "password": "MYSECRETPASSWORD DONT TELL ANYONE LOL"
}
```

#### Response Format

```json
{
  "token": "SomeLongStringOfBase64"
}
```

Status Code | Semantic
:-|:-
200 | OK
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `GET /class/me`

Get information about the currently logged on user's:
* ID
* Name
* Professor status
* Class membership
* Current assignments

#### Request Body

This endpoint does not require a request body.

#### Response Format

```json
{
  "id": 1,
  "username": "myname",
  "professor": "true",
  "classes": [
    {
      "id": 1,
      "name": "CS 131"
    }
  ],
  "assignments": [
    {
      "id": 1,
      "class": 1,
      "name": "Name of assignment",
      "dueDate": 1646238619671,
      "pointsPossible": 100.0
    }
  ]
}
```

### `POST /class`

Creates a class in the database.

#### Request Body

```json
{
  "name": "My cool class"
}
```

#### Response Format

```json
{
  "id": "new_class_id"
}
```

Status Code | Semantic
:-|:-
201 | CREATED
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `GET /class/<class_id>/<assignment_id>`
Get the unique assignment ID for a given user

### Response Format 

```json 
{
  "name": "Cool assigment one",
  "dueDate": "1647205512354",
  "points": 100.0,
  "submissions": [{"date": "1643663222161", "pointsEarned": 100.0}]
}
```
Status Code | Semantic
:-|:-
200 | OK
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `GET /class/<class_id>/info`

Get all relevant information about a class, including its assignments, member list (if
allowed), and owner.

#### Response Format

```json
{
  "name": "My cool class",
  "ownerName": "Prof. Eggert",
  "assignments": [
    {
      "id": "SomeID",
      "name": "Homework 1",
      "dueDate": "1643663222161",
      "points": 100.0
    }
  ],

  // Omitted if you are not logged in to a professor account.
  "members": [
    {
      "id": 2,
      "username": "Svetly"
    },
    {
      "id": 2,
      "username": "Preetha"
    },
    {
      "id": 2,
      "username": "Leo"
    }
  ]
}
```

Status Code | Semantic
:-|:-
200 | OK
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `POST /class/<class_id>/invite`

Create an invite code for the class with ID `class_id`.

#### Request Body

```json
{
  "validUntil": "UNIX UTC TIMESTAMP"
}
```

#### Response Format

```json
{
  "inviteCode": "my-new-invite-code"
}
```

Status Code | Semantic
:-|:-
201 | Created
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `POST /class/<class_id>/drop`

Drop the student with ID `id` from your class with ID `class_id`. Any student can
drop themselves from a class, and a professor can drop anyone from a class except
themselves.

#### Request Body

THIS IS AN OPTIONAL REQUEST BODY. IF AN EMPTY BODY IS SUPPLIED, THE ENDPOINT WILL
ATTEMPT TO DROP THE USER REPRESENTED IN THE AUTHORIZATION TOKEN FROM THE CLASS.

```json
{
  "id": "ID"
}
```

#### Response Format

No data is returned with this endpoint.

Status Code | Semantic
:-|:-
200 | OK
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `POST /class/join`

Join the logged-in user to the class associated with the given. If the user is already
in the class, then nothing happens.

#### Request Body

```json
{
  "inviteCode": "my-new-invite-code"
}
```

#### Response Format

No data is returned with this endpoint.

Status Code | Semantic
:-|:-
200 | OK. User joined successfully or is already in class
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `POST /class/<class_id>/assignment`

Create a new assignment with the provided **FORM DATA** parameters.

#### Request Body

The request should supply a [form-type body](https://developer.mozilla.org/en-US/docs/Web/API/FormData/FormData) (e.g., `new FormData(form)`) with the following
parameters:

Key | Value
:-|:-
`name` | Name of the assignment (string)
`dueDate` | Due date of the assignment in milliseconds since the epoch (integer)
`file` | Grading script to use with the assignment (blob)

#### Response Format

The endpoint returns the ID of the newly-created assignment.

```json
{
  "id": 0000
}
```

Status Code | Semantic
:-|:-
201 | OK. Assignment has been created successfully.
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `POST /<class_id>/<assignment_id>/upload`

Upload a submission for the assignment with the specified ID.

#### Request Body

```formData
<input type="file" name="file">
```

#### Response Format

As of right now, no data is returned by this endpoint.

Status Code | Semantic
:-|:-
204 | OK. Assignment has been uploaded successfully.
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

### `GET /live/<assignment_id>`

#### Websocket Format

This endpoint sends a continuous stream of the following object:

```json
{
  "hidden": bool,
  "testId": 0,
  "testName": "name",
  "score": 100.0,
  "msg": "Error message or further information."
}
```

If the `hidden` field is set to `true`, the `msg` and `testName` fields will be empty.

## Grading Scripts

### Output format

Each test case should be of the format:

Content | Details
:-|:-
id | The test ID.
HIDDEN | If HIDDEN, then only score is required.
NAME TestName | If NAME is omitted, then all text until the score is treated as the Message.
Message | 
SCORE weight num |

## Appendix

### Testing the Backend

There's a few ways to test the backend.

#### Testing it the Go way

If we have any Go test files (e.g., `myfile_test.go`), then
they are automatically discoverable and runnable with the
`go` binary that builds the backend.

```
go test -v
```

#### Testing it Live

To test the endpoint you've created with some dummy data, you can use [curl](https://curl.se/) or some other simple
HTTP program (even devtools work).
The below example `POST`s some data to the endpoint `/class`.

```sh
curl -d '{ "username": "leo", "password": "mypass" }' \
  -H 'Content-Type: application/json' localhost:8080/login
```

If you have the backend running on port 8080, this will automatically be reflected.

### Useful Tools

If you want to see how your SQL query is running, [DataGrip](https://www.jetbrains.com/datagrip/)
or another similar database browser makes life much easier.

You can also use the CLI program `sqlite3` to investigate the database that you have created (by default `test.db`).
Below is an example:

```
➜  backend git:(==leo/sqlite) sqlite3 test.db
SQLite version 3.31.1 2020-01-27 19:55:54
Enter ".help" for usage hints.
sqlite> SELECT * FROM Accounts;
1|leo|iMQqebOjHtuHuhsjhZogP+dYy5dbIrB07AJYUOVy95g=|0qMCFGhCDT9l6D+fiqndpzk9B1aM9DJMIOxtYbp/WEY6x42QPKuK4q9TVSqdtAuM2KBiHiiEihkVGfLgaQ76tA==|1|
sqlite> 
```
