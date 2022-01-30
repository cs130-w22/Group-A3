import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Modal from "react-bootstrap/Modal"
 
//This view is a form for professors to add a assignment 
const AddAssignmentModal = () => {
  const [error, setError] = useState("");
  const nav = useNavigate();

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const submit: React.FormEventHandler<HTMLFormElement> = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //send assignment data to database 
    //set up autograding (?)
    setError(err => err ? "" : `File type is not supported`);
    nav('/professor/class/');
  }; 

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Add Assignment
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <Container>
          <Stack direction="vertical" gap={3}>
            {error && <Alert variant={"danger"}>Failed to create assignment{error}</Alert>}
            <Form onSubmit={submit}>
              <Form.Group className="mb-3" controlId="formAssignmentName">
                <Form.Label>Assignment name</Form.Label>
                <Form.Control type="text" name="name" placeholder="Assignment Name" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formDueDate">
                <Form.Label>Due Date</Form.Label>
                <Form.Control type="date" name="due date" />
              </Form.Group>
              <Form.Group className="mb-3" controlId="formGradingScript">
                <Form.Label>Grading Script</Form.Label>
                <Form.Control type="file" name="script" />
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
};

export default AddAssignmentModal;
