import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";

function Login() {
  const [error, setError] = useState("");
  const nav = useNavigate();

  async function handleLogin() {
    return fetch("http://localhost:8080/login", {
      method: "POST",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Smallberg",
        password: "bigberg",
      }),
    }).then((response) => response.json());
  }

  const createAccount = () => {
    nav("/create");
  };

  const forgotPassword = () => {
    nav("/forgot");
  };

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
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
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Josie Bruin"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" name="password" />
          </Form.Group>
          <Button variant="primary" type="submit" style={{ borderRadius: 20 }}>
            Login
          </Button>
          <br />
          <br />
          <Button
            onClick={forgotPassword}
            variant="secondary"
            type="button"
            style={{ borderRadius: 20 }}
          >
            Forgot Password
          </Button>
          <br />
          <br />
          <Button
            onClick={createAccount}
            variant="secondary"
            type="button"
            style={{ borderRadius: 20 }}
          >
            Register
          </Button>
        </Form>
      </Stack>
    </Container>
  );
}

export default Login;
