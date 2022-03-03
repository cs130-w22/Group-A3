import React from "react";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

import { Link } from "react-router-dom";

// A card representing a single assignment overview
function StudentAssignmentCard(props: {
  name: string;
  classID: string;
  assignmentID: string;
}) {
  const grade = 50; // should be server calls sometime

  const duedate = "3/22/2022"; // should be server calls sometime
  return (
    <Link
      to={`/class/${props.classID}/assignment/${props.assignmentID}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card /* style={{ width: '18rem' }} */>
        <Card.Body>
          <Card.Title>{props.name}</Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            {`Due: ${duedate}`}
          </Card.Subtitle>
          <Container>
            <Row>
              <Col>Grade: </Col>
              <Col xs={11}>
                <ProgressBar now={grade} label={`${grade}%`} />
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default StudentAssignmentCard;
