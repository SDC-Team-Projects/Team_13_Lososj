import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  AuthProvider,
  useAuth,
} from "../../context/AuthContext";

import { apiFetch } from "../../api/apiClient";

vi.mock("../../api/apiClient", () => ({
  apiFetch: vi.fn(),
}));

function TestConsumer() {
  const {
    token,
    user,
    setUser,
    login,
    logout,
    isAuthenticated,
    loading,
    isAdmin,
  } = useAuth();

  return (
    <div>
      <div data-testid="loading">
        {loading ? "loading" : "loaded"}
      </div>

      <div data-testid="token">
        {token || "no-token"}
      </div>

      <div data-testid="username">
        {user?.username || "no-user"}
      </div>

      <div data-testid="authenticated">
        {isAuthenticated ? "yes" : "no"}
      </div>

      <div data-testid="admin">
        {isAdmin ? "yes" : "no"}
      </div>

      <button
        type="button"
        onClick={() =>
          login("new-token", {
            id: 1,
            username: "John Smith",
            role: "USER",
          })
        }
      >
        Login
      </button>

      <button
        type="button"
        onClick={() =>
          login("admin-token", {
            id: 2,
            username: "Admin User",
            role: "ADMIN",
          })
        }
      >
        Login admin
      </button>

      <button
        type="button"
        onClick={() =>
          setUser({
            id: 3,
            username: "Updated User",
            role: "ADMIN",
          })
        }
      >
        Set user
      </button>

      <button
        type="button"
        onClick={logout}
      >
        Logout
      </button>
    </div>
  );
}

function setup() {
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );

  return {
    user: userEvent.setup(),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

describe("AuthContext", () => {
  test("starts unauthenticated when there is no saved token", async () => {
    setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("username")).toHaveTextContent("no-user");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    expect(screen.getByTestId("admin")).toHaveTextContent("no");

    expect(apiFetch).not.toHaveBeenCalled();
  });

  test("loads user profile when token exists in localStorage", async () => {
    localStorage.setItem("token", "saved-token");

    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          username: "Saved User",
          role: "USER",
        }),
    });

    setup();

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "https://team-13-lososj.onrender.com/api/profile"
    );

    expect(screen.getByTestId("token")).toHaveTextContent("saved-token");
    expect(screen.getByTestId("username")).toHaveTextContent("Saved User");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    expect(screen.getByTestId("admin")).toHaveTextContent("no");
  });

  test("sets isAdmin when loaded user is admin", async () => {
    localStorage.setItem("token", "admin-token");

    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          username: "Admin User",
          role: "ADMIN",
        }),
    });

    setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(screen.getByTestId("username")).toHaveTextContent("Admin User");
    expect(screen.getByTestId("admin")).toHaveTextContent("yes");
  });

  test("clears token when profile request returns error response", async () => {
    localStorage.setItem("token", "bad-token");

    apiFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({}),
    });

    setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("username")).toHaveTextContent("no-user");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
  });

  test("clears token when profile request throws", async () => {
    localStorage.setItem("token", "broken-token");

    apiFetch.mockRejectedValueOnce(
      new Error("Auth failed")
    );

    setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("username")).toHaveTextContent("no-user");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
  });

  test("login saves token and user", async () => {
    const { user } = setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    await user.click(
      screen.getByRole("button", {
        name: /^login$/i,
      })
    );

    expect(localStorage.getItem("token")).toBe("new-token");
    expect(screen.getByTestId("token")).toHaveTextContent("new-token");
    expect(screen.getByTestId("username")).toHaveTextContent("John Smith");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    expect(screen.getByTestId("admin")).toHaveTextContent("no");
  });

  test("login sets admin state for admin user", async () => {
    const { user } = setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    await user.click(
      screen.getByRole("button", {
        name: /login admin/i,
      })
    );

    expect(localStorage.getItem("token")).toBe("admin-token");
    expect(screen.getByTestId("username")).toHaveTextContent("Admin User");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("yes");
    expect(screen.getByTestId("admin")).toHaveTextContent("yes");
  });

  test("logout removes token and user", async () => {
    const { user } = setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    await user.click(
      screen.getByRole("button", {
        name: /^login$/i,
      })
    );

    expect(localStorage.getItem("token")).toBe("new-token");

    await user.click(
      screen.getByRole("button", {
        name: /logout/i,
      })
    );

    expect(localStorage.getItem("token")).toBeNull();
    expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    expect(screen.getByTestId("username")).toHaveTextContent("no-user");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("no");
    expect(screen.getByTestId("admin")).toHaveTextContent("no");
  });

  test("setUser updates user data", async () => {
    const { user } = setup();

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("loaded");
    });

    await user.click(
      screen.getByRole("button", {
        name: /set user/i,
      })
    );

    expect(screen.getByTestId("username")).toHaveTextContent("Updated User");
    expect(screen.getByTestId("admin")).toHaveTextContent("yes");
  });
});