#!/bin/python3

from argparse import ArgumentParser

from flask import Flask, g, request, send_file
import psycopg as pg

from argparse import ArgumentParser

CONN_STR = ""

app = Flask(__name__)

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
@app.route("/api/login", methods=["POST"])
def login():
    return {"token": "example"}


# Create a user in the database, then return a valid JWT for their session.
@app.route("/api/user", methods=["POST"])
def create():
    return {"token": "example"}
    form = request.form
    account_type, username, password = form["type"], form["username"], form["password"]
    invite_key = None if account_type == "student" else form["inviteKey"]

    # Bad request
    if account_type not in ["student", "professor"]:
        return {"message": "Invalid account type!"}, 400

    # Create a database transaction to insert our accout into the associated
    # course.
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO Accounts (username, password, professor) VALUES (%s, %s, %s)",
            username,
            password,
            account_type == "professor",
        )

        # If the account is for a student, then join them to their class.
        if account_type == "student":
            cur.execute(
                """
                INSERT INTO ClassMembers (id, class_id) VALUES (id, class_id) \
                WHERE id = (SELECT id FROM Accounts WHERE username = %s) AND \
                class_id = (SELECT invites_to FROM Invites WHERE id = %s)
                """,
                username,
                invite_key,
            )
        conn.commit()

    # TODO: create and return a JWT for the new session
    return {}, 201


@app.route("/api/class/<class_id>/info", methods=["GET"])
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


@app.route("/api/class/<class_id>/<assignment_id>", methods=["GET"])
def get_assignment(class_id, assignment_id):
    """
    Get information about an assignment for a specific user.
    """
    return {
        "name": "Cool assignment one",
        "dueDate": "1647205512354",
        "submissions": [{"date": "1643663222161", "pointsEarned": 100.0}],
    }, 200


@app.route("/api/<class_id>/<assignment_id>/script", methods=["POST"])
def upload_grading_script(class_id, assignment_id):
    """
    Upload the grading script for a specific assignment.
    """
    return {}, 204


@app.route("/api/<class_id>/<assignment_id>/upload", methods=["POST"])
def upload_submission(class_id, assignment_id):
    """
    Upload a submission for a specific assignment.
    """
    return {}, 204


@app.route("/api/class", methods=["POST"])
def create_class():
    """
    Create a class in the database.
    """
    return {"id": "new_class_id"}, 201


@app.route("/api/class/<class_id>/invite", methods=["POST"])
def create_invite(class_id):
    """
    Create an invite code for the class with ID `class_id`.
    """
    return {"inviteCode": "my-new-invite-code"}, 201


@app.route("/api/class/join", methods=["POST"])
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
        default="port=5432 user=dev password=dev",
        help="connection string for a postgresql database",
    )
    args = parser.parse_args()

    app.run(port=args.port)
