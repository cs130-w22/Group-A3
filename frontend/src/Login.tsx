import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { userContext } from "./Context/UserContext";
function Login() {
  const [error, setError] = useState("");
  //const [user, setUser] = useState({ user: { token: "" } });
  const [token, setToken] = useState("");
  const nav = useNavigate();

  async function handleLogin(username: string, password: string) {
    return (
      fetch("http://localhost:8080/login", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // TODO: change these out for the state variables.
          username: "leo",
          password: "mypass",
        }),
      })
        // TODO: redirect here.
        .then((response) => response.json())
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //setError((err) => (err ? "" : `Username is invalid.`));
    const token = await handleLogin("Smallberg", "bigberg");
    setToken(token.token);
    console.log(token);
    sessionStorage.setItem("token", token.token);
    //setUser({ user: { token: token } });
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
