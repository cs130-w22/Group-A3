import React, { FormEvent, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Modal from "react-bootstrap/Modal";
import { useCookies } from "react-cookie";

import { userContext } from "../Context/UserContext";
import { StudentAssignmentContext } from "../Context/StudentAssignmentContext";

// This view is a form for professors to add a assignment
function UploadSubmissionModal() {
  const studentAssignment = useContext(StudentAssignmentContext);
  const user = useContext(userContext);
  const [cookies, setCookies] = useCookies(["jwt"]);

  const [error, setError] = useState("");
  const nav = useNavigate();
  const classId = 1;
  const assignmentId = 1;

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  function handleSubmission(data: FormData) {
    return fetch(
      `http://localhost:8080/class/${classId}/${assignmentId}/upload`,
      {
        method: "POST",
        mode: "cors",
        headers: {
          Authorization: cookies.jwt,
        },
        body: data,
      }
    )
      .then((response) => {
        if (response.status === 401) throw new Error("Unauthorized");
        return response.json();
      })
      .catch((e) => {
        setError(
          `Failed uploading! Server responded with: ${String(e).replace(
            "TypeError: ",
            ""
          )}`
        );
      });
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    handleSubmission(data);
    // TODO: The API call to submit a file is still unimplemented. Will fix when implemented
    setError((err) => (err ? "" : `File type is not supported`));
    //nav("/professor/class/");
  }

  return (
    <>
      <Button
        variant="primary"
        type="submit"
        style={{ borderRadius: 20 }}
        onClick={handleShow}
      >
        Upload Assignment
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Submission</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Stack direction="vertical" gap={3}>
              {error && <Alert variant="danger">Failed to submit{error}</Alert>}
              <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="formSubmissionName">
                  <Form.Label>Submission name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Submission Name"
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formSubmissionFile">
                  <Form.Label>Submission Upload</Form.Label>
                  <Form.Control type="file" name="submission" />
                </Form.Group>
                <Stack direction="horizontal" gap={3}>
                  <Button variant="primary" type="submit">
                    Create
                  </Button>
                  <Button variant="secondary" onClick={handleClose}>
                    Cancel
                  </Button>
                </Stack>
              </Form>
            </Stack>
          </Container>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default UploadSubmissionModal;
