import React from "react";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import StudentAssignmentView from "./StudentAssignmentView";
import ProfessorAssignmentView from "./ProfessorAssignmentView";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

const AssignmentView = () => {
  const mode: "student" | "faculty" = "faculty";
  const [assignmentName, setAssignmentName] = useState("Loading Assignment..."); // dummy value before testing with endpoint
  const [cookies, setCookies] = useCookies(["jwt"]);
  const params = useParams();

  fetch(
    "http://localhost:8080/class/1/1", //"http://localhost:8080/class/${params.classId}/${params.assignmentId}", will change
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
      {mode === "faculty" ? (
        <Button variant="primary" type="submit" style={{ borderRadius: 20 }}>
          Upload Grading Script
        </Button>
      ) : (
        <Button variant="primary" type="submit" style={{ borderRadius: 20 }}>
          Upload Assignment
        </Button>
      )}
      <br />
      <br />
      {mode === "faculty" ? (
        <ProfessorAssignmentView />
      ) : (
        <StudentAssignmentView />
      )}
    </Container>
  );
};

export default AssignmentView;
