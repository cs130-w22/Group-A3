import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import StudentClassView from "./ClassView/StudentClassView";
import AssignmentView from "./AssignmentView/AssignmentView";
import ProfessorClassView from "./ClassView/ProfessorClassView";
import AddAssignmentView from "./AssignmentView/AddAssignmentView";
const App = () => (
  <Router>
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
      </Route>
      <Route path="/student/class">
        <Route index element={<StudentClassView />} />
      </Route>
      <Route path="/student/class/assignment">
        <Route index element={<AssignmentView />} />
      </Route> 
      <Route path="/professor/class">
        <Route index element={<ProfessorClassView />} />
      </Route>
      <Route path="/professor/class/addassignment">
        <Route index element={<AddAssignmentView />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
