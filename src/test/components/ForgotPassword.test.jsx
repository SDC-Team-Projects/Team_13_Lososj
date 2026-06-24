import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import ForgotPassword from "../../components/ForgotPassword";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function setup() {
  const result = renderWithProviders(<ForgotPassword />, {
    route: "/forgot-password",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "reset-token-123",
        }),
    })
  );

  console.error = vi.fn();
});

describe("ForgotPassword", () => {
  test("renders forgot password form", () => {
    setup();

    expect(
      screen.getByText("Forgot Password")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Email")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("email@example.com")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /login/i,
      })
    ).toHaveAttribute("href", "/login");
  });

  test("updates email input", async () => {
    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "test@example.com");

    expect(emailInput).toHaveValue("test@example.com");
  });

  test("shows error when email is empty", async () => {
    const { user } = setup();

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    expect(
      screen.getByText("Enter email")
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("sends password reset request with email", async () => {
    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "test@example.com");

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://team-13-lososj.onrender.com/api/auth/password-reset/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "test@example.com",
          }),
        }
      );
    });
  });

  test("navigates to reset password page after successful request", async () => {
    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "test@example.com");

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/reset-password/reset-token-123"
      );
    });
  });

  test("shows backend error when request fails", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Email not found",
          }),
      })
    );

    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "missing@example.com");

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    expect(
      await screen.findByText("Email not found")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows default error when backend returns no error message", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "test@example.com");

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    expect(
      await screen.findByText("Error")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows server error when fetch throws", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    );

    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "test@example.com");

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    expect(
      await screen.findByText("Server error")
    ).toBeInTheDocument();

    expect(console.error).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows loading state while request is pending", async () => {
    let resolveFetch;

    global.fetch = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );

    const { user } = setup();

    const emailInput = screen.getByPlaceholderText("email@example.com");

    await user.type(emailInput, "test@example.com");

    await user.click(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    );

    expect(
      screen.getByRole("button", {
        name: /reseting/i,
      })
    ).toBeDisabled();

    resolveFetch({
      ok: true,
      json: () =>
        Promise.resolve({
          token: "reset-token-123",
        }),
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/reset-password/reset-token-123"
      );
    });
  });
});