# schemas

This directory holds SQL queries that will be executed **on-initialization** of a Docker image
for the backend.

They are executed in order by the number prefixing their title of the form `%d-%s.sql`.

Filename | Purpose
:- | :-
`1-init.sql` | Initialize timezone, extensions
`2-accounts.sql` | Essential accounts schemas
`3-assignments.sql` | Assignment infrastructure
