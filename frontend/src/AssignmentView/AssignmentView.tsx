import React from "react";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import ProgressBar from "react-bootstrap/ProgressBar";
import StudentAssignmentView from "./StudentAssignmentView";
import ProfessorAssignmentView from "./ProfessorAssignmentView";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

const AssignmentView = () => {
  const mode: "student" | "faculty" = "student";
  const [assignmentName, setAssignmentName] = useState("Loading Assignment..."); // dummy value before testing with endpoint
  const [information, setInformation] = useState({});
  const [cookies, setCookies] = useCookies(["jwt"]);
  const params = useParams();
  const assignmentInformation = useRef({});

  fetch(
    "http://localhost:8080/class/1/1", //"http://localhost:8080/class/${params.classId}/${params.assignmentId}",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies.jwt,
      },
    }
  )
    .then((resp) => {
      if (resp.status === 200) return resp.json();
    })
    .then((resp) => {
      setAssignmentName(resp.name);
    });
  return (
    <Container>
      <h1>{assignmentName}</h1>
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
