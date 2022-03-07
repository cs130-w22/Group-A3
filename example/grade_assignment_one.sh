#!/bin/sh
#
# $1 is the temp directory for the file.
#

# unpack user work
cd $1

# if the user submitted no work, then fail.
if [ ! -e work.tar.gz ]; then
  echo "0"
  echo "NAME Work submitted"
  echo "User failed to submit work"
  echo "SCORE 0.0 0\n"
  exit 0
fi

tar xf work.tar.gz

echo "1"
echo "NAME Submission exists"
echo "Your submission exists!"
echo "SCORE 0.0 0\n"

echo "2"
echo "NAME Contains main.go"
if [ "$(ls -a | grep main.go)" = "main.go" ]; then
  echo "Success: File main.go"
  echo "SCORE 0.2 1\n"
else
  echo "Failure: Missing main.go"
  echo "SCORE 0.2 0\n"
fi

OUTPUT_1="[1  Doxa  ston  Theo  gia  ola  ta  pragmata]"
OUTPUT_2_WORKED="2 Definition worked"
OUTPUT_2_FAILED="2 Definition failed"
OUTPUT_3="3 Empty"

echo "3"
echo "NAME Correct array"
if [ "$(go run main.go | grep 1)" = "$OUTPUT_1" ]; then
  echo "Success: Array prints correctly"
  echo "SCORE 0.2 1\n"
else
  echo "Failure: Wrong array"
  echo "SCORE 0.2 0\n"
fi

echo "4"
echo "HIDDEN"
echo "NAME Correct output on failure"
if [ "$(go run main.go | grep 2)" = "$OUTPUT_2_FAILED" ]; then
  echo "Success: Correct failure msg"
  echo "SCORE 0.2 1\n"
else
  echo "Failure: Incorrect failure msg"
  echo "SCORE 0.2 0\n"
fi

echo "5"
echo "NAME Correct output on arg"
if [ "$(go run main.go 100 | grep 2)" = "$OUTPUT_2_WORKED" ]; then
  echo "Success: Correct msg"
  echo "SCORE 0.2 1\n"
else
  echo "Failure: Incorrect msg"
  echo "SCORE 0.2 0\n"
fi

echo "6"
echo "NAME Empty substring"
if [ "$(go run main.go | grep 3)" = "$OUTPUT_3" ]; then
  echo "Success: Substring after 'NAME' is empty"
  echo "SCORE 0.2 1\n"
else
  echo "Failure: Substring after 'NAME' not empty"
  echo "SCORE 0.2 0\n"
fi
