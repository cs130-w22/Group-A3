#!/bin/sh
#
# Package the software for whichever platform we are interested in.
#

BUILD_DIR="./build"
GO_TAGS="sqlite_foreign_keys"

cd frontend
yarn
BUILD_PATH="../$BUILD_DIR/build" yarn build
cd ..

for os in windows darwin linux; do
  for arch in amd64 386 arm; do
    cd backend
    GOOS=$os GOARCH=$arch go build -o ../$BUILD_DIR/gradebetter --tags $GO_TAGS;
    cd ..
    tar czf "dist/gradebetter-$os-$arch.tar.gz" -C build/ .
  done
done
