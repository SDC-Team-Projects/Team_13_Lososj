import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import MyCollectionsPage from "../../pages/MyCollectionsPage";
import { AuthContext } from "../../context/AuthContext";

// ---------- API ----------

vi.mock("../../api/collections", () => ({
  getCollections: vi.fn(() => Promise.resolve([])),
  getFavoriteCollections: vi.fn(() => Promise.resolve([])),
  addFavoriteCollection: vi.fn(),
  removeFavoriteCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

// ---------- page loader ----------

vi.mock("../../hook/usePageLoader", () => ({
  usePageLoader: () => {},
}));

describe("MyCollectionsPage empty state", () => {
  test("user sees empty state when no collections exist", async () => {
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
            user: {
              id: 1,
              username: "test",
              role: "USER",
            },
            token: "token",
            loading: false,
            login: vi.fn(),
            logout: vi.fn(),
            setUser: vi.fn(),
            isAuthenticated: true,
            isAdmin: false,
          }}
        >
          <MemoryRouter>
            <MyCollectionsPage />
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    expect(
      await screen.findByText(/no collections yet/i)
    ).toBeInTheDocument();
  });
});