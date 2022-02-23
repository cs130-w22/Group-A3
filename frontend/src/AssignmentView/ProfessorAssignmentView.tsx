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
const default_hints = [hint1, hint2];

const ProfessorAssignmentView = () => {
  const [classMean, setClassMean] = useState(23); // currently dummy values before testing with endpoint
  const [classMedian, setClassMedian] = useState(93);
  const [hints, setHints] = useState(default_hints);
  const [submissionCount, setSubmissionCount] = useState(24);
  const params = useParams();
  const [cookies, setCookies] = useCookies(["jwt"]);
  const assignmentInformation = useRef({});

  useEffect(() => {
    fetch(
      "http://localhost:8080/class/${params.classId}/${params.assignmentId}",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "${cookies}",
        },
      }
    ).then((resp) => {
      if (resp.status == 201) {
        setClassMean(JSON.parse(resp.toString()).mean);
        setClassMedian(JSON.parse(resp.toString()).median);
        setSubmissionCount(Number(JSON.parse(resp.toString()).submissionCount));
        // will add function that takes in the hints and creates hint objects to be displayed
        assignmentInformation.current = JSON.parse(resp.toString());
      }
    });
    return () => {
      console.log("cleanup professor level assignment view");
    };
  });

  return (
    <Container>
      <h2>Assignment Statistics: </h2>
      <br />
      <Stack
        direction="horizontal"
        gap={3}
        style={{ justifyContent: "center" }}
      >
        <div className="row" style={{ width: 300, height: 300 }}>
          <CircularProgressbarWithChildren
            value={submissionCount}
            styles={buildStyles({ pathColor: "#1273de", strokeLinecap: 1 })}
          >
            {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
            <div style={{ fontSize: 20, marginTop: -5, color: "#808080" }}>
              <strong># of Submissions:</strong>
            </div>
            <div style={{ fontSize: 40, marginTop: -5, color: "#1273de" }}>
              <strong>{submissionCount}</strong>
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

export default ProfessorAssignmentView;
