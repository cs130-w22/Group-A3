import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button"
import Table from "react-bootstrap/Table";

const Students = [{name: "Edward", grade:90}, 
{name: "Jonathan", grade:80},
{name: "Cindy", grade:50}];

//Student view of the assignment 
const ClassListView = () => {
  return (
    <Container>
      <h1>My Students</h1>
      <Table striped bordered hover>
        <thead>
            <tr>
            <th>Name</th>
            <th>Grade</th>
            <th></th>
            </tr>
        </thead>
        <tbody>
            {Students.map(x =>
                <tr>
                <td>{x.name}</td>
                <td>{x.grade}</td>
                <td><Button>Drop Student</Button></td>
                </tr>
            )}   
        </tbody>
    </Table>
    </Container>
  );
};

export default ClassListView;
