import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useCookies } from "react-cookie";

import Login from "./Login";
import CreateAccount from "./AccountCreation/CreateAccount";
import ClassView from "./ClassView/ClassView";
import Me from "./Me";
import Assignment from "./Assignment";
import Results from "./Results";

function App() {
  const [cookies, setCookies] = useCookies(["jwt"]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={cookies?.jwt ? <Me /> : <Login />} />
        <Route path="/create" element={<CreateAccount />} />
        <Route path="/results/:id" element={<Results />} />
        <Route path="/:classId/:assignmentId" element={<Assignment />} />

        <Route path="/class" element={<ClassView />} />
      </Routes>
    </Router>
  );
}

export default App;
