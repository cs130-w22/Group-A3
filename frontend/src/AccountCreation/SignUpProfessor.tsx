import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import React, { useState } from "react";
import "./CreateAccount.css";

const SignUpProfessor = () => {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [courseCode, setCourseCode] = useState("000000000");

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
          <Stack direction="horizontal" className="signUpFormText">
            <Form.Group className="mb-3" controlId="formCourseCode">
              <Form.Label>Your Course Code:</Form.Label>
              <br />
              <Form.Label
                style={{
                  textAlign: "center",
                  justifyContent: "center",
                  color: "black",
                  font: "Hammersmith One",
                  fontSize: 30,
                  fontWeight: "bolder",
                  marginRight: 20,
                }}
              >
                {courseCode}
              </Form.Label>
            </Form.Group>
            <br />
            <br />
            <Button
              onClick={() => {
                navigator.clipboard.writeText(courseCode);
              }}
              variant="outline-secondary"
              type="button"
              style={{ borderRadius: 100 }}
            >
              <label>Copy</label>
            </Button>
          </Stack>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">
              First and Last Name
            </Form.Label>
            <Form.Control
              className="signUpForm"
              type="text"
              name="course code"
              placeholder="Joe Bruin"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">UID</Form.Label>
            <Form.Control
              className="signUpForm"
              type="text"
              name="course code"
              placeholder="---------"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseName">
            <Form.Label className="signUpFormText">Course Name</Form.Label>
            <Form.Control
              className="signUpForm"
              type="text"
              name="course name"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="signUpFormText">Password</Form.Label>
            <Form.Control
              className="signUpForm"
              type="password"
              name="password"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="signUpFormText">
              Re-enter Password
            </Form.Label>
            <Form.Control
              className="signUpForm"
              type="password"
              name="password"
            />
          </Form.Group>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              variant="primary"
              type="submit"
              style={{ borderRadius: 100, width: 400 }}
            >
              <label style={{ fontSize: 25, fontWeight: "bolder" }}>
                Create Account
              </label>
            </Button>
          </div>
          <br />
        </Form>
        <br />
      </Stack>
    </Container>
  );
};

export default SignUpProfessor;
