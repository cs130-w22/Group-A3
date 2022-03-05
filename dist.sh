#!/bin/sh
#
# Package the software for whichever platform we are interested in.
#

BUILD_DIR="./build"
GO_TAGS="sqlite_foreign_keys"

if [ ! $SKIP_FRONTEND ]; then
  cd frontend
  yarn
  BUILD_PATH="../$BUILD_DIR/build" yarn build
  cd ..
fi

cp README.md build/README.md
cp LICENSE build/LICENSE

for os in windows darwin linux; do
  for arch in amd64 386 arm; do
    cd backend
    GOOS=$os GOARCH=$arch go build -o ../$BUILD_DIR/gradebetter --tags $GO_TAGS
    if [ $? -ne 0 ]; then
      cd ..
      continue
    else
      cd ..
      tar czf "dist/gradebetter-$os-$arch.tar.gz" -C build/ .
    fi
  done
done
