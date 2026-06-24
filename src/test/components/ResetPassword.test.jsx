import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { screen, fireEvent, act } from "@testing-library/react";

import { renderWithProviders } from "../test-utils";
import ResetPassword from "../../components/ResetPassword";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({
      token: "reset-token-123",
    }),
  };
});

function setup() {
  return renderWithProviders(<ResetPassword />, {
    route: "/reset-password/reset-token-123",
  });
}

async function flushPromises() {
  await act(async () => {
    await Promise.resolve();
  });

  await act(async () => {
    await Promise.resolve();
  });

  await act(async () => {
    await Promise.resolve();
  });
}

function fillPasswords(
  newPassword = "newpassword123",
  confirmPassword = "newpassword123"
) {
  fireEvent.change(
    screen.getByPlaceholderText("New password"),
    {
      target: {
        value: newPassword,
      },
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText("Confirm password"),
    {
      target: {
        value: confirmPassword,
      },
    }
  );
}

async function submitForm() {
  fireEvent.click(
    screen.getByRole("button", {
      name: /reset password/i,
    })
  );

  await flushPromises();
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.clearAllMocks();

  mockNavigate.mockClear();

  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  );

  console.error = vi.fn();
});

afterEach(() => {
  vi.clearAllTimers();
  vi.useRealTimers();
});

describe("ResetPassword", () => {
  test("renders reset password form", () => {
    setup();

    expect(
      screen.getByText("Reset Password")
    ).toBeInTheDocument();

    expect(
      screen.getByText("New Password")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Confirm Password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("New password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Confirm password")
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

  test("updates password fields", () => {
    setup();

    fillPasswords();

    expect(
      screen.getByPlaceholderText("New password")
    ).toHaveValue("newpassword123");

    expect(
      screen.getByPlaceholderText("Confirm password")
    ).toHaveValue("newpassword123");
  });

  test("shows error when fields are empty", async () => {
    setup();

    await submitForm();

    expect(
      screen.getByText("Fill all fields")
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows error when password is shorter than 8 characters", async () => {
    setup();

    fillPasswords("123", "123");

    await submitForm();

    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("shows confirm error while passwords do not match", () => {
    setup();

    fillPasswords("newpassword123", "different123");

    expect(
      screen.getByText("Passwords do not match")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    ).toBeDisabled();
  });

  test("removes confirm error when passwords match again", () => {
    setup();

    const confirmPasswordInput =
      screen.getByPlaceholderText("Confirm password");

    fillPasswords("newpassword123", "different123");

    expect(
      screen.getByText("Passwords do not match")
    ).toBeInTheDocument();

    fireEvent.change(confirmPasswordInput, {
      target: {
        value: "newpassword123",
      },
    });

    expect(
      screen.queryByText("Passwords do not match")
    ).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /reset password/i,
      })
    ).not.toBeDisabled();
  });

  test("sends reset password request with correct data", async () => {
    setup();

    fillPasswords();

    await submitForm();

    expect(global.fetch).toHaveBeenCalledWith(
      "https://team-13-lososj.onrender.com/api/auth/password-reset/confirm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: "reset-token-123",
          new_password: "newpassword123",
          confirm_new_password: "newpassword123",
        }),
      }
    );
  });

  test("shows success message after password reset", async () => {
    setup();

    fillPasswords();

    await submitForm();

    expect(
      screen.getByText("Password updated successfully")
    ).toBeInTheDocument();
  });

  test("navigates to login after successful reset", async () => {
    setup();

    fillPasswords();

    await submitForm();

    expect(
      screen.getByText("Password updated successfully")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  test("shows backend error when reset request fails", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Invalid token",
          }),
      })
    );

    setup();

    fillPasswords();

    await submitForm();

    expect(
      screen.getByText("Invalid token")
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

    setup();

    fillPasswords();

    await submitForm();

    expect(
      screen.getByText("Error")
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows server error when fetch throws", async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error("Network error"))
    );

    setup();

    fillPasswords();

    await submitForm();

    expect(
      screen.getByText("Server error")
    ).toBeInTheDocument();

    expect(console.error).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});