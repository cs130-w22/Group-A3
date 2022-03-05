import React, { useEffect, useState } from "react";
import { Alert, Col, Container, Row, Stack, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";
import Score from "./Display/Score";

interface Result {
  testId: number;
  hidden: boolean;
  testName: string | null;
  score: number;
  msg: string | null;
}

export default function Results() {
  const [results, setResults] = useState<Array<Result>>([]);
  const params = useParams();

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `ws://localhost:8080/live/${params?.id}`
  );
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Connected",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
    if (lastMessage) setResults([JSON.parse(lastMessage?.data)]);
  }, [lastMessage, setResults]);

  return (
    <Container>
      <Stack gap={3}>
        <h1>Submission Summary</h1>
        <Alert variant={readyState === ReadyState.OPEN ? "success" : "error"}>
          Connection status: {connectionStatus}
        </Alert>
        <h2>Metrics</h2>
        <Stack direction="horizontal" gap={3}>
          <Score metricName="Best Score" metricValue={50} percentFull={50} />
          <Score metricName="Worst Score" metricValue={50} percentFull={50} />
        </Stack>

        <h2>Public Test Cases</h2>
        <Table>
          <thead>
            <tr>
              <th>Test Case ID</th>
              <th>Test Case Name</th>
              <th>Hint</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {results?.map(({ testId, hidden, testName, msg, score }, idx) => (
              <tr key={idx}>
                <td>{testId}</td>
                <td>{!hidden ? testName : "Hidden"}</td>
                <td>{!hidden && msg}</td>
                <td>{String(score)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Container>
  );
}
