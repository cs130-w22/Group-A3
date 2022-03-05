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

  -- Path to the grading script.
  script_path TEXT NOT NULL,
  
  FOREIGN KEY (class) REFERENCES Courses (id)
);

CREATE TABLE Submissions (
  -- Unique submission ID
  id TEXT NOT NULL,

  -- ID for the assignment it was submitted to
  assignment INT NOT NULL,

  -- UID of submitting user.
  owner INTEGER NOT NULL,

  -- When the assignment was submitted.
  submitted_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  -- Total points earned in this submission.
  points_earned DOUBLE PRECISION,

  PRIMARY KEY (id),
  FOREIGN KEY (owner) REFERENCES Accounts (id),
  FOREIGN KEY (assignment) REFERENCES Assignments (id)
);

-- Detailed table of results for each test case.
CREATE TABLE Results (
  -- Associated submission.
  submission_id TEXT NOT NULL,

  -- ID of the test case.
  test_id INT NOT NULL,

  -- Whether the result is hidden.
  hidden BOOLEAN NOT NULL,

  -- Name of the test.
  test_name VARCHAR(255) NOT NULL,

  -- Score for the result.
  score DOUBLE PRECISION NOT NULL,

  -- Error message
  message VARCHAR(1024) NOT NULL,

  PRIMARY KEY (submission_id, test_id),
  FOREIGN KEY (submission_id) REFERENCES Submissions (id)
);
