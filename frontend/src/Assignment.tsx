import React, { useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import { ListGroup, ListGroupItem, Table } from "react-bootstrap";
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
import Header from "./Display/Header";

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
      <Header
        removeCookies={() => {
          setCookies("jwt", "");
          navigate("/");
        }}
      />

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

        <Table>
          <thead>
            <tr>
              {data?.professor && <th>UID</th>}
              <th>Submitted On</th>
              <th>Score Received</th>
            </tr>
          </thead>
          <tbody>
            {!data?.professor && (
              <tr onClick={() => setShowUploadSubmissionModal(true)}>
                <td>➕ Add a submission</td>
                <td></td>
              </tr>
            )}
            {data?.submissions?.map((k, idx) => (
              <tr key={idx} onClick={() => navigate(`/results/${k.id}`)}>
                {data?.professor && <td>{k.owner}</td>}
                <td>{k.date}</td>
                <td>{k.pointsEarned}</td>
              </tr>
            ))}
          </tbody>
        </Table>
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
