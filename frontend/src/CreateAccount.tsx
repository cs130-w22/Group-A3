import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Stack from "react-bootstrap/Stack";

const CreateAccount = () => {
    const [error, setError] = useState("");

    const submit: React.FormEventHandler<HTMLFormElement> = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(err => err ? "" : `Username is invalid.`);
    };

    return (
        <Container>
            <Stack direction="vertical" gap={3}>
                {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
                <h1 style={{textAlign: "center", justifyContent: "center", color: "black", font:"Hammersmith One", fontSize:50}} >Who are you?</h1>
                <Button variant="primary" type="button">
                    Student
                </Button>
                <br/>
                <Button variant="secondary" type="button">
                    Professor
                </Button>
            </Stack>
        </Container>
    );
};

export default CreateAccount;
