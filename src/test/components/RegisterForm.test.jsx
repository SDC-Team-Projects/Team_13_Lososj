import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import RegisterForm from "../../components/RegisterForm";

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
  const result = renderWithProviders(<RegisterForm />, {
    route: "/register",
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
          token: "register-token-123",
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

describe("RegisterForm", () => {
  test("renders register form", () => {
    setup();

    expect(screen.getByText("Welcome !")).toBeInTheDocument();

    expect(
      screen.getByText("Create Account")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Create account to access your collection")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Name Surname")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("email@example.com")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter city")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Confirm Password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /create account/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /sign in/i,
      })
    ).toHaveAttribute("href", "/login");
  });

test("updates form fields", () => {
  setup();

  const nameInput = screen.getByPlaceholderText("Name Surname");
  const emailInput = screen.getByPlaceholderText("email@example.com");
  const cityInput = screen.getByPlaceholderText("Enter city");
  const passwordInput = screen.getByPlaceholderText("Password");
  const confirmPasswordInput =
    screen.getByPlaceholderText("Confirm Password");
  const countrySelect = screen.getByRole("combobox");

  fireEvent.change(nameInput, {
    target: {
      name: "username",
      value: "John Smith",
    },
  });

  fireEvent.change(emailInput, {
    target: {
      name: "email",
      value: "john@example.com",
    },
  });

  fireEvent.change(countrySelect, {
    target: {
      name: "country",
      value: "GB",
    },
  });

  fireEvent.change(cityInput, {
    target: {
      name: "city",
      value: "London",
    },
  });

  fireEvent.change(passwordInput, {
    target: {
      name: "password",
      value: "password123",
    },
  });

  fireEvent.change(confirmPasswordInput, {
    target: {
      name: "confirmPassword",
      value: "password123",
    },
  });

  expect(nameInput).toHaveValue("John Smith");
  expect(emailInput).toHaveValue("john@example.com");
  expect(countrySelect).toHaveValue("GB");
  expect(cityInput).toHaveValue("London");
  expect(passwordInput).toHaveValue("password123");
  expect(confirmPasswordInput).toHaveValue("password123");
});

  test("shows toast error when passwords do not match", async () => {
    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "different123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    expect(toast.error).toHaveBeenCalledWith(
      "Passwords do not match"
    );

    expect(global.fetch).not.toHaveBeenCalled();
    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("sends register request with correct data", async () => {
    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("Name Surname"),
      "John Smith"
    );

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "GB"
    );

    await user.type(
      screen.getByPlaceholderText("Enter city"),
      "London"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "https://team-13-lososj.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "john@example.com",
            password: "password123",
            username: "John Smith",
            city: "London",
            country: "GB",
          }),
        }
      );
    });
  });

  test("logs in user and navigates home after successful registration", async () => {
    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("Name Surname"),
      "John Smith"
    );

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      "GB"
    );

    await user.type(
      screen.getByPlaceholderText("Enter city"),
      "London"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        "register-token-123",
        {
          id: 1,
          username: "John Smith",
          email: "john@example.com",
        }
      );
    });

    expect(toast.success).toHaveBeenCalledWith(
      "Register successful!"
    );

    expect(mockNavigate).toHaveBeenCalledWith("/home");
  });

  test("shows backend error when registration fails", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () =>
          Promise.resolve({
            error: "Email already exists",
          }),
      })
    );

    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("Name Surname"),
      "John Smith"
    );

    await user.type(
      screen.getByPlaceholderText("email@example.com"),
      "john@example.com"
    );

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Email already exists"
      );
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows default register error when backend returns no message", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({}),
      })
    );

    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "Register failed"
      );
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("shows error when token is missing", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            user: {
              id: 1,
              username: "John Smith",
            },
          }),
      })
    );

    const { user } = setup();

    await user.type(
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
      })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(
        "No token received"
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
      screen.getByPlaceholderText("Password"),
      "password123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm Password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /create account/i,
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