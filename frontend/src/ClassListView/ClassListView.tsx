import React, { useState } from "react";

import { useCookies } from "react-cookie";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

import { dropStudent } from "../api";

const ClassId = "1";
const Students = [
  { name: "Edward", grade: 90, id: "1" },
  { name: "Jonathan", grade: 80, id: "2" },
  { name: "Cindy", grade: 50, id: "3" },
];

// Student view of the assignment
function ClassListView() {
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [dropError, setDropError] = useState(false);

  async function handleDropStudent(id: string) {
    await dropStudent(
      cookies.jwt,
      ClassId,
      id,
      () => {
        setDropError(false);
      },
      () => {
        setDropError(true);
      }
    );
    handleClose();
  }
  const handleClose = () => setShow(false);
  const handleShow = () => {
    setDropError(false);
    setShow(true);
  };
  return (
    <Container>
      {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
      {dropError && (
        <Alert variant={"danger"}>Failed to drop student{error}</Alert>
      )}
      <h1>My Students</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Grade</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {Students.map((x, idx) => (
            <tr key={idx}>
              <td>{x.name}</td>
              <td>{x.grade}</td>
              <td>
                <>
                  <Button variant="primary" onClick={handleShow}>
                    Drop Student
                  </Button>
                  <Modal show={show} onHide={handleClose}>
                    <Modal.Body>
                      Are you sure you want to drop {x.name}?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleDropStudent(x.id);
                        }}
                      >
                        Drop Student
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
}

export default ClassListView;
