import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button"

import StudentAssignmentCard from "./StudentAssignmentCard";
import ProfessorAssignmentCard from "./ProfessorAssignmentCard";
import AddAssignmentView from "../AssignmentView/AddAssignmentView";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; //should be reading assignments from a database 

//This view is a overview of a student's assignments for a class  
const ClassView = () => {
  const nav = useNavigate();
  const mode : "student" | "faculty" = "student";  //should be taken from some app state / login info 

  const navToClassStats = () => {
    nav('/class/classstats');
  };
  const navToClassList = () => {
    nav('/class/classlist');
  };
  return (
    <Container>
    <Stack direction="vertical" gap={3}>
      {(mode === "student")?
        null:
        <div>          
          <h1>My Students</h1>
        <Stack direction="horizontal" gap={3}>
          <Button onClick={navToClassStats}>See Class Stats</Button>
          <Button onClick={navToClassList}>View Student List</Button>
        </Stack>
        </div>
      }
      <h1>My Assignments</h1>
          {
            Assignments.map(x => 
              (mode === "student")?
              <StudentAssignmentCard name={x}/> 
              :<ProfessorAssignmentCard name={x}/>
            )
        }
        {(mode === "student")?
        null:
       <AddAssignmentView/>}
      </Stack>
    </Container>
  );
};

export default ClassView;
