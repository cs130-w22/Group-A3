# backend

The backend for our grading solution supports operations on user-sensitive data.

## Get Started Developing

You will need:
* [`go` >= go1.16.3](https://go.dev/doc/install)

```sh
# make sure you're in the backend directory
go build --tags=sqlite_foreign_keys
./backend
```

The `handler` folder is where code for our endpoints goes. All endpoints can expect
to be passed a `Context` of type [`handler.Context`](./handler/context.go). Please
consult the provided type and below code sample for information.

```go
// The below handler shows how to acquire a `handler.Context` object
// from the wrapping `echo.Context`.
//
// The contained Context type supplies a database connection and JWT
// authorization claims, if a user has supplied a token in the
// "Authorization" header of their request.
func MyHandler(cc echo.Context) error {
  c := cc.(*Context)
  return nil
}
```

## API Documentation

All relevant API documentation can be found online at the user manual: https://krashanoff.gitbook.io/gradebetter/.
