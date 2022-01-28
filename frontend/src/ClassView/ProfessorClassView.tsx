import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button"
import Stack from "react-bootstrap/Stack";
import { useNavigate } from "react-router-dom";
import ProfessorAssignmentCard from "./ProfessorAssignmentCard";
const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; //should be reading assignments from a database 


const ProfessorClassView = () => {
  const nav = useNavigate();
  const handleClick = () => {
    nav('/professor/class/addassignment');
  };
  return (
    <Container>
      <h1>Current Assignments</h1>
      <Stack direction="vertical" gap={3}>
          {
            Assignments.map(x => <ProfessorAssignmentCard 
              name={x}
              />)
        }

      <Button onClick={handleClick}>Add new assignment</Button>
      </Stack>
    </Container>
  );
};

export default ProfessorClassView;
