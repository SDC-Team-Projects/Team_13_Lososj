import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import LoginForm from "../../components/LoginForm";

import { useAuth } from "../../context/AuthContext";
import { toast } from "react-hot-toast";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  Toaster: () => <div data-testid="toaster" />,
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function setup() {
  const result = renderWithProviders(<LoginForm />, {
    route: "/login",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  mockLogin.mockClear();

  useAuth.mockReturnValue({
    login: mockLogin,
  });

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "login-token-123",
          user: {
            id: 1,
            username: "John Smith",
            email: "john@example.com",
          },
        }),
    })
  );

  console.error = vi.fn();
});

describe("LoginForm", () => {
  test("renders login form", () => {
    setup();

    expect(
      screen.getByText("Welcome Back!")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Login")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("email@example.com")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /forgot password/i,
      })
    ).toHaveAttribute("href", "/forgot-password");

    expect(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /create now/i,
      })
    ).toHaveAttribute("href", "/");
  });

  test("updates email and password fields", async () => {
    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");
    const passwordInput = screen.getByPlaceholderText("Password");

    await user.type(emailInput, "john@example.com");
    await user.type(passwordInput, "password123");

    expect(emailInput).toHaveValue("john@example.com");
    expect(passwordInput).toHaveValue("password123");
  });

  test("sends login request with correct data", async () => {
    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://team-13-lososj.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
          }),
        }
      );
    });
  });

  test("logs in user and navigates home after successful login", async () => {
    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "login-token-123",
        {
          id: 1,
          username: "John Smith",
          email: "john@example.com",
        }
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Login successful!"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  test("shows backend error when login fails", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Invalid credentials",
          }),
      })
    );

    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "wrong@example.com"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "wrongpassword"
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Invalid credentials"
      );
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows default login error when backend returns no message", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Login failed"
      );
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows error toast when fetch throws", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    );

    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /sign in/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Error");
    });

    expect(console.error).toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});