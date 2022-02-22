import React from "react";
import { useNavigate } from "react-router-dom";

import { StudentAssignmentContext } from "../Context/StudentAssignmentContext";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

import StudentAssignmentCard from "./StudentAssignmentCard";
import ProfessorAssignmentCard from "./ProfessorAssignmentCard";
import AddAssignmentModal from "../AssignmentView/AddAssignmentModal";
import { ProfessorAssignmentContext } from "../Context/ProfessorAssignmentContext";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; // should be reading assignments from a database

// This view is a overview of a student's assignments for a class
function ClassView() {
  const nav = useNavigate();
  const mode: "student" | "faculty" = "student"; // should be taken from some app state / login info

  const defaultAssignment = (id: string) => {
    return {
      assignment: {
        id: id,
      },
    };
  };

  const navToClassStats = () => {
    nav("/class/classstats");
  };
  const navToClassList = () => {
    nav("/class/classlist");
  };
  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {mode === "student" ? null : (
          <div>
            <h1>My Students</h1>
            <Stack direction="horizontal" gap={3}>
              <Button onClick={navToClassStats}>See Class Stats</Button>
              <Button onClick={navToClassList}>View Student List</Button>
            </Stack>
          </div>
        )}
        <h1>My Assignments</h1>
        {Assignments.map((x) =>
          mode === "student" ? (
            <StudentAssignmentContext.Provider value={defaultAssignment(x)}>
              <StudentAssignmentCard name={x} />
            </StudentAssignmentContext.Provider>
          ) : (
            <ProfessorAssignmentContext.Provider value={defaultAssignment(x)}>
              <ProfessorAssignmentCard name={x} />
            </ProfessorAssignmentContext.Provider>
          )
        )}
        {mode === "student" ? null : <AddAssignmentModal />}
      </Stack>
    </Container>
  );
}

export default ClassView;
