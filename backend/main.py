#!/bin/python3

from argparse import ArgumentParser
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

import jwt
from flask import Flask, g, request
import psycopg as pg
import psycopg.errors as errors
from psycopg.rows import class_row

from argparse import ArgumentParser

CONN_STR = ""
SECRET = ""

app = Flask(__name__)


def get_auth() -> dict:
    """
    Get the JSON map encoded in the request's "Authorization" header.
    Expiration is automatically checked by PyJWT. If the signature is
    expired, an ExpiredSignatureError is thrown.

    The "nbf" and "exp" claims are required for each token. If they are
    missing, then this function will throw an error.
    """
    return jwt.decode(
        request.headers.get("Authorization"),
        SECRET,
        algorithms=["HS256"],
        options={"require": ["exp", "nbf"]},
    )


def to_auth(payload: dict) -> str:
    """
    Convert the provided dictionary payload into a Base64-encoded JWT.

    Tokens expire in 31 days, and cannot be used before the time they
    were issued at.
    """
    return jwt.encode(
        {
            **payload,
            # Tokens are valid for 31 days.
            "exp": datetime.now(tz=timezone.utc) + timedelta(days=31),
            # Tokens should not be accepted before the present day.
            "nbf": datetime.now(tz=timezone.utc),
        },
        SECRET,
        algorithm="HS256",
    ).decode("utf-8")


@dataclass
class Account:
    id: int
    username: str
    password: str
    professor: bool
    deleted: datetime


# Retrieve the global database connection object.
# Pulled from https://flask.palletsprojects.com/en/2.0.x/appcontext/
def get_db() -> pg.Connection:
    global CONN_STR
    if "conn" not in g:
        g.conn = pg.connect(CONN_STR)
    return g.conn


@app.teardown_appcontext
def teardown_db(exception):
    conn = g.pop("conn", None)
    if conn is not None:
        conn.close()


# Log an user into the database, then return a valid JWT for their session.
@app.route("/login", methods=["POST"])
def login():
    json = request.json
    username, password = json["username"], json["password"]

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM Accounts WHERE username = %s AND password = crypt(%s, password)",
            [username, password],
        )
        records = cur.fetchall()
        if len(records) != 1:
            return {}, 400
        account = records[0]

    return {
        "token": to_auth(
            # Right now, we just store the user's ID in the token.
            {
                "userid": account[0],
            }
        ),
    }, 200


# Create a user in the database, then return a valid JWT for their session.
@app.route("/user", methods=["POST"])
def create():
    json = request.json
    account_type, username, password = json["type"], json["username"], json["password"]

    # Bad request
    if account_type not in ["student", "professor"]:
        return {"message": "Invalid account type!"}, 400

    # Create a database transaction to insert our accout into the associated
    # course.
    conn = get_db()
    with conn.cursor(row_factory=class_row(Account)) as cur:
        try:
            cur.execute(
                "INSERT INTO Accounts (username, password, professor) VALUES (%s, %s, %s)",
                [username, password, account_type == "professor"],
            )
            conn.commit()
        except errors.UniqueViolation:
            # User already exists.
            return {}, 409

    # Create and return a JWT for the new session.
    return {"token": to_auth({"username": username})}, 201


@app.route("/class/<class_id>/info", methods=["GET"])
def view_class(class_id):
    """
    Get all relevant information about a class, including its assignments, member list
    (if allowed), and owner.
    """

    is_professor = True

    return {
        "name": "mycoolclass",
        "ownerName": "Prof. Eggert",
        "assignments": [],
        "members": [{"name": "Svetly"}, {"name": "Preetha"}, {"name": "Leo"}]
        if is_professor
        else None,
    }, 200


@app.route("/class/<class_id>/<assignment_id>", methods=["GET"])
def get_assignment(class_id, assignment_id):
    """
    Get information about an assignment for a specific user.
    """
    return {
        "name": "Cool assignment one",
        "dueDate": "1647205512354",
        "submissions": [{"date": "1643663222161", "pointsEarned": 100.0}],
    }, 200


@app.route("/<class_id>/<assignment_id>/script", methods=["POST"])
def upload_grading_script(class_id, assignment_id):
    """
    Upload the grading script for a specific assignment.
    """
    return {}, 204


@app.route("/<class_id>/<assignment_id>/upload", methods=["POST"])
def upload_submission(class_id, assignment_id):
    """
    Upload a submission for a specific assignment.
    """
    return {}, 204


@app.route("/class", methods=["POST"])
def create_class():
    """
    Create a class in the database.
    """
    return {"id": "new_class_id"}, 201


@app.route("/class/<class_id>/invite", methods=["POST"])
def create_invite(class_id):
    """
    Create an invite code for the class with ID `class_id`.
    """
    return {"inviteCode": "my-new-invite-code"}, 201


@app.route("/class/join", methods=["POST"])
def join_class(class_id):
    """
    Join the currently logged-in user to the class with ID `class-id`.
    """
    return {}, 204


if __name__ == "__main__":
    parser = ArgumentParser("code_grader")
    parser.add_argument(
        "-p",
        "--port",
        type=int,
        default=8080,
        help="port to serve the backend on",
    )
    parser.add_argument(
        "--db-conn",
        type=str,
        default="host=localhost port=5432 dbname=gradebetter user=admin password=admin",
        help="connection string for a postgresql database",
    )
    parser.add_argument(
        "-s",
        "--secret",
        type=str,
        default="gradbetter",
        help="secret key to use in JWT generation",
    )
    args = parser.parse_args()

    CONN_STR = args.db_conn
    SECRET = args.secret
    app.run(port=args.port)
