import React, { useEffect, useState } from "react";
import { Col, Container, Row, Stack } from "react-bootstrap";
import { useParams } from "react-router-dom";
import useWebSocket, { ReadyState } from "react-use-websocket";

interface Result {
  id: number;
  hidden: boolean;
  name: string | null;
  message: string | null;
  score: number;
}

interface ResultsProps {
  connectTo: string;
}

export default function Results(props: ResultsProps) {
  const [results, setResults] = useState<Array<Result>>([]);
  const params = useParams();

  const { sendMessage, lastMessage, readyState } = useWebSocket(
    `wss://localhost:8080/results/${params?.id}`
  );
  const connectionStatus = {
    [ReadyState.CONNECTING]: "Connecting",
    [ReadyState.OPEN]: "Open",
    [ReadyState.CLOSING]: "Closing",
    [ReadyState.CLOSED]: "Closed",
    [ReadyState.UNINSTANTIATED]: "Uninstantiated",
  }[readyState];

  useEffect(() => {
    sendMessage(
      JSON.stringify({
        intent: "allResults",
      })
    );
  });

  useEffect(() => {
    if (lastMessage) setResults((results) => results.concat(lastMessage.data));
  }, [lastMessage, setResults]);

  return (
    <Container>
      <p>Connection status: {connectionStatus}</p>
      <Stack>
        {results.map(({ id, hidden, name, message, score }, idx) => (
          <Row key={idx}>
            <Col>{id}</Col>
            {hidden && (
              <>
                <Col>{name}</Col>
                <Col>{message}</Col>
              </>
            )}
            <Col>{score}</Col>
          </Row>
        ))}
      </Stack>
    </Container>
  );
}
