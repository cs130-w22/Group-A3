import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useCookies } from "react-cookie";

import Login from "./Login";
import CreateAccount from "./AccountCreation/CreateAccount";
import ClassView from "./ClassView/ClassView";
import AssignmentView from "./AssignmentView/AssignmentView";
import Me from "./Me";
import Assignment from "./Assignment";

function App() {
  const [cookies, setCookies] = useCookies(["jwt"]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={cookies.jwt ? <Me /> : <Login />} />
        <Route path="/create" element={<CreateAccount />} />
        <Route path="/assignment/:assignmentId" element={<Assignment />} />

        <Route path="/class" element={<ClassView />} />
        <Route path="/class/assignment" element={<AssignmentView />} />
      </Routes>
    </Router>
  );
}

export default App;
