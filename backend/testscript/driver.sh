#!/bin/sh
case "$1" in
  "Assignment One")
    ./grade_assignment_one.sh $2
    ;;
  *)
    echo "Called with an unknown assignment." 1>&2
    ;;
esac
