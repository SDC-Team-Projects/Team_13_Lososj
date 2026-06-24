import { describe, test, expect, vi, beforeEach } from "vitest";
import { screen, waitFor, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../test-utils";
import Sidebar from "../../components/Sidebar";

import { useAuth } from "../../context/AuthContext";
import { logoutUser } from "../../api/auth";

const mockNavigate = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());

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

vi.mock("../../api/auth", () => ({
  logoutUser: vi.fn(),
}));

vi.mock("../../components/Modal", () => ({
  default: ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="modal">
        <h2>{title}</h2>

        <button type="button" onClick={onClose}>
          Close modal
        </button>

        {children}
      </div>
    );
  },
}));

function setup() {
  const result = renderWithProviders(<Sidebar />, {
    route: "/home",
  });

  return {
    user: userEvent.setup(),
    ...result,
  };
}

function openSettingsDropdown(container) {
  const settingsBlock = container.querySelector(".sidebarSettings");

  fireEvent.mouseEnter(settingsBlock);

  return settingsBlock;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
  mockLogout.mockClear();

  useAuth.mockReturnValue({
    user: {
      id: 1,
      username: "John Smith",
      role: "USER",
    },
    logout: mockLogout,
  });

  logoutUser.mockResolvedValue({});

  console.error = vi.fn();
});

describe("Sidebar", () => {
test("renders sidebar header and navigation links", () => {
  setup();

  expect(screen.getByText("Collector App")).toBeInTheDocument();

  expect(
    screen.getByRole("link", {
      name: /home/i,
    })
  ).toHaveAttribute("href", "/home");

  expect(
    screen.getByRole("link", {
      name: /overview/i,
    })
  ).toHaveAttribute("href", "/overview");

  expect(
    screen.getByRole("link", {
      name: /my collections/i,
    })
  ).toHaveAttribute("href", "/collections");

  expect(
    screen.getByRole("link", {
      name: /favourites/i,
    })
  ).toHaveAttribute("href", "/favorites");

  expect(
    screen.getByRole("link", {
      name: /profile/i,
    })
  ).toHaveAttribute("href", "/profile");

  expect(
    screen.queryByRole("link", {
      name: /notifications/i,
    })
  ).not.toBeInTheDocument();
});

  test("does not show admin panel link for regular user", () => {
    setup();

    expect(
      screen.queryByRole("link", {
        name: /admin panel/i,
      })
    ).not.toBeInTheDocument();
  });

  test("shows admin panel link for admin user", () => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        username: "Admin User",
        role: "ADMIN",
      },
      logout: mockLogout,
    });

    setup();

    expect(
      screen.getByRole("link", {
        name: /admin panel/i,
      })
    ).toHaveAttribute("href", "/admin");
  });

  test("toggles sidebar open and closed", async () => {
    const { user, container } = setup();

    const toggleButton = container.querySelector(".menuToggleBtn");
    const sidebar = container.querySelector(".sidebar");

    expect(sidebar).not.toHaveClass("open");

    await user.click(toggleButton);

    expect(sidebar).toHaveClass("open");
    expect(container.querySelector(".sidebarOverlay")).toBeInTheDocument();

    await user.click(toggleButton);

    expect(sidebar).not.toHaveClass("open");
    expect(container.querySelector(".sidebarOverlay")).not.toBeInTheDocument();
  });

  test("closes sidebar when overlay is clicked", async () => {
    const { user, container } = setup();

    await user.click(container.querySelector(".menuToggleBtn"));

    expect(container.querySelector(".sidebar")).toHaveClass("open");

    await user.click(container.querySelector(".sidebarOverlay"));

    expect(container.querySelector(".sidebar")).not.toHaveClass("open");
  });

  test("closes sidebar when navigation link is clicked", async () => {
    const { user, container } = setup();

    await user.click(container.querySelector(".menuToggleBtn"));

    expect(container.querySelector(".sidebar")).toHaveClass("open");

    await user.click(
      screen.getByRole("link", {
        name: /overview/i,
      })
    );

    expect(container.querySelector(".sidebar")).not.toHaveClass("open");
  });

  test("opens settings dropdown on mouse enter", () => {
    const { container } = setup();

    openSettingsDropdown(container);

    expect(
      screen.getByRole("link", {
        name: /change password/i,
      })
    ).toHaveAttribute("href", "/settings/password");

    expect(
      screen.getByRole("button", {
        name: /log out/i,
      })
    ).toBeInTheDocument();
  });

  test("hides settings dropdown on mouse leave", () => {
    const { container } = setup();

    const settingsBlock = openSettingsDropdown(container);

    expect(
      screen.getByRole("link", {
        name: /change password/i,
      })
    ).toBeInTheDocument();

    fireEvent.mouseLeave(settingsBlock);

    expect(
      screen.queryByRole("link", {
        name: /change password/i,
      })
    ).not.toBeInTheDocument();
  });

  test("opens logout confirmation modal", async () => {
    const { user, container } = setup();

    openSettingsDropdown(container);

    await user.click(
      screen.getByRole("button", {
        name: /log out/i,
      })
    );

    expect(screen.getByTestId("modal")).toBeInTheDocument();

    expect(screen.getByText("Log out?")).toBeInTheDocument();

    expect(
      screen.getByText("Are you sure you want to leave your account?")
    ).toBeInTheDocument();
  });

  test("closes logout modal when cancel is clicked", async () => {
    const { user, container } = setup();

    openSettingsDropdown(container);

    await user.click(
      screen.getByRole("button", {
        name: /log out/i,
      })
    );

    const modal = screen.getByTestId("modal");

    await user.click(
      within(modal).getByRole("button", {
        name: /cancel/i,
      })
    );

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("closes logout modal when close modal button is clicked", async () => {
    const { user, container } = setup();

    openSettingsDropdown(container);

    await user.click(
      screen.getByRole("button", {
        name: /log out/i,
      })
    );

    const modal = screen.getByTestId("modal");

    await user.click(
      within(modal).getByRole("button", {
        name: /close modal/i,
      })
    );

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("logs out user and navigates to login", async () => {
    const { user, container } = setup();

    openSettingsDropdown(container);

    await user.click(
      screen.getByRole("button", {
        name: /log out/i,
      })
    );

    const modal = screen.getByTestId("modal");

    await user.click(
      within(modal).getByRole("button", {
        name: /log out/i,
      })
    );

    await waitFor(() => {
      expect(logoutUser).toHaveBeenCalledTimes(1);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/login");

    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  test("handles logout error without navigating", async () => {
    logoutUser.mockRejectedValueOnce(new Error("Logout failed"));

    const { user, container } = setup();

    openSettingsDropdown(container);

    await user.click(
      screen.getByRole("button", {
        name: /log out/i,
      })
    );

    const modal = screen.getByTestId("modal");

    await user.click(
      within(modal).getByRole("button", {
        name: /log out/i,
      })
    );

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    expect(mockLogout).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});