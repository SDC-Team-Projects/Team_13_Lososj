import { describe, test, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  MemoryRouter,
  Routes,
  Route,
} from "react-router-dom";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import MyCollectionsPage from "../../pages/MyCollectionsPage";

// ---------- API ----------

vi.mock("../../api/collections", () => ({
  getCollections: vi.fn(() => Promise.resolve([])),
  getFavoriteCollections: vi.fn(() => Promise.resolve([])),
  addFavoriteCollection: vi.fn(),
  removeFavoriteCollection: vi.fn(),
  deleteCollection: vi.fn(),
}));

// ---------- usePageLoader ----------

vi.mock("../../hook/usePageLoader", () => ({
  usePageLoader: () => {},
}));

describe("open collection form", () => {
  test("user can open add collection form", async () => {
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
          <MemoryRouter initialEntries={["/"]}>
            <Routes>
              <Route
                path="/"
                element={<MyCollectionsPage />}
              />

              <Route
                path="/collectionForm"
                element={<h1>Collection Form</h1>}
              />
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>
      </QueryClientProvider>
    );

    const button = await screen.findByRole("button", {
      name: /\+ create new collection/i,
    });

    await userEvent.click(button);

    expect(
      await screen.findByText("Collection Form")
    ).toBeInTheDocument();
  });
});