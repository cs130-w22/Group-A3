--
-- 2-assignments
--
-- Schemas for all class assignments and submissions.
--

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
	FOREIGN KEY (owner) REFERENCES Accounts (username),
	FOREIGN KEY (assignment) REFERENCES Assignments (id),
);