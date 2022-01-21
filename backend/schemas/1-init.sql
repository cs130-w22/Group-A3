-- 1-init
--
-- Schemas for the PostgreSQL database.

-- Enable the pgcrypto extension for PGSQL.
CREATE EXTENSION pgcrypto;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS Account (
	username VARCHAR(255) UNIQUE NOT NULL,

   -- Hash of the user's password.
	password TEXT NOT NULL,

   -- Classes that the user has faculty rights over.
	admin BOOL NOT NULL,

   -- If this user was deleted.
	deleted TIMESTAMP DEFAULT NULL,
	
  PRIMARY KEY (username)
);

-- On update of an user's password, hash it before insertion.
CREATE FUNCTION hash_new_password()
RETURNS TRIGGER AS $$
BEGIN
	NEW.password := crypt(NEW.password, gen_salt('bf', 8));
	RETURN NEW;
END;
CREATE TRIGGER hash_password_on_change
    BEFORE INSERT OR UPDATE
    ON Account
	FOR EACH ROW
	EXECUTE PROCEDURE hash_new_password();

CREATE TABLE IF NOT EXISTS Assignment (
	-- Unique name of the assignment (to be used in submissions)
	name VARCHAR(255) UNIQUE NOT NULL,

	-- Points possible for the assignment
	points DOUBLE(5, 2),
	
  PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS Submission (
	-- Unique submission ID
	id CHAR(10),
	
	-- ID for assignment
	assignment VARCHAR(50) NOT NULL,

	-- UID of submitter
	owner VARCHAR(255) NOT NULL,

	-- Total points earned in this submission
	points_earned DOUBLE(5, 2),

	PRIMARY KEY (id)
);