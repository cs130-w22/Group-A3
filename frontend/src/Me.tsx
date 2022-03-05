import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";
import Stack from "react-bootstrap/Stack";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

import { Link } from "react-router-dom";
import JoinClassModal from "./Modal/JoinClassModal";
import CreateClassModal from "./Modal/CreateClassModal";

import {
  createClass,
  createInvite,
  getMe,
  joinClass,
  UserInformation,
} from "./api";
import AssignmentCard from "./Card/AssignmentCard";
import CreateAssignmentModal from "./Modal/CreateAssignmentModal";
import CreateInviteModal from "./Modal/CreateInviteModal";
import Header from "./Display/Header";

export default function Me() {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const removeCookies = () => {
    setCookies("jwt", "");
  };

  const [showJoinClass, setShowJoinClass] = useState(false);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [data, setData] = useState<UserInformation | null>(null);
  const [errors, setErrors] = useState<Array<Error>>([]);

  // Make a request on component mount to fetch user information.
  useEffect(() => {
    getMe(
      cookies.jwt,
      null,
      (data) => setData(data),
      (newErr) => setErrors((errors) => [newErr, ...errors])
    );
  }, [cookies.jwt]);

  // Catch errors before render.
  if (errors.length !== 0) {
    return (
      <Container>
        <Header removeCookies={() => setCookies("jwt", "")} />
        {errors.map((err, idx) => (
          <Alert key={idx} variant="warning">
            {String(err)}
          </Alert>
        ))}
      </Container>
    );
  }

  // If we're loading...
  if (!data) {
    return (
      <Container>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        <Header
          removeCookies={() => setCookies("jwt", "")}
          username={data?.username}
        />
        <JoinClassModal
          show={showJoinClass}
          onHide={() => setShowJoinClass(false)}
          onSubmit={(inviteCode) => {
            joinClass(
              cookies.jwt,
              { inviteCode },
              () => setShowJoinClass(false),
              (e) => setErrors((errors) => [e, ...errors])
            );
          }}
        />
        <CreateClassModal
          show={showCreateClass}
          onHide={() => setShowCreateClass(false)}
          onSubmit={(name) => {
            createClass(
              cookies.jwt,
              { name },
              () => setShowCreateClass(false),
              (e) => setErrors((errors) => [e, ...errors])
            );
          }}
        />

        <h2>Classes</h2>
        <Stack direction="horizontal" gap={3}>
          {data?.classes?.map((k, idx) => (
            <ClassCard
              key={idx}
              id={String(k.id)}
              name={k.name}
              showCreate={data?.professor}
            />
          ))}

          {data?.professor ? (
            <Card onClick={() => setShowCreateClass(true)}>
              <Card.Body>
                <Card.Title>Create a class</Card.Title>
              </Card.Body>
            </Card>
          ) : (
            <Card onClick={() => setShowJoinClass(true)}>
              <Card.Body>
                <Card.Title>Join a class</Card.Title>
              </Card.Body>
            </Card>
          )}
        </Stack>

        <h2>Upcoming Assignments</h2>
        <Stack direction="vertical" gap={3}>
          {data?.assignments?.map((k, idx) => {
            const associatedClass = data?.classes?.find(
              (c) => c.id === k.class
            );
            return (
              <AssignmentCard
                key={idx}
                id={k.id}
                classId={associatedClass?.id}
                className={associatedClass?.name}
                name={k.name}
                dueDate={k.dueDate}
              />
            );
          })}
        </Stack>
      </Stack>
    </Container>
  );
}

function ClassCard({
  id,
  name,
  showCreate,
  showFilter,
}: {
  id: string;
  name?: string;
  showCreate?: boolean;
  showFilter?: boolean;
}) {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [errors, setErrors] = useState<Array<Error>>([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);

  return (
    <>
      <CreateInviteModal
        classId={id}
        show={showCreateInvite}
        onHide={() => setShowCreateInvite(false)}
      />
      <CreateAssignmentModal
        show={showCreateAssignment}
        onHide={() => setShowCreateAssignment(false)}
        onSubmit={(data) => {
          fetch(`http://localhost:8080/class/${id}/assignment`, {
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
            })
            .catch((err) => setErrors((errs) => [err, ...errs]));
        }}
      />
      <Card>
        <Card.Header>
          <Card.Title>{name}</Card.Title>
        </Card.Header>
        <Card.Body>
          <Stack gap={3}>
            {showFilter && <Button variant="primary">Filter</Button>}
            {showCreate && (
              <>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateAssignment(true)}
                >
                  Add assignment
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowCreateInvite(true)}
                >
                  Create invite
                </Button>
              </>
            )}
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}
