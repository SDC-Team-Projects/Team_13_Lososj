import { render, screen, waitFor } from "@testing-library/react";
import { test, expect, vi, beforeEach } from "vitest";
import { useEffect } from "react";

import { AuthProvider, useAuth } from "../../context/AuthContext";
import { apiFetch } from "../../api/apiClient";

vi.mock("../../api/apiClient", () => ({
  apiFetch: vi.fn(),
}));

function TestComponent() {
  const auth = useAuth();

  useEffect(() => {
    window.login = auth.login;
    window.logout = auth.logout;
  }, [auth]);

  return (
    <>
      <div>loading: {String(auth.loading)}</div>
      <div>authenticated: {String(auth.isAuthenticated)}</div>
      <div>admin: {String(auth.isAdmin)}</div>
      <div>user: {auth.user?.email ?? "none"}</div>
    </>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();

  delete window.login;
  delete window.logout;
});

test("starts unauthenticated when no token exists", async () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() =>
    expect(screen.getByText("loading: false")).toBeInTheDocument()
  );

  expect(screen.getByText("authenticated: false")).toBeInTheDocument();
  expect(screen.getByText("user: none")).toBeInTheDocument();

  expect(apiFetch).not.toHaveBeenCalled();
});

test("loads user from saved token", async () => {
  localStorage.setItem("token", "abc");

  apiFetch.mockResolvedValue({
    ok: true,
    json: () =>
      Promise.resolve({
        id: 1,
        email: "admin@test.com",
        role: "ADMIN",
      }),
  });

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() =>
    expect(screen.getByText("loading: false")).toBeInTheDocument()
  );

  expect(apiFetch).toHaveBeenCalledTimes(1);

  expect(screen.getByText("authenticated: true")).toBeInTheDocument();
  expect(screen.getByText("user: admin@test.com")).toBeInTheDocument();
  expect(screen.getByText("admin: true")).toBeInTheDocument();
});

test("removes invalid token when profile request fails", async () => {
  localStorage.setItem("token", "bad-token");

  apiFetch.mockRejectedValue(new Error("Unauthorized"));

  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() =>
    expect(screen.getByText("loading: false")).toBeInTheDocument()
  );

  expect(localStorage.getItem("token")).toBeNull();

  expect(screen.getByText("authenticated: false")).toBeInTheDocument();
  expect(screen.getByText("user: none")).toBeInTheDocument();
});

test("login stores token and user", async () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() =>
    expect(screen.getByText("loading: false")).toBeInTheDocument()
  );

  window.login("token123", {
    id: 2,
    email: "user@test.com",
    role: "USER",
  });

  await waitFor(() =>
    expect(screen.getByText("authenticated: true")).toBeInTheDocument()
  );

  expect(localStorage.getItem("token")).toBe("token123");
  expect(screen.getByText("user: user@test.com")).toBeInTheDocument();
  expect(screen.getByText("admin: false")).toBeInTheDocument();
});

test("logout clears auth state", async () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );

  await waitFor(() =>
    expect(screen.getByText("loading: false")).toBeInTheDocument()
  );

  window.login("token123", {
    id: 2,
    email: "user@test.com",
    role: "USER",
  });

  await waitFor(() =>
    expect(screen.getByText("authenticated: true")).toBeInTheDocument()
  );

  window.logout();

  await waitFor(() =>
    expect(screen.getByText("authenticated: false")).toBeInTheDocument()
  );

  expect(localStorage.getItem("token")).toBeNull();
  expect(screen.getByText("user: none")).toBeInTheDocument();
});