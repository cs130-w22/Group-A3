import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";

const Login = () => {
  const [error, setError] = useState("");

  const submit: React.FormEventHandler<HTMLFormElement> = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(err => err ? "" : `Username is invalid.`);
  };

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
        <h1 style={{textAlign: "center", color: "#1273de", font:"Hammersmith One", fontSize:80}} >Gradebetter</h1>
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control type="text" name="username" placeholder="Josie Bruin" />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" />
          </Form.Group>
          <Button variant="primary" type="submit">
            Login
          </Button>
          <Button variant="secondary" type="button">
            Register
          </Button>
        </Form>
      </Stack>
    </Container>
  );
};

export default Login;
