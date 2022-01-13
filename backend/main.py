#!/bin/python3

from argparse import ArgumentParser

from flask import Flask

app = Flask(__name__)


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
        help="specify the port to run the backend on",
    )
    args = parser.parse_args()

    app.run(port=args.port)
