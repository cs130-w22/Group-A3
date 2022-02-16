import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import { userContext } from "./Context/UserContext";
function Login() {
  const [error, setError] = useState("");
  const [user, setUser] = useState({ user: { token: "" } });
  const [token, setToken] = useState("");
  const nav = useNavigate();

  async function handleLogin(username: string, password: string) {
    return fetch("http://localhost:8080/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    }).then((data) => data.json());
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //setError((err) => (err ? "" : `Username is invalid.`));
    const token = await handleLogin("Smallberg", "bigberg");
    setToken(token);
    sessionStorage.setItem("token", token);
    setUser({ user: { token: token } });
    //nav("/class");
  }

  return (
    //<userContext.Provider value ={user}>
    <Container>
      <Stack direction="vertical" gap={3}>
        {error && <Alert variant="danger">Failed to login: {error}</Alert>}
        <h1>Your class name</h1>
        <p>Log in to the [YOUR CLASS] grading system.</p>
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
          <Button variant="primary" type="submit">
            Login
          </Button>
        </Form>
      </Stack>
    </Container>
    //</userContext.Provider>
  );
}

export default Login;
