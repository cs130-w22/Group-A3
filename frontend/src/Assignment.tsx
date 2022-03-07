import React, { useEffect, useState } from "react";

import Container from "react-bootstrap/Container";
import Stack from "react-bootstrap/Stack";
import Table from "react-bootstrap/Table";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";
import { useNavigate, useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import "react-circular-progressbar/dist/styles.css";
import { AssignmentData, getAssignment } from "./api";
import UploadSubmissionModal from "./Modal/UploadSubmissionModal";
import Header from "./Display/Header";
import { Button } from "react-bootstrap";

export default function Assignment() {
  const [cookies, setCookies] = useCookies(["jwt"]);
  const [blob, setBlob] = useState<string | null>(null);
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

  useEffect(() => {
    const dataBlob = new Blob([JSON.stringify(data?.submissions)], {
      type: "application/json",
    });
    setBlob(URL.createObjectURL(dataBlob));
    return () => {
      blob && URL.revokeObjectURL(blob);
    };
  }, [blob, data]);

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

        <Table>
          <thead>
            <tr>
              {data?.professor && <th>UID</th>}
              <th>Submitted On</th>
              <th>Score Received</th>
            </tr>
          </thead>
          <tbody>
            {!data?.professor ? (
              <tr onClick={() => setShowUploadSubmissionModal(true)}>
                <td>➕ Add a submission</td>
                <td></td>
                <td></td>
              </tr>
            ) : (
              <tr onClick={() => console.log("download")}>
                <td>
                  <a
                    href={blob ? blob : ""}
                    download={`${data.name}-${new Date()}.json`}
                  >
                    <Button>Export to JSON</Button>
                  </a>
                </td>
                <td></td>
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
