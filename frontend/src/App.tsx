import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import CreateAccount from "./AccountCreation/CreateAccount";
import ClassView from "./ClassView/ClassView";
import AssignmentView from "./AssignmentView/AssignmentView";
import ClassStatsView from "./ClassStatsView/ClassStatsView";
import ClassListView from "./ClassListView/ClassListView";

import { userContext } from "./Context/UserContext";
import { useCookies } from "react-cookie";

const defaultUser = {
  user: {
    mode: "student",
    class: {
      id: "",
    },
  },
};

function App() {
  const [cookies, setCookies] = useCookies(["jwt"]);

  return (
    <userContext.Provider value={defaultUser}>
      <Router>
        <Routes>
          <Route path="/">
            {!cookies.jwt ? (
              <Route index element={<Login />} />
            ) : (
              <Route index element={<ClassView />} />
            )}
          </Route>
          <Route path="/create">
            <Route index element={<CreateAccount />} />
          </Route>
          <Route path="/class/:classID">
            <Route index element={<ClassView />} />
          </Route>
          <Route path="/class/:classID/assignment/:assignmentID">
            <Route index element={<AssignmentView />} />
          </Route>
          <Route path="/class/:classID/classstats">
            <Route index element={<ClassStatsView />} />
          </Route>
          <Route path="/class/:classID/classlist">
            <Route index element={<ClassListView />} />
          </Route>
        </Routes>
      </Router>
    </userContext.Provider>
  );
}

export default App;
