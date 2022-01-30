import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button"

import StudentAssignmentCard from "./StudentAssignmentCard";
import ProfessorAssignmentCard from "./ProfessorAssignmentCard";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; //should be reading assignments from a database 

//This view is a overview of a student's assignments for a class  
const ClassView = () => {
  const nav = useNavigate();
  const mode : "student" | "faculty" = "student";  //should be taken from some app state / login info 
  const handleClick = () => {
    nav('/class/assignment/add');
  };
  return (
    <Container>
      <h1>Assignments</h1>
      <Stack direction="vertical" gap={3}>
          {
            Assignments.map(x => 
              (mode === "student")?
              <StudentAssignmentCard name={x}/> 
              :<ProfessorAssignmentCard name={x}/>
            )
        }
        {(mode === "student")?
        null:
        <Button onClick={handleClick}>Add new assignment</Button>}
      </Stack>
    </Container>
  );
};

export default ClassView;
