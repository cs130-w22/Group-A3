import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { Button } from "react-bootstrap";

const SignUpProfessor = () => {
    const [error, setError] = useState("");
    const nav = useNavigate();

    const professsorClicked = () => {
        nav('/create/professor');
    };
    const studentClicked = () => {
        nav('/create/student');
    };

    return (
        <Container>
            <Stack direction="vertical" gap={3}>
                <h1 style={{textAlign: "center", justifyContent: "center", color: "black", font:"Hammersmith One", fontSize:50}} >Professor Sign up</h1>
                <Button onClick={studentClicked}>Student</Button>
                <br/>
                <Button onClick={professsorClicked}>Professor</Button>
            </Stack>
        </Container>
    );
};

export default SignUpProfessor;
