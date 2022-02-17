import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";

function Login() {
  const [error, setError] = useState("");
  const nav = useNavigate();

  //variable
  const [uid, setUID] = useState("");
  const [password, setPassword] = useState("");

  function handleLogin(e: FormEvent) {
    e.preventDefault();
    fetch("http://localhost:8080/login", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // TODO: change these out for the state variables.
        username: uid,
        password: password,
      }),
    })
      //check for errors
      .then((res) => {
        if (res.status === 200 || res.status === 204) {
          nav("/class");
        } else {
          setError("Invalid UID or password");
        }
      })
      .catch(setError);
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
        {/*
        Every onSubmit handler takes a parameter e, being the *EVENT* that triggered it.
        We can prevent the default behavior by calling e.preventDefault(), which we do
        in our handleLogin function declared above.
        */}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formUsername">
            <Form.Label>UID</Form.Label>
            <Form.Control
              type="text"
              name="uid"
              placeholder="Josie Bruin"
              onChange={(e) => {
                setUID(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              //Update the state variable on change.
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              type="password"
              name="password"
            />
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
