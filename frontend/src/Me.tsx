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

import { createClass, getMe, joinClass, UserInformation } from "./api";
import AssignmentCard from "./Card/AssignmentCard";

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
        <Header username={data?.username} removeCookies={removeCookies} />
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
        <Header username={data?.username} removeCookies={removeCookies} />

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
            <ClassCard key={idx} id={String(k.id)} name={k.name} />
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
          {data?.assignments?.map((k, idx) => (
            <AssignmentCard
              key={idx}
              classId={String(k.class)}
              name={k.name}
              dueDate={k.dueDate}
            />
          ))}
        </Stack>
      </Stack>
    </Container>
  );
}

function Header({
  removeCookies,
  username,
}: {
  removeCookies: () => void;
  username?: string;
}) {
  return (
    <Stack direction="horizontal">
      {username && <h2>Welcome, {username}</h2>}
      <div className="ms-auto">
        <Button
          onClick={removeCookies}
          variant="primary"
          size="lg"
          type="button"
        >
          Log Out
        </Button>
      </div>
    </Stack>
  );
}

function ClassCard({ id, name }: { id?: string; name?: string }) {
  return (
    <Link
      to={`/class/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card>
        <Card.Body>
          <Card.Title>{name}</Card.Title>
          <Card.Subtitle>Extra information</Card.Subtitle>
        </Card.Body>
      </Card>
    </Link>
  );
}
