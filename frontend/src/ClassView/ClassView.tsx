import React from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useState } from "react";
import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router-dom";

import StudentAssignmentCard from "./StudentAssignmentCard";
import ProfessorAssignmentCard from "./ProfessorAssignmentCard";
import AddAssignmentModal from "../AssignmentView/AddAssignmentModal";

const Assignments = ["Assignment 1", "Assignment 2", "Assignment 3"]; // should be reading assignments from a database

// This view is a overview of a student's assignments for a class
function ClassView() {
  const nav = useNavigate();
  const mode: "student" | "faculty" = "student"; // should be taken from some app state / login info
  const [cookies, setCookies, removeCookies] = useCookies(["jwt"]);
  const [error, setError] = useState("");
  const [classID, setClassID] = useState("");
  const params = useParams();
  function handleRemoveCookies() {
    removeCookies("jwt");
    nav("/");
  }
  const navToClassStats = () => {
    fetchClassInfo(cookies.jwt);
    nav("/class/" + classID + "/classstats");
  };
  const navToClassList = () => {
    fetchClassInfo(cookies.jwt);
    nav("/class/" + classID + "/classlist");
  };

  function fetchClassInfo(token: any) {
    fetch("http://localhost:8080/class/me", {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: String(token),
      },
    })
      .then((response) => {
        if (response.status === 401) throw new Error("Unauthorized");
        return response.json();
      })
      .then((json) => {
        setClassID(json.id);
      })
      .catch((e) => {
        setError(
          `Failed to get class info! Server responded with: ${String(e).replace(
            "TypeError: ",
            ""
          )}`
        );
      });
  }

  return (
    <Container>
      <Stack direction="vertical" gap={3}>
        {mode === "student" ? null : (
          <div>
            <h1>My Students for {params.classID}</h1>
            <Stack direction="horizontal" gap={3}>
              <Button onClick={navToClassStats}>See Class Stats</Button>
              <Button onClick={navToClassList}>View Student List</Button>
            </Stack>
          </div>
        )}
        <Stack direction="horizontal" gap={3}>
          <h1>My Assignments</h1>
          <div className="ms-auto">
            <Button
              onClick={handleRemoveCookies}
              variant="secondary"
              size="lg"
              type="button"
              style={{ borderRadius: 100, alignContent: "left" }}
            >
              Log Out
            </Button>
          </div>
        </Stack>
        {Assignments.map((x) =>
          mode === "student" ? (
            <StudentAssignmentCard name={x} />
          ) : (
            <ProfessorAssignmentCard name={x} />
          )
        )}
        {mode === "student" ? null : <AddAssignmentModal />}
      </Stack>
    </Container>
  );
}

export default ClassView;
