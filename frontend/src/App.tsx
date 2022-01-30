import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import ClassView from "./ClassView/ClassView";
import AssignmentView from "./AssignmentView/AssignmentView";
import ClassStatsView from "./ClassStatsView/ClassStatsView";
import ClassListView from "./ClassListView/ClassListView";

const App = () => (
  <Router>
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
      </Route>
      <Route path="/class">
        <Route index element={< ClassView/>} />
      </Route>
      <Route path="/class/assignment">
        <Route index element={<AssignmentView />} />
      </Route>
      <Route path="/class/classstats">
        <Route index element={<ClassStatsView />} />
      </Route>
      <Route path="/class/classlist">
        <Route index element={<ClassListView />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
