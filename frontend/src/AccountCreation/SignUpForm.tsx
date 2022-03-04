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
import { createClass, createUser, joinClass } from "../api";

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
    nav("/");
  }

  //check if passwords match
  function validateForm(
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
      uid: { value: string };
      courseCode?: { value: string };
      courseName?: { value: string };
      password: { value: string };
      confirmPassword: { value: string };
    };

    // truly the worst timeline
    if (
      !validateForm(
        target.uid.value,
        target.password.value,
        target.confirmPassword.value
      )
    )
      return;

    createUser(
      {
        username: target.uid.value,
        password: target.password.value,
        type: mode,
      },
      ({ token }) => {
        setCookies("jwt", token);
        if (mode === "professor" && target.courseName)
          createClass(
            token,
            { name: target.courseName.value },
            ({ id }) => setShow(true),
            (err) => setError(err.message)
          );
        else if (mode === "student")
          joinClass(
            token,
            { inviteCode: String(target?.courseCode?.value) },
            () => setShow(true),
            (err) => setError(err.message)
          );
      },
      (err) => setError(err.message)
    );
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

          {mode === "professor" && (
            <Form.Group className="mb-3" controlId="formCourseName">
              <Form.Label className="signUpFormText">Course Name</Form.Label>
              <Form.Control
                required
                className="signUpForm"
                type="text"
                name="courseName"
                placeholder="CS 31"
              />
            </Form.Group>
          )}

          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">UID</Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="text"
              name="uid"
              placeholder="JoeBruin2"
            />
          </Form.Group>

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
