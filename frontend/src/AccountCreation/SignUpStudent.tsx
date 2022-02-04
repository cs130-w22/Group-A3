import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";

const SignUpStudent = () => {
  const nav = useNavigate();

  const submit: React.FormEventHandler<HTMLFormElement> = (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    nav("/class");
  };

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        <br />
        <h1
          style={{
            textAlign: "center",
            justifyContent: "center",
            color: "#1273de",
            font: "Hammersmith One",
            fontSize: 80,
          }}
        >
          Gradebetter
        </h1>
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
        <Button
          variant="outline-primary"
          onClick={() => nav("/create")}
          style={{ marginBottom: "1rem" }}
        >
          Back
        </Button>
      </Stack>
    </Container>
  );
};

export default SignUpStudent;
