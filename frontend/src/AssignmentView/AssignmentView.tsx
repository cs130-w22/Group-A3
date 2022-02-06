import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import { Form } from "react-bootstrap";
import Card from "react-bootstrap/Card";
import CardGroup from "react-bootstrap/CardGroup";
import ProgressBar from 'react-bootstrap/ProgressBar'

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"];

const userGrade = 60; // check dynamically
const classMedian = 60; 
const classMean = 60; 

//Student view of the assignment 
// add:
// button to submit
// file thing to add submission
// current grade 
const AssignmentView = () => {
  return (
    <Container>
      <h1>Assignment 1</h1>
      <Form.Group className="mb-3">
        <Form.Control type="file" />
      </Form.Group>
      <Button variant="primary" type="submit">
          Submit
      </Button>
      <br />
      <br />
      <h2>Current Grade: </h2>
      <div>
      <ProgressBar variant="success" now={userGrade} label={`Your Grade: ${userGrade}%`}/>
      <ProgressBar variant="info" now={classMedian} label={`Class Median: ${classMedian}%`} />
      <ProgressBar variant="warning" now={classMean} label={`Class Mean: ${classMean}%`}/>
    </div>
      <br />
      <h2>Test Cases</h2>
      <CardGroup>
  <Card>
    <Card.Body>
      <Card.Title>Test Case 1</Card.Title>
      <Card.Text>
        You got this test case wrong, consider checking...
      </Card.Text>
    </Card.Body>
  </Card>
  <Card>
    <Card.Body>
      <Card.Title>Test Case 2</Card.Title>
      <Card.Text>
        Hint: are you checking...?
      </Card.Text>
    </Card.Body>
  </Card>
  <Card>
    <Card.Body>
      <Card.Title>Test Case 3</Card.Title>
      <Card.Text>
        No hints given for this test case!
      </Card.Text>
    </Card.Body>
  </Card>
</CardGroup>
    </Container>

    

  );
};

export default AssignmentView;
