#
# Builds your installation to ./dist.
#

GO_TAGS=sqlite_foreign_keys
DIST_DIR=./dist

default: host

package: host
	tar czf host.tar.gz -C dist/ .

host: frontend backend

.PHONY: frontend
frontend:
	cd frontend; \
	yarn; \
	BUILD_PATH='../$(DIST_DIR)/build' yarn build

.PHONY: host
backend:
	cd backend; \
	go build -o ../$(DIST_DIR)/gradebetter --tags $(GO_TAGS)
