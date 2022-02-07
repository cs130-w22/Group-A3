import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

const SignUpStudent = () => {
  const nav = useNavigate();
  const [error, setError] = useState("");

  const submit: React.FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError((err) => (err ? "" : "Make Sure All Fields Are Filled"));
    nav("/class");
  };

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
        <br />
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label>Course Code</Form.Label>
            <Form.Control
              type="text"
              name="course code"
              placeholder="Enter Code"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label>First and Last Name</Form.Label>
            <Form.Control
              type="text"
              name="course code"
              placeholder="Joe Bruin"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label>UID</Form.Label>
            <Form.Control
              type="text"
              name="course code"
              placeholder="XXXXXXXXX"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Re-enter Password</Form.Label>
            <Form.Control type="password" name="password" />
          </Form.Group>
          <br />
          <Button variant="primary" type="submit" style={{ borderRadius: 20 }}>
            Create Account
          </Button>
          <br />
        </Form>
        <br />
      </Stack>
    </Container>
  );
};

export default SignUpStudent;
