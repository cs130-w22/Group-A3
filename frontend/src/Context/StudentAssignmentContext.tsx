import React from "react";

const StudentAssignmentContext = React.createContext({
  assignment: {
    mode: "student",
    assignment: {
      id: "",
    },
  },
});

export { StudentAssignmentContext };
