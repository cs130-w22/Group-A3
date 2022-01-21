import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./Login";

const App = () => (
  <Router>
    <Routes>
      <Route path="/">
        <Route index element={<Login />} />
      </Route>
    </Routes>
  </Router>
);

export default App;
