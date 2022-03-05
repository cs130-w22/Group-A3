import React, { FormEvent, useState } from "react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Modal from "react-bootstrap/Modal";
import { useCookies } from "react-cookie";
import { uploadSubmission } from "../api";
import { useNavigate } from "react-router-dom";

function UploadSubmissionModal({
  show,
  classId,
  assignmentId,
  handleClose,
}: {
  show: boolean;
  classId: string;
  assignmentId: string;
  handleClose: () => void;
}) {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const navigate = useNavigate();

  const [error, setError] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    uploadSubmission(
      cookies.jwt,
      classId,
      assignmentId,
      data,
      ({ id }) => {
        handleClose();
        navigate(`/results/${id}`);
      },
      (err) => setError(err)
    );
  }

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Submission</Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
            <Form.Control type="file" name="file" accept=".tar.gz" />
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
      </Modal.Body>
    </Modal>
  );
}

export default UploadSubmissionModal;
