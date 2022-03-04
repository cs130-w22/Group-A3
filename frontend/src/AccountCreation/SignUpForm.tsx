import React, { FormEvent, useState } from "react";

import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";
import Spinner from "react-bootstrap/Spinner";

import "./CreateAccount.css";

const SuccessModal = ({
  show,
  handleCloseModal,
}: {
  show: boolean;
  handleCloseModal: () => void;
}) => (
  <Modal show={show} onHide={handleCloseModal}>
    <Modal.Header>
      <Modal.Title>Account Created Successfully</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      You will now be directed to the assignment view where you can add
      assignments and manage your class.
    </Modal.Body>
    <Modal.Footer>
      <Button variant="primary" onClick={handleCloseModal}>
        Let&apos;s Go!
      </Button>
    </Modal.Footer>
  </Modal>
);

/**
 * Form to create a new account in the Gradebetter system.
 *
 * @param props Mode to render the form in: either professor or student.
 */
const SignUpForm = ({ mode }: { mode: "professor" | "student" }) => {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const { 0: courseCode } = useState("");

  const [show, setShow] = useState(false);
  const { 1: setCookies } = useCookies(["jwt"]);

  function handleCloseModal() {
    setShow(false);
    nav("/class");
  }

  //check if passwords match
  function validateForm(
    name: string,
    uid: string,
    password: string,
    confirm_password: string
  ) {
    if (uid.length !== 9 || isNaN(parseInt(uid))) {
      setError("Please correct your UID");
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

  function handleCreation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const target = e.currentTarget as typeof e.currentTarget & {
      name: { value: string };
      uid: { value: string };
      courseCode?: { value: string };
      courseName?: { value: string };
      password: { value: string };
      confirmPassword: { value: string };
    };

    // truly the worst timeline
    if (
      !validateForm(
        target.name.value,
        target.uid.value,
        target.password.value,
        target.confirmPassword.value
      )
    )
      return;

    fetch("http://localhost:8080/user", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: target.name.value,
        username: target.uid.value,
        password: target.password.value,
        type: mode,
      }),
    })
      .then((r) => {
        if (r.status !== 201) throw new Error("Error in signing up!");
        return r.json();
      })
      .then((j) => {
        setCookies("jwt", j?.token);
        if (mode === "professor" && target.courseName)
          handleClassCreation(j?.token, target.courseName.value);
        else if (mode === "student") setShow(true);
      })
      .catch(setError);
  }

  function handleClassCreation(authToken: string, courseName: string) {
    fetch("http://localhost:8080/class", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: authToken,
      },
      body: JSON.stringify({
        name: courseName,
      }),
    })
      .then((res) => {
        if (res.status !== 201) throw new Error("Error in creating class");
        setShow(true);
      })
      .catch(setError);
  }

  function getCourseCode() {
    if (courseCode !== "") {
      return (
        <Form.Label
          style={{
            textAlign: "center",
            justifyContent: "center",
            color: "black",
            font: "Hammersmith One",
            fontSize: 30,
            fontWeight: "bolder",
            marginRight: 30,
          }}
        >
          {courseCode}
        </Form.Label>
      );
    } else {
      return (
        <Spinner animation="border" variant="secondary" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      );
    }
  }

  function addCopyButton() {
    if (courseCode !== "") {
      return (
        <Button
          onClick={() => {
            navigator.clipboard.writeText(courseCode);
          }}
          variant="outline-secondary"
          type="button"
          style={{ borderRadius: 100, marginTop: -10 }}
        >
          Copy
        </Button>
      );
    }
  }

  return (
    <Container>
      <SuccessModal show={show} handleCloseModal={handleCloseModal} />
      <Stack direction="vertical" gap={3}>
        {error && (
          <Alert variant={"danger"}>Failed to create account: {error}</Alert>
        )}
        <br />
        <Form onSubmit={handleCreation}>
          {mode === "professor" && (
            <Stack direction="horizontal" className="signUpFormText">
              <Form.Group className="mb-3" controlId="formCourseCode">
                <Form.Label>Your Course Code:</Form.Label>
                <br />
                {getCourseCode()}
                {addCopyButton()}
              </Form.Group>
            </Stack>
          )}

          {mode === "student" && (
            <Form.Group className="mb-3" controlId="formCourseCode">
              <Form.Label className="signUpFormText">Course Code</Form.Label>
              <Form.Control
                required
                className="signUpForm"
                type="text"
                name="courseCode"
                placeholder="Enter Code"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">
              First and Last Name
            </Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="text"
              name="name"
              placeholder="Joe Bruin"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">UID</Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="text"
              name="uid"
              placeholder="---------"
            />
          </Form.Group>

          {mode === "professor" && (
            <Form.Group className="mb-3" controlId="formCourseName">
              <Form.Label className="signUpFormText">Course Name</Form.Label>
              <Form.Control
                required
                className="signUpForm"
                type="text"
                name="courseName"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="signUpFormText">Password</Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="password"
              name="password"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label className="signUpFormText">
              Re-enter Password
            </Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="password"
              name="confirmPassword"
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
              style={{
                borderRadius: 100,
                width: 400,
                fontSize: 25,
                fontWeight: "bolder",
              }}
            >
              Create Account
            </Button>
          </div>
          <br />
        </Form>
        <br />
      </Stack>
    </Container>
  );
};

export default SignUpForm;
