import React from "react";

import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Card from "react-bootstrap/Card";
import ProgressBar from "react-bootstrap/ProgressBar";

import { Link } from "react-router-dom";
import {
  buildStyles,
  CircularProgressbarWithChildren,
} from "react-circular-progressbar";

// A card representing a single assignment overview
function StudentAssignmentCard(props: { name: string }) {
  const grade = 50; // should be server calls sometime

  const duedate = "3/22/2022"; // should be server calls sometime
  return (
    <Link
      to="/class/assignment"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Card style={{ borderRadius: 100, backgroundColor: "#f5f5f5" }}>
        <Card.Body>
          <Card.Title
            style={{ marginLeft: "4%", fontSize: 35, fontWeight: "bold" }}
          >
            {props.name}
          </Card.Title>
          <Card.Subtitle
            style={{ marginLeft: "4%", fontSize: 18, fontWeight: "bolder" }}
            className="mb-2 text-muted"
          >
            {`Due: ${duedate}`}
          </Card.Subtitle>
          <Container>
            <Row>
              <Col xs={11}>
                <div
                  className="row"
                  style={{
                    width: 120,
                    height: 120,
                    marginLeft: "95%",
                    marginTop: "-7%",
                    marginBottom: "-2%",
                  }}
                >
                  <CircularProgressbarWithChildren
                    value={grade}
                    styles={buildStyles({
                      pathColor: "#1273de",
                      strokeLinecap: 1,
                    })}
                  >
                    <div
                      style={{ fontSize: 25, marginTop: -20, color: "#1273de" }}
                    >
                      <strong>{grade}%</strong>
                    </div>
                  </CircularProgressbarWithChildren>
                </div>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    </Link>
  );
}

export default StudentAssignmentCard;
