import React from "react";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import { Spinner } from "react-bootstrap";

interface CreateAssignmentModalProps {
  show?: boolean;
  loading?: boolean;
  onHide: () => void;
  onSubmit: (data: FormData) => void;
}

const CreateAssignmentModal = ({
  show,
  loading,
  onHide,
  onSubmit,
}: CreateAssignmentModalProps) => (
  <Modal show={show} onHide={onHide}>
    <Modal.Header closeButton>
      <Modal.Title>Create an assignment</Modal.Title>
    </Modal.Header>
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dueDate = new Date(String(formData.get("dueDate")));
        formData.set("dueDate", String(dueDate.getTime()));
        onSubmit(formData);
      }}
    >
      <Modal.Body>
        <Form.Group controlId="formName">
          <Form.Label>Assignment Name</Form.Label>
          <Form.Control type="text" name="name" required />
        </Form.Group>
        <Form.Group controlId="formDueDate">
          <Form.Label>Due Date</Form.Label>
          <Form.Control type="date" name="dueDate" required />
        </Form.Group>
        <Form.Group controlId="formGradingScript">
          <Form.Label>Grading Script</Form.Label>
          <Form.Control type="file" name="file" required />
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

export default CreateAssignmentModal;
