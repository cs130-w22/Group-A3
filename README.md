# Gradebetter

[![Release](https://img.shields.io/github/v/release/cs130-w21/template?label=release)](https://github.com/cs130-w21/template/releases/latest)

Gradebetter is a minimalistic grading server for individual classes and small organizations.
It provides the following components in a single package:
* Frontend:
  * Create classes, assignments
  * Submit work
  * Automatically grade assignments
  * Receive grades
  * Download students' submissions
* HTTP backend and API
  * Modify student's grades
  * Access data

The project levers the following technologies:
* [echo](https://echo.labstack.com/), for its HTTP server
* []

## Setup

1. Download the latest release of the project for your architecture from the [releases](https://github.com/cs130-w22/Group-A3/releases) tab.
2. Once downloaded, unpack the server to the directory you would like to serve from.
3. Run `./gradebetter` and visit `localhost:8080`!

## Grading Scripts

Grading scripts are a core function of Gradebetter. Each assignment must have one,
but it isn't a strict requirement that each assignment have a *distinct* grading
script.

Flexibility is given to the faculty in determining how much control to give the
program on the host system. We recommend that programs be containerized or
placed on a secure runtime to ensure malicious code does not run on the machine.

Grading scripts can be any program, script, or command compatible with the host
machine's architecture, so long as they output test cases of the following
format to stdout (including newlines):

```
### 		                  (Test ID, 000-999)
HIDDEN 	                  (if hidden)
  	  	                  (if HIDDEN, then only score is required)
NAME TestName
  	                      (if NAME is omitted, then all text
                           until the score is treated as a
                           message)
(comment or hint for students)
SCORE ##.# ##.# 	        (Weight, points)
```

The grading script is called with the following arguments:
* The directory in which the student's submission is located. The student's work
  will be provided in a `.tar.gz` archive titled `work.tar.gz`.

### Example

An example grading script is provided below in POSIX shell. It checks that the
student submitted a file named "report.txt" in their tar.gz.

```sh
#!/bin/sh
#
# grade_report.sh
#

chdir $1
tar xf work.tar.gz 1>&2

echo "001"
echo "NAME Report exists"
if [ -e report.txt ]; then
  echo "report.txt exists"
  echo "SCORE 1.0 100"
else
  echo "report.txt does not exist!"
  echo "SCORE 1.0 0"
fi
```

We can create an assignment with this grading script at an arbitary directory
`/home/gradebetter/grade_report.sh`. After ensuring that it is executable by
our Gradebetter user or the user the program is running under, we can use it
in our Gradebetter interface.

![]()

Then, we can upload some arbitrary submission to it:

![]()

## Configuration

Core function of Gradebetter is carried out through its CLI.

```
$ ./gradebetter -help
Usage of ./gradebetter:
  -D    Reset SQLite database schema then exit (DROP ALL TABLES)
  -c filename
        sqlite database filename (default "gradebetter.db")
  -j uint
        Maximum number of concurrent test scripts running at a given time (default 1)
  -k key
        secret key to use in JWT minting (default "gradebetter")
  -p port
        port to serve the HTTP server on
```

## Semver

This project follows [semantic versioning](https://semver.org/), specifically the
2.0.0 spec. When the project receives a major version change, there will be
breaking changes. Backwards compatability will be provided in a best-effort in the
form of migratory scripts or utilities.
