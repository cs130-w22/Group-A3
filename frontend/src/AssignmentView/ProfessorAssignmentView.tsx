import React from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import ProgressBar from "react-bootstrap/ProgressBar";

const numSubmissions = 60; // percentage of submitted assignments
const classMedian = 60; // change dynamically
const classMean = 60;

class hint {
  name: string;
  text: string;
  id: number;

  constructor(name: string, text: string, id: number) {
    this.name = name;
    this.text = text;
    this.id = id;
  }
}

const hint1 = new hint("hint title", "hint body", 1);
const hint2 = new hint("hint title 2", "hint body 2", 2);
const hints = [hint1, hint2]; // get all hints from database

const AssignmentView = () => {
  return (
    <Container>
      <h2>Current Grades: </h2>
      <div>
        <ProgressBar
          variant="success"
          now={numSubmissions}
          label={`Total Submissions: ${numSubmissions}%`}
        />
        <ProgressBar
          variant="info"
          now={classMedian}
          label={`Class Median: ${classMedian}%`}
        />
        <ProgressBar
          variant="warning"
          now={classMean}
          label={`Class Mean: ${classMean}%`}
        />
      </div>
      <br />
      <h2>Hints Given</h2>
      <CardGroup>
        {hints.map((hint) => (
          <Card key={hint.id}>
            <Card.Body>
              <Card.Title>{hint.name}</Card.Title>
              <Card.Text>{hint.text}</Card.Text>
            </Card.Body>
          </Card>
        ))}
      </CardGroup>
    </Container>
  );
};

export default AssignmentView;
