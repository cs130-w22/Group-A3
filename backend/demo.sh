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
curl -sd '{ "name": "CS 31" }' -H 'Content-Type: application/json' -H "Authorization: $MY_TOKEN" localhost:8080/class
echo "Done."
