import React from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import ProgressBar from "react-bootstrap/ProgressBar";
import {
  buildStyles,
  CircularProgressbar,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";

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
const hints = [hint1, hint2]; // take from database

const userGrade = 80; // check dynamically
const classMedian = 75;
const classMean = 60;

//Student view of the assignment
function StudentAssignmentCard() {
  return (
    <Container>
      <Stack
        direction="horizontal"
        gap={3}
        style={{ justifyContent: "center" }}
      >
        <div className="row" style={{ width: 300, height: 300 }}>
          <CircularProgressbarWithChildren
            value={userGrade}
            styles={buildStyles({ pathColor: "#1273de", strokeLinecap: 1 })}
          >
            {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
            <div style={{ fontSize: 20, marginTop: -5, color: "#808080" }}>
              <strong>Your Score:</strong>
            </div>
            <div style={{ fontSize: 40, marginTop: -5, color: "#1273de" }}>
              <strong>{userGrade}%</strong>
            </div>
          </CircularProgressbarWithChildren>
        </div>
        <br />
        <div className="row" style={{ width: 300, height: 300 }}>
          <CircularProgressbarWithChildren
            value={classMedian}
            styles={buildStyles({ pathColor: "#1273de", strokeLinecap: 1 })}
          >
            {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
            <div style={{ fontSize: 20, marginTop: -5, color: "#808080" }}>
              <strong>Class Median:</strong>
            </div>
            <div style={{ fontSize: 40, marginTop: -5, color: "#1273de" }}>
              <strong>{classMedian}%</strong>
            </div>
          </CircularProgressbarWithChildren>
        </div>
        <br />
        <div className="row" style={{ width: 300, height: 300 }}>
          <CircularProgressbarWithChildren
            value={classMean}
            styles={buildStyles({ pathColor: "#1273de", strokeLinecap: 1 })}
          >
            {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
            <div style={{ fontSize: 20, marginTop: -5, color: "#808080" }}>
              <strong>Class Mean:</strong>
            </div>
            <div style={{ fontSize: 40, marginTop: -5, color: "#1273de" }}>
              <strong>{classMean}%</strong>
            </div>
          </CircularProgressbarWithChildren>
        </div>
      </Stack>
      <br />
      <h2>Test Cases</h2>
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
}

export default StudentAssignmentCard;
