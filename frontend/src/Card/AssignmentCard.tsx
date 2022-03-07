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
  className,
  name,
  dueDate,
  pointsPossible,
}: {
  id?: number;
  classId?: number;
  className?: string;
  name?: string;
  dueDate?: string;
  pointsPossible?: number;
}) {
  console.log(dueDate);
  return (
    <Link
      to={`/${classId}/${id}`}
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card>
        <Card.Header>
          <Card.Title>
            {className} - {name}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Card.Text>
            Due:{" "}
            {dueDate &&
              new Date(Date.parse(dueDate)).toLocaleString("en-US", {
                year: "numeric",
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
          </Card.Text>
          <Card.Text>Points possible: {pointsPossible}</Card.Text>
        </Card.Body>
      </Card>
    </Link>
  );
}
