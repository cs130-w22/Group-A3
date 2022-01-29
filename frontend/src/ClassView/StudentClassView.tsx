import React, { useState } from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import StudentAssignmentCard from "./StudentAssignmentCard";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; //should be reading assignments from a database 

//This view is a overview of a student's assignments for a class  
const StudentClassView = () => {
  return (
    <Container>
      <h1>Assignments</h1>
      <Stack direction="vertical" gap={3}>
          {
            Assignments.map(x => <StudentAssignmentCard 
              name={x}
              />)
        }
      </Stack>
    </Container>
  );
};

export default StudentClassView;
