#
#
#

from os import path
from flask import Blueprint, send_file

react_blueprint = Blueprint("react", __name__, static_folder="build/static/")


@react_blueprint.route("/", methods=["GET"])
def index():
    return send_file(path.join(react_blueprint.static_folder, "index.html")), 200
