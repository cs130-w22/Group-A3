import React, { useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { ListGroup, ListGroupItem } from "react-bootstrap";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import "react-circular-progressbar/dist/styles.css";
import { AssignmentData, getAssignment } from "./api";
import UploadSubmissionModal from "./Modal/UploadSubmissionModal";
import Score from "./Display/Score";

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

export default function Assignment() {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const params = useParams();
  const navigate = useNavigate();

  const [showUploadSubmissionModal, setShowUploadSubmissionModal] =
    useState(false);
  const [data, setData] = useState<AssignmentData | null>(null);

  useEffect(() => {
    getAssignment(
      cookies.jwt,
      {
        classId: String(params?.classId),
        assignmentId: String(params?.assignmentId),
      },
      (data) => setData(data),
      (err) => console.error(err)
    );
  }, [cookies, params]);

  return (
    <Container>
      <UploadSubmissionModal
        classId={String(params?.classId)}
        assignmentId={String(params?.assignmentId)}
        show={showUploadSubmissionModal}
        handleClose={() => setShowUploadSubmissionModal(false)}
      />

      <Stack direction="vertical" gap={3}>
        <h1>{data?.name}</h1>
        <h2>Metrics</h2>
        <Stack direction="horizontal" gap={3}>
          <Score metricName="Median" metricValue={300} percentFull={80} />
        </Stack>
        <h2>Submissions</h2>
        <ListGroup>
          <ListGroupItem onClick={() => setShowUploadSubmissionModal(true)}>
            ➕ Add a submission
          </ListGroupItem>
          {data?.submissions?.map((k, idx) => (
            <ListGroupItem
              key={idx}
              onClick={() => navigate(`/results/${k.id}`)}
            >
              {k.date} - {k.pointsEarned}
            </ListGroupItem>
          ))}
        </ListGroup>
      </Stack>
    </Container>
  );
}

function ScoreWheel({
  metricName,
  metricValue,
  percentFull,
}: {
  metricName: string;
  metricValue: number;
  percentFull: number;
}) {
  return (
    <CircularProgressbarWithChildren
      value={percentFull}
      styles={buildStyles({ pathColor: "#1273de", strokeLinecap: 1 })}
    >
      {/* Put any JSX content in here that you'd like. It'll be vertically and horizonally centered. */}
      <div style={{ fontSize: 20, marginTop: -5, color: "#808080" }}>
        <strong>{metricName}:</strong>
      </div>
      <div style={{ fontSize: 40, marginTop: -5, color: "#1273de" }}>
        <strong>{percentFull}%</strong>
      </div>
    </CircularProgressbarWithChildren>
  );
}
