import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import CreateAccount from "./CreateAccount";
import ClassView from "./ClassView/ClassView";
import AssignmentView from "./AssignmentView/AssignmentView";
import AddAssignmentView from "./AssignmentView/AddAssignmentView";

const App = () => (
  <Router>
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
      </Route>
      <Route path="/create">
        <Route index element={<CreateAccount />} />
      </Route>
      <Route path="/class">
        <Route index element={< ClassView/>} />
      </Route>
      <Route path="/class/assignment">
        <Route index element={<AssignmentView />} />
      </Route>
      <Route path="/class/assignment/add">
        <Route index element={<AddAssignmentView />} />
      </Route>
    </Routes>
  </Router>
);

export default App;