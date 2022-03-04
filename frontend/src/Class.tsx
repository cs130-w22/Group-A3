import React, { useEffect, useState } from "react";
import { Card, Container, Stack, Table } from "react-bootstrap";
import { useCookies } from "react-cookie";
import { useNavigate, useParams } from "react-router-dom";
import { ClassData, getClass } from "./api";
import AssignmentCard from "./Card/AssignmentCard";
import CreateAssignmentModal from "./Modal/CreateAssignmentModal";

export default function Class() {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const params = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState<ClassData | null>(null);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [errors, setErrors] = useState<Array<Error>>([]);

  useEffect(() => {
    const classId = String(params.id);
    getClass(
      cookies?.jwt,
      { classId },
      (classData) => {
        setData(classData);
      },
      (newErr) => setErrors((errors) => [newErr, ...errors])
    );
  }, [cookies, params.id]);

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        <h1>{data?.name}</h1>

        <CreateAssignmentModal
          show={showCreateAssignment}
          onHide={() => setShowCreateAssignment(false)}
          onSubmit={(data) => {
            fetch(`http://localhost:8080/class/${params.id}/assignment`, {
              method: "post",
              mode: "cors",
              headers: {
                Authorization: cookies.jwt,
              },
              body: data,
            })
              .then((r) => {
                if (r.status !== 201)
                  throw new Error("Failed to create assignment.");
                return r.json();
              })
              .then((j) => {
                setShowCreateAssignment(false);
                navigate(`/class/${params.id}`);
              })
              .catch((err) => setErrors((errs) => [err, ...errs]));
          }}
        />

        <h2>Assignments</h2>
        <Stack direction="horizontal" gap={3}>
          {data?.assignments?.map((assn, idx) => (
            <AssignmentCard key={idx} classId={params.id} {...assn} />
          ))}
          <Card onClick={() => setShowCreateAssignment(true)}>
            <Card.Body>
              <Card.Title>Create an assignment</Card.Title>
            </Card.Body>
          </Card>
        </Stack>

        <h2>Students</h2>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>UID</th>
            </tr>
          </thead>
          <tbody>
            {data?.members.map(({ id, username }) => (
              <tr key={id}>
                <td>{username}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Container>
  );
}
