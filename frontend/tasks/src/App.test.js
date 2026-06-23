import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import App from "./App";

jest.mock("axios", () => {
  const mockCreate = () => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(() => Promise.resolve({ data: {} })),
    post: jest.fn(() => Promise.reject(new Error("No session"))),
    put: jest.fn(() => Promise.resolve({ data: {} })),
    delete: jest.fn(() => Promise.resolve({ data: {} })),
  });

  return {
    create: jest.fn(mockCreate),
    post: jest.fn(() => Promise.reject(new Error("No session"))),
  };
});

test("renders login screen when no session is available", async () => {
  render(<App />);

  await waitFor(() => {
    expect(screen.getByText(/taskser/i)).toBeInTheDocument();
  });
});
