import React, { useEffect, useState } from "react";

import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

export default function Score({
  metricName,
  metricValue,
  percentFull,
}: {
  metricName: string;
  metricValue: number;
  percentFull: number;
}) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>{metricName}</Card.Title>
      </Card.Header>
      <Card.Body>
        <ProgressBar now={percentFull} label={metricValue} />
      </Card.Body>
    </Card>
  );
}
