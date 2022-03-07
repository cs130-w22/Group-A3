import React, { useState } from "react";
import { useCookies } from "react-cookie";

import Card from "react-bootstrap/Card";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

import { createAssignment } from "../api";
import CreateAssignmentModal from "../Modal/CreateAssignmentModal";
import CreateInviteModal from "../Modal/CreateInviteModal";

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
              </>
            )}
          </Stack>
        </Card.Body>
      </Card>
    </>
  );
}
