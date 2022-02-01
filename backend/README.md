# backend

The backend for our grading solution supports operations on user-sensitive data.

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
  "professor": "true",
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
    {"name": "Svetly"},
    {"name": "Preetha"},
    {"name": "Leo"}
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
204 | OK. User joined successfully or is already in class
400 | Bad request (see format)
401 | Unauthorized
500 | Server error

## Get Started Developing

You will need
* Docker
* Python 3.x.x
* `virtualenv`

```sh
# Set up our database container and run it. The following commands
# will redirect your image output to /dev/null. If you want to see the
# output, you should write to a file.
docker image build . -t gradebetter
docker run -p "5432:5432" gradebetter 2>&1 1>&/dev/null &
# In the future, you can run: docker start MY_CONTAINER_ID

# Set up our Python virtual environment.
virtualenv env
source env/bin/activate
pip install -r requirements.txt
python main.py # starts the backend
```

You're all set! Remember to run `black` in this directory before
committing.

## Appendix

### Testing the Backend

To test the endpoint you've created with some dummy data, you can use [curl](https://curl.se/).
The below example `POST`s some data to the endpoint `/class`.

```sh
curl -d '{ "hi": "" }' -H "Content-Type: application/json" localhost:8080/class
```

We can see this information reflected on the backend's log:

```
127.0.0.1 - - [31/Jan/2022 11:54:43] "POST /class HTTP/1.1" 200 -
```

### Useful Tools

If you want to see how your SQL query is running, [DataGrip](https://www.jetbrains.com/datagrip/)
or another similar database browser makes life much easier.
