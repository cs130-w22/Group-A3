import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";

import { userContext } from "./Context/UserContext";

import { useCookies } from "react-cookie";
function Login() {
  const [error, setError] = useState("");
  const [cookies, setCookies] = useCookies(["jwt"]);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState({ user: { token: "" } });
  const [token, setToken] = useState("");

  const nav = useNavigate();

  async function handleLogin(username: string, password: string) {
    return fetch("http://localhost:8080/login", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((response) => {
        if (response.status == 401)
          throw 'Unauthorized';
        return response.json();
      })
      .then((response) => {
        setCookies("jwt", response.token);
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
    const response = await handleLogin(username, password);
    setUser({ user: { token: token } });
  }

  const onInputUsername = ({
    target: { value },
  }: {
    target: { value: string };
  }) => setUsername(value);
  const onInputPassword = ({
    target: { value },
  }: {
    target: { value: string };
  }) => setPassword(value);

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
        <Form onSubmit={submit}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              placeholder="Josie Bruin"
              value={username}
              onChange={onInputUsername}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={password}
              onChange={onInputPassword}
            />
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
              <div className="me-auto">
                <Button
                  onClick={forgotPassword}
                  variant="secondary"
                  size="lg"
                  type="button"
                  style={{ borderRadius: 20 }}
                >
                  Forgot Password
                </Button>
              </div>
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
