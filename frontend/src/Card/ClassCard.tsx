import React, { useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";

import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

import { createAssignment } from "../api";
import CreateAssignmentModal from "../Modal/CreateAssignmentModal";
import CreateInviteModal from "../Modal/CreateInviteModal";

import { dropStudent } from "../api";

export default function ClassCard({
  id,
  name,
  showCreate,
  showFilter,
  onCreation,
}: {
  id: string;
  name?: string;
  showCreate?: boolean;
  showFilter?: boolean;
  onCreation?: () => void;
}) {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [errors, setErrors] = useState<Array<Error>>([]);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [showCreateInvite, setShowCreateInvite] = useState(false);
  const nav = useNavigate();
  const navToClassList = () => {
    nav(`/${id}/classlist`);
  };
  const dropHandler = (classId: string) => {
    dropStudent(
      cookies.jwt,
      { classId, id: "" },
      () => true,
      () => true
    );
  };

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
          createAssignment(
            cookies?.jwt,
            { classId: id, data },
            () => {
              setShowCreateAssignment(false);
              onCreation && onCreation();
            },
            (err) => setErrors((errs) => [err, ...errs])
          );
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
                <Button variant="primary" onClick={() => navToClassList()}>
                  View Class Stats
                </Button>
              </>
            )}
            {!showCreate && (
              <>
                <Button variant="primary" onClick={() => dropHandler(id)}>
                  Drop This Class
                </Button>
              </>
            )}
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}
