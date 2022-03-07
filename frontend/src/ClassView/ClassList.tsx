import React, { useState, useEffect } from "react";

import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Alert from "react-bootstrap/Alert";

import { dropStudent, getClass } from "../api";

function ClassListView() {
  const params = useParams();
  const arr: { id: number; username: string }[] = [];
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [students, setStudents] = useState(arr);
  const [classId, setClassId] = useState(params.classId);

  useEffect(() => {
    setClassId(params.classId);
    if (classId) {
      getClass(
        cookies.jwt,
        { classId },
        (res) => {
          console.log(res);
          setStudents(res.members);
          console.log(students);
        },
        () => {
          setError("can't find class");
        }
      );
    }
  }, []);

  function handleDropStudent(id: string) {
    if (classId && id) {
      dropStudent(
        cookies.jwt,
        { classId, id },
        () => {
          setError("Dropped student!");
        },
        () => {
          setError("Failed dropping student!");
        }
      );
    }
    handleClose();
  }

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <Container>
      {error && <Alert variant={"danger"}>Failed to login: {error}</Alert>}
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
          {students.map((x, id) => (
            <tr key={x.username}>
              <td>{x.username}</td>
              <td>
                <>
                  <Button variant="primary" onClick={handleShow}>
                    Drop Student
                  </Button>
                  <Modal show={show} onHide={handleClose}>
                    <Modal.Body>
                      Are you sure you want to drop {x.id}?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleClose}>
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          handleDropStudent(x.id + "");
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
