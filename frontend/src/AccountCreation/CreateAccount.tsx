import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";

const CreateAccount = () => {
    const [error, setError] = useState("");
    const nav = useNavigate();

    const professsorClicked = () => {
        nav('/');
    };
    const studentClicked = () => {
        nav('/');
    };

    return (
        <Container>
            <Stack direction="vertical" gap={3}>
                {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
                <h1 style={{textAlign: "center", justifyContent: "center", color: "black", font:"Hammersmith One", fontSize:50}} >Who are you?</h1>
                <Button onClick={studentClicked}>Student</Button>
                <br/>
                <Button onClick={professsorClicked}>Professor</Button>
            </Stack>
        </Container>
    );
};

export default CreateAccount;
