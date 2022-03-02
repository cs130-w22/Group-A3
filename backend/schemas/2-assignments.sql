--
-- 2-assignments
--
-- Schemas for all class assignments and submissions.
--

CREATE TABLE Assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Owning class
  class INT NOT NULL,

  -- Name of the assignment (to be used in submissions)
  name VARCHAR(255) NOT NULL,

  -- Due date.
  due_date DATETIME NOT NULL,

  -- Points possible for the assignment.
  points DOUBLE PRECISION,
  
  FOREIGN KEY (class) REFERENCES Courses (id)
);

CREATE TABLE Submissions (
  -- Unique submission ID
  id TEXT NOT NULL,

  -- ID for the assignment it was submitted to
  assignment INT NOT NULL,

  -- UID of submitting user.
  owner VARCHAR(255) NOT NULL,

  -- When the assignment was submitted.
  submitted_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Total points earned in this submission.
  points_earned DOUBLE PRECISION,

  PRIMARY KEY (id),
  FOREIGN KEY (owner) REFERENCES Accounts (username),
  FOREIGN KEY (assignment) REFERENCES Assignments (id)
);
