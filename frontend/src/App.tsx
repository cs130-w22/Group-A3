import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";
import CreateAccount from "./CreateAccount";

const App = () => (
  <Router>
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
      </Route>
      <Route path="/create">
        <Route index element={<CreateAccount />} />
      </Route>
    </Routes>
  </Router>
);

export default App;