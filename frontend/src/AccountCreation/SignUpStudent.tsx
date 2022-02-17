import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";

const SignUpStudent = () => {
  const nav = useNavigate();
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [uid, setUID] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //check if passwords match
  function validateForm(
    name: string,
    uid: string,
    course_code: string,
    password: string,
    confirm_password: string
  ) {
    if (name.length === 0) {
      setError("Please enter your name");
      return false;
    }
    if (uid.length !== 9 || isNaN(parseInt(uid))) {
      setError("Please correct your UID");
      return false;
    }
    if (courseCode.length !== 9 || isNaN(parseInt(uid))) {
      setError("Please enter a course name");
      return false;
    } else if (password !== confirm_password) {
      setError("Passwords do not match");
      return false;
    } else if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  }

  function handleStudentCreation(e: FormEvent) {
    e.preventDefault();
    if (!validateForm(name, uid, courseCode, password, confirmPassword)) return;
    fetch("http://localhost:8080/user", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        username: uid,
        courseCode: courseCode,
        password: password,
        type: "student",
      }),
    })
      //check for errors
      .then((res) => {
        if (res.status === 201 || res.status === 400) {
          //TODO: change this to direct to professor portal
          nav("/class");
        } else {
          setError("Error in Signing Up");
        }
      })
      .catch(setError);
  }

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
        <br />
        <Form onSubmit={handleStudentCreation}>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label>Course Code</Form.Label>
            <Form.Control
              type="text"
              name="course code"
              placeholder="Enter Code"
              onChange={(e) => {
                setCourseCode(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label>First and Last Name</Form.Label>
            <Form.Control
              type="text"
              name="course code"
              placeholder="Joe Bruin"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label>UID</Form.Label>
            <Form.Control
              type="text"
              name="uid"
              placeholder="XXXXXXXXX"
              onChange={(e) => {
                setUID(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label>Re-enter Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
            />
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
