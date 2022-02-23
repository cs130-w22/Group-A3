import React from "react";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import ProgressBar from "react-bootstrap/ProgressBar";
import StudentAssignmentView from "./StudentAssignmentView";
import ProfessorAssignmentView from "./ProfessorAssignmentView";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"];
const AssignmentView = () => {
  const mode: "student" | "faculty" = "student"; //needs to be taken from backend or state
  const [assignmentName, setAssignmentName] = useState("");
  const [mean, setMean] = useState(0);
  const [median, setMedian] = useState(0);

  return (
    <Container>
      <h1>Assignment 1</h1>
      <Form.Group className="mb-3">
        <Form.Control type="file" />
      </Form.Group>
      {mode === "student" ? (
        <Button variant="primary" type="submit" style={{ borderRadius: 20 }}>
          Upload Assignment
        </Button>
      ) : (
        <Button variant="primary" type="submit" style={{ borderRadius: 20 }}>
          Upload Grading Script
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
};

export default AssignmentView;
