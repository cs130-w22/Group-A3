import React from 'react';
import { render, screen } from '@testing-library/react';
import CreateClassModal from './CreateClassModal';

test("Fires onSubmit on button click", () => {
  let mockCalled = false;
  render(<CreateClassModal show={true} loading={false} onHide={() => null} onSubmit={() => (mockCalled = true)} />);
  
  const button = screen.getByText("Submit");
  expect(button).toBeInTheDocument();
  button.click();
  expect(mockCalled).toBe(true);
});
