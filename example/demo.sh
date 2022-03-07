#!/bin/sh

# Create the user.
echo "Creating professor account with username 'smallberg' and password 'bigberg'"
PROFESSOR_TOKEN="$(curl -sd '{ "username": "smallberg", "password": "bigberg", "type": "professor" }' -H 'Content-Type: application/json' localhost:8080/user | jq -r '.token')"

# Create a student.
echo "Creating student account with username 'eggert' and password 'eggert'"
STUDENT_TOKEN=$(curl -sd '{ "username": "eggert", "password": "eggert", "type": "student" }' -H 'Content-Type: application/json' localhost:8080/user | jq -r '.token')

PROFESSOR_TOKEN="$(curl -sd '{ "username": "smallberg", "password": "bigberg" }' -H 'Content-Type: application/json' localhost:8080/login | jq -r '.token')"
STUDENT_TOKEN="$(curl -sd '{ "username": "eggert", "password": "eggert" }' -H 'Content-Type: application/json' localhost:8080/login | jq -r '.token')"
echo "Created professor account with token: $PROFESSOR_TOKEN"
echo "Created student account with token: $STUDENT_TOKEN"

echo "----"
echo "Continuing to create a class + phony submissions"
echo "----"

# Create a class
echo "Creating CS 31..."
CLASS_ID="$(curl -sd '{ "name": "CS 31" }' -H 'Content-Type: application/json' -H "Authorization: $PROFESSOR_TOKEN" localhost:8080/class | jq -r '.id')"
echo "Class ID is $CLASS_ID"
echo "Done."

# Join the student to the class.
INVITE_ID="$(curl -sd '{ "validUntil": "2022-04-10T00:00:00.000Z" }' -H 'Content-Type: application/json' -H "Authorization: $PROFESSOR_TOKEN" localhost:8080/class/$CLASS_ID/invite | jq -r '.inviteCode')"
echo "Invite ID is $INVITE_ID"
curl -sd "{ \"inviteCode\": \"$INVITE_ID\" }" -H 'Content-Type: application/json' -H "Authorization: $STUDENT_TOKEN" localhost:8080/class/join
echo "Student joined"

# Create a new assignment pointing at our grading harness.
SCRIPT_PATH="$(pwd)/grade_assignment_one.sh"
echo "Script path is $SCRIPT_PATH"
ASSIGNMENT_ID="$(curl -sF name=Assignment\ One -F dueDate=1649210038 -F path=$SCRIPT_PATH -H "Authorization: $PROFESSOR_TOKEN" "localhost:8080/class/$CLASS_ID/assignment" | jq -r '.id')"
echo "Assignment ID is $ASSIGNMENT_ID"
