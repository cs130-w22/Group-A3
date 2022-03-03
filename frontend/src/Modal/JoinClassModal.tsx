import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";

interface JoinClassModalProps {
  show?: boolean;
  loading?: boolean;
  onHide: () => void;
  onSubmit: (inviteCode: string, callback: () => void) => void;
}

const JoinClassModal = ({
  show,
  loading,
  onHide,
  onSubmit,
}: JoinClassModalProps) => {
  const [complete, setComplete] = useState(false);

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Join a class</Modal.Title>
      </Modal.Header>
      <Form
        onSubmit={(e) => {
          e.preventDefault();
          const target = e.currentTarget as typeof e.currentTarget & {
            inviteCode: { value: string };
          };
          onSubmit(target.inviteCode.value, () => setComplete(true));
        }}
      >
        <Modal.Body>
          <Form.Group controlId="formInviteCode">
            <Form.Control type="text" name="inviteCode" />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button type="submit" variant={complete ? "success" : "primary"}>
            {loading && (
              <Spinner
                as="span"
                size="sm"
                role="status"
                aria-hidden="true"
                animation="border"
              />
            )}
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default JoinClassModal;
