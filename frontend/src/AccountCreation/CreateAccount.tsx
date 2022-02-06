import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";
import "./CreateAccount.css";
import SignUpProfessor from "./SignUpProfessor";
import SignUpStudent from "./SignUpStudent";

enum Mode {
  CHOOSING = 0,
  STUDENT = 1,
  PROFESSOR = 2,
}

const CreateAccount = () => {
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
        <h2
          style={{
            textAlign: "center",
            justifyContent: "center",
            color: "gray",
            font: "Hammersmith One",
            fontSize: 30,
          }}
        >
          I am a
        </h2>
        <Button onClick={studentClicked}>Student</Button>
        <br />
        {mode === Mode.STUDENT && <SignUpStudent />}
        <Button onClick={professsorClicked}>Professor</Button>
        <br />
        {mode === Mode.PROFESSOR && <SignUpProfessor />}
        <Button
          variant="outline-primary"
          onClick={() => nav("/")}
          style={{ marginBottom: "1rem" }}
        >
          Back
        </Button>
      </Stack>
    </Container>
  );
};

export default CreateAccount;
