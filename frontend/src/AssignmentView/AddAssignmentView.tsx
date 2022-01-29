import React, { useState} from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
 
//This view is a form for professors to add a assignment 
const AddAssignmentView = () => {
  const [error, setError] = useState("");
  const nav = useNavigate();


  const submit: React.FormEventHandler<HTMLFormElement> = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //send assignment data to database 
    //set up autograding (?)
    setError(err => err ? "" : `File type is not supported`);
    nav('/professor/class/');
  };

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {error && <Alert variant={"danger"}>Failed to create assignment{error}</Alert>}
        <h1>Add Assignment</h1>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="formAssignmentName">
            <Form.Label>Assignment name</Form.Label>
            <Form.Control type="text" name="name" placeholder="Josie Bruin" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formDueDate">
            <Form.Label>Due Date</Form.Label>
            <Form.Control type="date" name="due date" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formGradingScript">
            <Form.Label>Grading Script</Form.Label>
            <Form.Control type="file" name="script" />
          </Form.Group>
          <Button variant="primary" type="submit">
            Create
          </Button>
        </Form>
      </Stack>
    </Container>
  );
};

export default AddAssignmentView;
