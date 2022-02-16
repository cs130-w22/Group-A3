import React from "react";

const userContext = React.createContext({
  user: {
    token: "",
    auth: false,
  },
});

export { userContext };
