import React, { useEffect, useState } from "react";
import { useCookies } from "react-cookie";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

import { Link } from "react-router-dom";

export default function AssignmentCard({
  id,
  classId,
  name,
  dueDate,
  grade,
}: {
  id?: number;
  classId?: string;
  name?: string;
  dueDate?: Date;
  grade?: number;
}) {
  return (
    <Link
      to={`/assignment/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card>
        <Card.Body>
          <Card.Title>
            {classId} - {name}
          </Card.Title>
          <Card.Subtitle className="mb-2 text-muted">
            Due: {dueDate}
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
