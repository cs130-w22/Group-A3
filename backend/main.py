#!/bin/python3

from argparse import ArgumentParser
from dataclasses import dataclass

from flask import Flask, g, request
import psycopg as pg
import psycopg.errors as errors
from psycopg.rows import class_row

from argparse import ArgumentParser

from auth import *

import datetime

CONN_STR = ""
SECRET = ""
SUBMISSIONS_FOLDER = 'submissions'

app = Flask(__name__)
app.config['SUBMISSIONS_FOLDER'] = SUBMISSIONS_FOLDER

@dataclass
class Account:
    """
    Helper dataclass for psycopg row factory use.
    """

    id: int
    username: str
    password: str
    professor: bool
    deleted: datetime

@dataclass
class Submission:
    """
    Helper dataclass for psycopg; this one tracks the submission schema.
    """
    id: str
    assignment: int
    owner: str
    uploaded: str
    points_earned: float

    
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

# Helper function for querying the Accounts table.
def query_accounts(query: str, params):
    account = None
    conn = get_db()
    with conn.cursor(row_factory=class_row(Account)) as cur:
        cur.execute(
            query,
            params,
        )
        records = cur.fetchall()

        length = len(records)
        if length == 0:
            # The login failed.
            return (None, 400)
        elif len(records) > 1:
            # There is a problem with the database.
            return (None, 500)
        account = records[0]
    return (account, 200)

# Log an user into the database, then return a valid JWT for their session.
@app.route("/login", methods=["POST"])
def login():
    json = request.json
    username, password = json["username"], json["password"]

    query = query_accounts(
        """
        SELECT * FROM Accounts
        WHERE username = %s
        AND password = crypt(%s, password)
        """,
        [username, password],
    )
    if not query[0]:
        return {}, query[1]
    account = query[0]
    
    return {
        "token": Token(
            SECRET,
            account.id,
        ),
    }, 200


# Create a user in the database, then return a valid JWT for their session.
@app.route("/user", methods=["POST"])
def create_user():
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
                """
                INSERT INTO Accounts (username, password, professor)
                VALUES (%s, %s, %s)
                RETURNING *
                """,
                [username, password, account_type == "professor"],
            )
            conn.commit()
            result = cur.fetchone()
        except errors.UniqueViolation:
            # User already exists.
            return {}, 409

    # Create and return a JWT for the new session containing the user's ID.
    return {"token": Token(SECRET, result.id).to_jwt()}, 201


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
    if 'file' not in request.files:
        # No 'file' entry; return 400 for bad request.
        return {}, 400
    if 'assignment_id' not in request.files:
        # No 'assignment_id' entry; return 400 for bad request.
        return {}, 400
    file = request.files['file']
    assignment_id = request.files['assignment_id']

    # Need to get this user's UID, which is a string.
    # Same deal as login endpoint.
    token = get_token(SECRET)
    user_id = token.payload['id']
    query = query_accounts(
        """
        SELECT * FROM Accounts
        WHERE id = %s
        """,
        [user_id],
    )
    if not query[0]:
        return {}, query[1]
    account = query[0]

    uid = account.username

    dt = datetime.datetime.now()
    
    if file:
        # Have to create a new entry in Submissions table.
        conn = get_db()
        with conn.cursor(row_factory=class_row(Submission)) as cur:
            try:
                cur.execute(
                    """
                    INSERT INTO Submissions (assignment_id, owner, uploaded)
                    VALUES (%s, %s, %s)
                    RETURNING *
                    """,
                    [assignment_id, uid, dt],
                )
                conn.commit()
                result = cur.fetchone()
            except errors.UniqueViolation:
                # Submission already exists.
                return {}, 409

        # Probably very ugly, but use the database-given id as the filename + datetime, for simplicity.
        filename = secure_filename(result.id + '_' + result.dt.replace(" ", "")) 
        file.save(os.path.join(app.config['SUBMISSIONS_FOLDER'], filename))
                  
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
        default="gradebetter",
        help="secret key to use in JWT generation",
    )
    args = parser.parse_args()

    CONN_STR = args.db_conn
    SECRET = args.secret
    app.run(port=args.port)
