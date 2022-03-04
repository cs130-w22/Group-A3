import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Container from "react-bootstrap/Container";
import StudentAssignmentView from "./StudentAssignmentView";
import ProfessorAssignmentView from "./ProfessorAssignmentView";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import UploadSubmissionModal from "./UploadSubmissionModal";
import AddAssignmentModal from "./AddAssignmentModal";

const AssignmentView = () => {
  const mode: "student" | "faculty" = "faculty";
  const [assignmentName, setAssignmentName] = useState("Loading Assignment..."); // dummy value before testing with endpoint
  const [cookies, setCookies] = useCookies(["jwt"]);
  const params = useParams();

  fetch(
    "http://localhost:8080/class/${params.classId}/${params.assignmentId}",
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
      {mode === "faculty" ? <UploadSubmissionModal /> : <AddAssignmentModal />}
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
