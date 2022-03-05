import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Alert, Spinner } from "react-bootstrap";
import { createInvite } from "../api";
import { useCookies } from "react-cookie";

interface CreateInviteModalProps {
  classId: string;
  show?: boolean;
  loading?: boolean;
  onHide: () => void;
}

const CreateInviteModal = ({
  classId,
  show,
  loading,
  onHide,
}: CreateInviteModalProps) => {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Create a class</Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.currentTarget as typeof e.currentTarget & {
            validUntil: { value: string };
          };
          const validUntil = new Date(target.validUntil.value);
          createInvite(
            cookies.jwt,
            { classId, validUntil },
            ({ inviteCode }) => setInviteCode(inviteCode),
            (err) => setError(err)
          );
        }}
      >
        <Modal.Body>
          <Form.Group>
            <Form.Label>Valid Until</Form.Label>
            <Form.Control type="date" name="validUntil" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit">
            <Spinner
              as="span"
              size="sm"
              role="status"
              aria-hidden="true"
              animation="border"
            />
            Submit
          </Button>
          {inviteCode && (
            <Alert variant="success">
              Your new invite code is: <b>{inviteCode}</b>
            </Alert>
          )}
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CreateInviteModal;
