import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";

interface CreateClassModalProps {
  show?: boolean;
  loading?: boolean;
  onHide: () => void;
  onSubmit: (className: string) => void;
}

const CreateClassModal = ({
  show,
  loading,
  onHide,
  onSubmit,
}: CreateClassModalProps) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Create a class</Modal.Title>
    </Modal.Header>
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const target = e.currentTarget as typeof e.currentTarget & {
          name: { value: string };
        };
        onSubmit(target.name.value);
      }}
    >
      <Modal.Body>
        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control type="text" name="name" />
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
      </Modal.Footer>
    </Form>
  </Modal>
);

export default CreateClassModal;
