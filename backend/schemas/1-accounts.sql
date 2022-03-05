--
-- 1-accounts
--
-- Schemas describing the accounts system.
--


-- All accounts in the system.
CREATE TABLE IF NOT EXISTS Accounts (
  -- Generated ID for internal use only.
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- UID for the student.
  username VARCHAR(255) UNIQUE NOT NULL,

  -- Hash of the user's password.
  password TEXT NOT NULL,

  -- Salt for the password.
  salt TEXT NOT NULL,

  -- If the account is a professor or not.
  professor BOOLEAN NOT NULL DEFAULT 'false',

  -- If this user was deleted, then when.
  deleted TIMESTAMP DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS Courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Name of the class, presented to users.
  name VARCHAR(255) NOT NULL,

  -- ID of the managing professor.
  owner INT NOT NULL,

  -- When the class was created.
  created DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- If this class has been deleted by its owner, then
  -- its deletion time is noted here.
  deleted TIMESTAMP DEFAULT NULL,
  
  FOREIGN KEY (owner) REFERENCES Accounts (id)
);


-- Table of entries, where each entry corresponds to the permissions of a
-- user (uid) over a given class (class_id).
CREATE TABLE IF NOT EXISTS ClassMembers (
  -- ID of the associated class member.
  user_id INT NOT NULL,

  -- ID of the class.
  class_id INT NOT NULL,

  -- Permissions over the class.
  status TEXT CHECK(status IN ('ta', 'student')) NOT NULL DEFAULT 'student',

  PRIMARY KEY (user_id, class_id),
  FOREIGN KEY (user_id) REFERENCES Accounts (id),
  FOREIGN KEY (class_id) REFERENCES Courses (id)
);


-- Valid invite codes to classes.
CREATE TABLE IF NOT EXISTS Invites (
  -- ID of the invite (code that is used on user side).
  id TEXT NOT NULL,

  -- Class this invite is associated to.
  invites_to INT NOT NULL,

  -- How many times this invite has been used.
  use_count INT NOT NULL,

  -- When this invite expire(d|s).
  expires DATETIME NOT NULL,

  -- User that created this invite.
  created_by INT NOT NULL,

  PRIMARY KEY (id),
  FOREIGN KEY (invites_to) REFERENCES Courses (id),
  FOREIGN KEY (created_by) REFERENCES Accounts (id)
);
