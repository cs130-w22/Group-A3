import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";

import { useCookies } from "react-cookie";
import { login } from "./api";
function Login() {
  const [error, setError] = useState("");
  const { 1: setCookies } = useCookies(["jwt"]);

  const nav = useNavigate();

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const target = e.currentTarget as typeof e.currentTarget & {
      username: { value: string };
      password: { value: string };
    };

    login(
      { username: target.username.value, password: target.password.value },
      ({ token }) => {
        setCookies("jwt", token);
        nav("/");
      },
      (e) =>
        setError(
          `Failed uploading! Server responded with: ${String(e).replace(
            "TypeError: ",
            ""
          )}`
        )
    );
  }

  const createAccount = () => {
    nav("/create");
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
        <Form onSubmit={submit}>
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

          <Stack direction="vertical" gap={3}>
            <Row>
              <Button
                variant="primary"
                size="lg"
                type="submit"
                style={{ borderRadius: 20 }}
              >
                Login
              </Button>
            </Row>
            <Stack direction="horizontal" gap={3}>
              <div className="ms-auto">
                <Button
                  onClick={createAccount}
                  variant="secondary"
                  size="lg"
                  type="button"
                  style={{ borderRadius: 20 }}
                >
                  Register
                </Button>
              </div>
            </Stack>
          </Stack>
        </Form>
      </Stack>
    </Container>
  );
}

export default Login;
