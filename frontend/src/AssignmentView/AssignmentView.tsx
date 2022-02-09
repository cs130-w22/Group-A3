import React from "react";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import ProgressBar from "react-bootstrap/ProgressBar";
import StudentAssignmentView from "./StudentAssignmentView";
import ProfessorAssignmentView from "./ProfessorAssignmentView";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"];
function AssignmentView() {
  const mode: "student" | "faculty" = "student"; //needs to be taken from backend or state
  return (
    <Container>
      <h1>Assignment 1</h1>
      <Form.Group className="mb-3">
        <Form.Control type="file" />
      </Form.Group>
      {mode === "student" ? (
        <Button variant="primary" type="submit">
          Submit Assignment
        </Button>
      ) : (
        <Button variant="primary" type="submit">
          Submit Grading Script
        </Button>
      )}
      <br />
      <br />
      {mode === "student" ? (
        <StudentAssignmentView />
      ) : (
        <ProfessorAssignmentView />
      )}
    </Container>
  );
}

export default AssignmentView;
