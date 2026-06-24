import { render, screen } from "@testing-library/react";
import { test, expect, vi } from "vitest";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MainPage from "../../pages/MainPage";
import { AuthContext } from "../../context/AuthContext";

// ✅ MOCK API CLIENT (IMPORTANT FIX)
vi.mock("../../api/apiClient", () => ({
  apiFetch: vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            collection_id: 1,
            collection_name: "Test Collection",
            collection_image: "",
            category: "test",
            viewed_at: "2024-01-01T10:00:00Z",
          },
        ]),
    })
  ),
}));

// mock analytics API
vi.mock("../../api/collections", () => ({
  getUserAnalytics: vi.fn(() =>
    Promise.resolve({
      items_count: 5,
      collections_count: 3,
      total_value: 1000,
    })
  ),
}));

test("home page displays user stats correctly", async () => {
  const mockUser = { id: 1, email: "test@mail.com" };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockUser,
          token: "fake-token",
          isAuthenticated: true,
        }}
      >
        <MemoryRouter>
          <MainPage />
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>
  );

  // static labels
  expect(await screen.findByText("Items")).toBeInTheDocument();
  expect(await screen.findByText("Collections")).toBeInTheDocument();
  expect(await screen.findByText("Total value")).toBeInTheDocument();

  // analytics values
  expect(await screen.findByText("5")).toBeInTheDocument();
  expect(await screen.findByText("3")).toBeInTheDocument();
  expect(await screen.findByText("1000")).toBeInTheDocument();

  // recent collections (optional but now safe)
  expect(await screen.findByText("Recently viewed collections")).toBeInTheDocument();
  expect(await screen.findByText("Test Collection")).toBeInTheDocument();
});