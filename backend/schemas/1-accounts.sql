--
-- 1-accounts
--
-- Schemas describing the accounts system.
--


CREATE EXTENSION pgcrypto;
$$ LANGUAGE plpgsql;
SET timezone = 'America/Los_Angeles';


-- All accounts in the system.
CREATE TABLE Accounts (
	-- Generated ID for internal use only.
	id INT GENERATED ALWAYS AS IDENTITY,

	-- UID for the student.
	username VARCHAR(255) UNIQUE NOT NULL,

  -- Hash of the user's password.
	password TEXT NOT NULL,

	-- If the account is a professor or not.
	professor BOOLEAN NOT NULL DEFAULT 'false',

  -- If this user was deleted, then when.
	deleted TIMESTAMPTZ DEFAULT NULL,
	
  PRIMARY KEY (id),
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


-- Table of entries, where each entry corresponds to the permissions of a
-- user (uid) over a given class (class_id).
CREATE TYPE permissions AS ENUM ('ta', 'student');
CREATE TABLE ClassMembers (
	-- ID of the associated class member.
	user_id INT NOT NULL,

	-- ID of the class.
	class_id INT NOT NULL,

	-- Permissions over the class.
	status permissions NOT NULL DEFAULT 'student',

	PRIMARY KEY (user_id, class_id),
	FOREIGN KEY (user_id) REFERENCES Accounts (id),
	FOREIGN KEY (class_id) REFERENCES Classes (id)
);


CREATE TABLE Classes (
	id INT GENERATED ALWAYS AS IDENTITY,

	-- Name of the class, presented to users.
	name VARCHAR(255) NOT NULL,

	-- ID of the managing professor.
	owner INT NOT NULL,

	-- When the class was created.
	created TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

	-- If this class has been deleted by its owner, then
	-- its deletion time is noted here.
	deleted TIMESTAMPTZ DEFAULT NULL,
	
	PRIMARY KEY (id),
	FOREIGN KEY (owner) REFERENCES Accounts (id)
);


-- Valid invite codes to classes.
CREATE TABLE Invites (
	-- ID of the invite (code that is used on user side).
	id uuid DEFAULT uuid_generate_v4(),

	-- Class this invite is associated to.
	invites_to INT NOT NULL,

	-- How many times this invite has been used.
	use_count INT NOT NULL,

	-- When this invite expire(d|s).
	expires TIMESTAMPTZ NOT NULL,

	-- User that created this invite.
	created_by INT,

	PRIMARY KEY (id),
	FOREIGN KEY (invites_to) REFERENCES Classes (id),
	FOREIGN KEY (created_by) REFERENCES Accounts (id)
);
