import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import Container from "react-bootstrap/Container";
import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Alert from "react-bootstrap/Alert";
import Spinner from "react-bootstrap/Spinner";
import Button from "react-bootstrap/Button";

import JoinClassModal from "./Modal/JoinClassModal";
import CreateClassModal from "./Modal/CreateClassModal";

import {
  createAssignment,
  createClass,
  getMe,
  joinClass,
  UserInformation,
} from "./api";
import AssignmentCard from "./Card/AssignmentCard";
import CreateAssignmentModal from "./Modal/CreateAssignmentModal";
import CreateInviteModal from "./Modal/CreateInviteModal";
import Header from "./Display/Header";
import ClassCard from "./Card/ClassCard";

export default function Me() {
  const [cookies, setCookies] = useCookies(["jwt"]);

  // Toggle to reload the `Me` data
  const [reloadMe, setReloadMe] = useState(false);

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
  }, [cookies.jwt, reloadMe]);

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
              onCreation={() => setReloadMe(!reloadMe)}
            />
          ))}

          <Card>
            <Card.Header>
              <Card.Title>...</Card.Title>
            </Card.Header>
            <Card.Body>
              <Button
                onClick={() =>
                  data?.professor
                    ? setShowCreateClass(true)
                    : setShowJoinClass(true)
                }
              >
                {data?.professor ? "Create a class" : "Join a class"}
              </Button>
            </Card.Body>
          </Card>
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
                pointsPossible={k.pointsPossible}
              />
            );
          })}
        </Stack>
      </Stack>
    </Container>
  );
}
