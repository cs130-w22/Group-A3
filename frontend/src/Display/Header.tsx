import React from "react";
import Stack from "react-bootstrap/Stack";
import Button from "react-bootstrap/Button";

export default function Header({
  removeCookies,
  username,
}: {
  removeCookies: () => void;
  username?: string;
}) {
  return (
    <Stack direction="horizontal">
      {username && <h2>Welcome, {username}</h2>}
      <div className="ms-auto">
        <Button
          onClick={removeCookies}
          variant="primary"
          size="lg"
          type="button"
        >
          Log Out
        </Button>
      </div>
    </Stack>
  );
}
