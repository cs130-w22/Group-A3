#!/bin/python3

from argparse import ArgumentParser

from flask import Flask, g, request
import psycopg as pg

CONN_STR = ""

# Retrieve the global database connection object.
# Pulled from https://flask.palletsprojects.com/en/2.0.x/appcontext/
def get_db():
    global CONN_STR
    if "conn" not in g:
        g.conn = pg.connect(CONN_STR)
    return g.conn


@app.teardown_appcontext
def teardown_db(exception):
    conn = g.pop("conn", None)
    if conn is not None:
        conn.close()


# Lever Flask's automatic JSON response functionality:
# https://flask.palletsprojects.com/en/2.0.x/quickstart/#apis-with-json
@app.route("/login", methods=["POST"])
def login():
    return {"token": "example"}


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

    app = Flask(__name__)
    app.run(port=args.port)
