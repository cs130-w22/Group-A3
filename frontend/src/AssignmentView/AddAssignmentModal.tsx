import React, { FormEvent, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Modal from "react-bootstrap/Modal";
import { userContext } from "../Context/UserContext";
import { ProfessorAssignmentContext } from "../Context/ProfessorAssignmentContext";

// This view is a form for professors to add a assignment
function AddAssignmentModal() {
  const assignment = useContext(ProfessorAssignmentContext);
  const user = useContext(userContext);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const [show, setShow] = useState(false);
  const [gradingScriptName, setGradingScriptName] = useState("");
  const [gradingScriptFile, setGradingScriptFile] = useState("");
  const [dueDate, setDueDate] = useState("");
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const onInputGradingScriptName = ({
    target: { value },
  }: {
    target: { value: string };
  }) => setGradingScriptName(value);

  const onInputGradingScriptFile = ({
    target: { value },
  }: {
    target: { value: string };
  }) => setGradingScriptFile(value);

  const onInputDueDate = ({
    target: { value },
  }: {
    target: { value: string };
  }) => setDueDate(value);

  async function handleGradingScript() {
    return fetch(
      "http://localhost:8080/" +
        user.user.class.id +
        "/" +
        assignment.assignment.id,
      {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          GradingScriptName: gradingScriptName,
          GradingScriptFile: gradingScriptFile,
        }),
      }
    )
      .then((response) => {
        if (response.status == 401) throw "Unauthorized";
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

  async function submit(e: FormEvent) {
    e.preventDefault();
    //const response = await handleGradingScript();
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
        Upload Grading Script
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Container>
            <Stack direction="vertical" gap={3}>
              {error && (
                <Alert variant="danger">
                  Failed to create assignment{error}
                </Alert>
              )}
              <Form onSubmit={submit}>
                <Form.Group className="mb-3" controlId="formAssignmentName">
                  <Form.Label>Assignment name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Assignment Name"
                    value={gradingScriptName}
                    onChange={onInputGradingScriptName}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formDueDate">
                  <Form.Label>Due Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="due date"
                    value={dueDate}
                    onChange={onInputDueDate}
                  />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formGradingScript">
                  <Form.Label>Grading Script</Form.Label>
                  <Form.Control
                    type="file"
                    name="script"
                    value={gradingScriptFile}
                    onChange={onInputGradingScriptFile}
                  />
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

export default AddAssignmentModal;
