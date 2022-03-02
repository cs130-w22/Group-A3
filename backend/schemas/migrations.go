package schemas

import (
	_ "embed"

	"database/sql"
)

var (
	//go:embed 0-reset.sql
	reset string
	//go:embed 1-accounts.sql
	accounts string
	//go:embed 2-assignments.sql
	assignments string
)

func Migrate(db *sql.DB, resetSchemas bool) {
	var queries []string
	if resetSchemas {
		queries = []string{reset, accounts, assignments}
	} else {
		queries = []string{accounts, assignments}
	}

	tx, _ := db.Begin()
	for _, query := range queries {
		db.Exec(query)
	}
	tx.Commit()
}
