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
import { useCookies } from "react-cookie";

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
const default_hints = [hint1, hint2];

interface Submission {
  id: string;
  date: string;
  pointsEarned: number;
}
function calculateTotalScore(submissions: Submission[]) {
  const totalScores: number[] = [];

  submissions.forEach((j) => totalScores.push(j["pointsEarned"]));
  return totalScores;
}

function median(numbers: number[]) {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

//Student view of the assignment
const StudentAssignmentView = () => {
  const [userGrade, setUserGrade] = useState(23);
  const [classMean, setClassMean] = useState(75);
  const [classMedian, setClassMedian] = useState(92);
  const [hints, setHints] = useState(default_hints);
  const params = useParams();
  const [cookies, setCookies] = useCookies(["jwt"]);

  fetch(
    "http://localhost:8080/class/1/1", //"http://localhost:8080/class/${params.classId}/${params.assignmentId}",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: cookies.jwt,
      },
    }
  )
    .then((resp) => {
      if (resp.status === 200) return resp.json();
    })
    .then((resp) => {
      const total = calculateTotalScore(resp.submissions);
      // Mean and Median should be changed to work with assignment submissions for all class members
      setClassMean(total.reduce((a, b) => a + b, 0) / total.length);
      setClassMedian(median(total));
      setUserGrade(total[total.length - 1]);
    });

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
};

export default StudentAssignmentView;
