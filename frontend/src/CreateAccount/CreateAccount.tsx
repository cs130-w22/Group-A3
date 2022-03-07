import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import "./CreateAccount.css";
import SignUpForm from "./SignUpForm";
import { useCookies } from "react-cookie";

enum Mode {
  CHOOSING = 0,
  STUDENT = 1,
  PROFESSOR = 2,
}

const CreateAccount = () => {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [mode, setMode] = useState(Mode.CHOOSING);
  const nav = useNavigate();

  const professsorClicked = () => {
    setMode(Mode.PROFESSOR);
  };
  const studentClicked = () => {
    setMode(Mode.STUDENT);
  };

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        <br />
        <br />
        <h2
          style={{
            textAlign: "center",
            justifyContent: "center",
            color: "gray",
            font: "Hammersmith One",
            fontSize: 30,
          }}
        >
          <b>I am a</b>
        </h2>
        <Stack
          direction="horizontal"
          gap={3}
          style={{ justifyContent: "center" }}
        >
          <Button
            variant="secondary"
            style={{
              borderRadius: 100,
              backgroundColor: mode === Mode.STUDENT ? "#1163F6" : "gray",
              width: 300,
              height: 60,
              alignContent: "center",
              fontSize: 25,
              fontWeight: "bolder",
            }}
            onClick={studentClicked}
          >
            Student
          </Button>
          <br />
          <Button
            variant="secondary"
            style={{
              borderRadius: 100,
              backgroundColor: mode === Mode.PROFESSOR ? "#1163F6" : "gray",
              width: 300,
              height: 60,
              alignContent: "center",
              fontSize: 25,
              fontWeight: "bolder",
            }}
            onClick={professsorClicked}
          >
            Professor
          </Button>
        </Stack>
        {mode !== Mode.CHOOSING && (
          <SignUpForm mode={mode === Mode.STUDENT ? "student" : "professor"} />
        )}
        <Button
          variant="outline-primary"
          onClick={() => {
            setCookies("jwt", "");
            nav("/");
          }}
          style={{
            marginBottom: "1rem",
            borderRadius: 100,
            marginLeft: "32%",
            marginRight: "32%",
          }}
        >
          Back
        </Button>
      </Stack>
    </Container>
  );
};

export default CreateAccount;
