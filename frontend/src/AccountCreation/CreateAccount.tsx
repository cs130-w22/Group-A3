import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";

const CreateAccount = () => {
  const nav = useNavigate();
  const professsorClicked = () => {
    nav("/create/professor");
  };
  const studentClicked = () => {
    nav("/create/student");
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
          Who are you?
        </h2>
        <Button onClick={studentClicked}>Student</Button>
        <br />
        <Button onClick={professsorClicked}>Professor</Button>
        <br />
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
