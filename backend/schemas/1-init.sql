-- 1-init
--
-- Schemas for the PostgreSQL database.

-- Enable the pgcrypto extension for PGSQL.
CREATE EXTENSION pgcrypto;

-- Use plpgsql for our triggers.
$$ LANGUAGE plpgsql;

-- Set the timezone of the database.
SET timezone = 'America/Los_Angeles';

CREATE TABLE IF NOT EXISTS Accounts (
	-- Preferred email for contact.
	email VARCHAR(255) UNIQUE NOT NULL,

  -- Hash of the user's password.
	password TEXT NOT NULL,

  -- Classes that the user has faculty rights over.
	admin BOOL NOT NULL DEFAULT false,

  -- If this user was deleted.
	deleted TIMESTAMPTZ DEFAULT NULL,
	
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

CREATE TABLE IF NOT EXISTS Classes (
	id INT GENERATED ALWAYS AS IDENTITY,

	-- Name of the class, presented to users.
	name VARCHAR(255) NOT NULL,

	-- Owner of the class, by default the one who created it.
	owner VARCHAR(255) NOT NULL,

	-- If this class has been deleted by its owner, then
	-- its deletion time is noted here.
	deleted TIMESTAMPTZ DEFAULT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (owner) REFERENCES Accounts (email)
);

CREATE TABLE IF NOT EXISTS Assignments (
	-- Unique name of the assignment (to be used in submissions)
	name VARCHAR(255) UNIQUE NOT NULL,

	-- Due date.
	due_date TIMESTAMPTZ NOT NULL,

	-- Points possible for the assignment.
	points NUMERIC(11, 8),
	
  PRIMARY KEY (name)
);

CREATE TABLE IF NOT EXISTS Submissions (
	-- Unique submission ID
	id uuid DEFAULT uuid_generate_v4(),
	
	-- ID for the assignment it was submitted to
	assignment VARCHAR(50) NOT NULL,

	-- UID of submitting user.
	owner VARCHAR(255) NOT NULL,

	-- Total points earned in this submission.
	points_earned DOUBLE(11, 8),

	PRIMARY KEY (id),
	FOREIGN KEY (owner) REFERENCES Accounts (email),
	FOREIGN KEY (assignment) REFERENCES Assignments (id),
);