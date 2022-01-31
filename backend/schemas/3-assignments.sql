--
-- 3-assignments
--
-- Schemas for all class assignments and submissions.
--

CREATE TABLE IF NOT EXISTS Assignments (
  id INT GENERATED ALWAYS AS IDENTITY,

  -- Owning class
  class INT NOT NULL,

  -- Name of the assignment (to be used in submissions)
  name VARCHAR(255) NOT NULL,

  -- Due date.
  due_date TIMESTAMPTZ NOT NULL,

  -- Points possible for the assignment.
  points DOUBLE PRECISION,
  
  PRIMARY KEY (id),
  FOREIGN KEY (class) REFERENCES Classes (id)
);

CREATE TABLE IF NOT EXISTS Submissions (
  -- Unique submission ID
  id uuid DEFAULT uuid_generate_v4(),
  
  -- ID for the assignment it was submitted to
  assignment INT NOT NULL,

  -- UID of submitting user.
  owner VARCHAR(255) NOT NULL,

  -- Total points earned in this submission.
  points_earned DOUBLE PRECISION,

  PRIMARY KEY (id),
  FOREIGN KEY (owner) REFERENCES Accounts (username),
  FOREIGN KEY (assignment) REFERENCES Assignments (id)
);
