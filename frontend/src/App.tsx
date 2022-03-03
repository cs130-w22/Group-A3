import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useCookies } from "react-cookie";

import { userContext } from "./Context/UserContext";

import Login from "./Login";
import CreateAccount from "./AccountCreation/CreateAccount";
import ClassView from "./ClassView/ClassView";
import AssignmentView from "./AssignmentView/AssignmentView";
import ClassStatsView from "./ClassStatsView/ClassStatsView";
import ClassListView from "./ClassListView/ClassListView";
import Me from "./Me";

const defaultUser = {
  user: {
    mode: "student",
    class: {},
  },
};

function App() {
  const [cookies, setCookies] = useCookies(["jwt"]);
  return (
    <userContext.Provider value={defaultUser}>
      <Router>
        <Routes>
          <Route path="/" element={cookies.jwt ? <Me /> : <Login />} />

          <Route path="/create" element={<CreateAccount />} />
          <Route path="/class" element={<ClassView />} />
          <Route path="/class/assignment" element={<AssignmentView />} />
          <Route path="/class/classstats" element={<ClassStatsView />} />
          <Route path="/class/classlist" element={<ClassListView />} />
        </Routes>
      </Router>
    </userContext.Provider>
  );
}

export default App;
