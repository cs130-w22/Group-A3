import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import Modal from "react-bootstrap/Modal";
import React, { FormEvent, useState } from "react";
import { useCookies } from "react-cookie";
import "./CreateAccount.css";
import { Spinner } from "react-bootstrap";

const SignUpProfessor = () => {
  const nav = useNavigate();
  const [error, setError] = useState("");
  const [courseCode, setCourseCode] = useState("");

  const [name, setName] = useState("");
  const [uid, setUID] = useState("");
  const [courseName, setCourseName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const handleShowModal = () => setShow(true);
  const [cookies, setCookies] = useCookies(["jwt"]);

  function handleCloseModal() {
    setShow(false);
    nav("/");
  }

  //check if passwords match
  function validateForm(
    name: string,
    uid: string,
    course_name: string,
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

  function handleProfCreation(e: FormEvent) {
    e.preventDefault();
    if (!validateForm(name, uid, courseName, password, confirmPassword)) return;
    fetch("http://localhost:8080/user", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name,
        username: uid,
        password: password,
        type: "professor",
      }),
    })
      //check for errors
      .then((res) => {
        if (res.status === 201) {
          handleClassCreation(courseName);
        } else {
          setError("Error in Signing Up");
          throw "Error in Signing Up";
        }
      })
      .catch(setError);
  }

  function handleClassCreation(courseName: string) {
    fetch("http://localhost:8080/class", {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: courseName,
      }),
    })
      //check for errors
      .then((res) => {
        if (res.status === 200) {
          handleLogin(uid, password);
        } else {
          setError("Error in Creating Class");
          throw "Error in Creating Class";
        }
      })
      .catch(setError);
  }

  function handleLogin(username: string, password: string) {
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
        if (response.status == 401) throw "Unauthorized";
        return response.json();
      })
      .then((response) => {
        setCookies("jwt", response.token);
        handleShowModal();
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
      <Stack direction="vertical" gap={3}>
        {error && (
          <Alert variant={"danger"}>Failed to create account: {error}</Alert>
        )}
        <br />
        <Form onSubmit={handleProfCreation}>
          <Stack direction="horizontal" className="signUpFormText">
            <Form.Group className="mb-3" controlId="formCourseCode">
              <Form.Label>Your Course Code:</Form.Label>
              <br />
              {getCourseCode()}
              {addCopyButton()}
            </Form.Group>
          </Stack>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">
              First and Last Name
            </Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="text"
              name="course code"
              placeholder="Joe Bruin"
              onChange={(e) => {
                setName(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseCode">
            <Form.Label className="signUpFormText">UID</Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="text"
              name="course code"
              placeholder="---------"
              onChange={(e) => {
                setUID(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formCourseName">
            <Form.Label className="signUpFormText">Course Name</Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="text"
              name="course name"
              onChange={(e) => {
                setCourseName(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="signUpFormText">Password</Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="password"
              name="password"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formPassword">
            <Form.Label className="signUpFormText">
              Re-enter Password
            </Form.Label>
            <Form.Control
              required
              className="signUpForm"
              type="password"
              name="password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
              }}
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

export default SignUpProfessor;
