import React from "react";

const userContext = React.createContext({
  user: {
    mode: "student",
    class: {
      id: "",
    },
  },
});

export { userContext };
