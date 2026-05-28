import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Sidebar from "../../components/Sidebar";

const navigateMock = vi.fn();
const logoutMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual(
    "react-router-dom"
  );

  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: "testuser",
      role: "USER",
    },
    logout: logoutMock,
  }),
}));

vi.mock("../../api/auth", () => ({
  logoutUser: vi.fn(() =>
    Promise.resolve()
  ),
}));

describe("logout flow", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("user can logout successfully", async () => {

    render(
      <MemoryRouter>
        <Sidebar />
      </MemoryRouter>
    );

    // ПЕРВАЯ кнопка = menu button
    const menuBtn =
      screen.getAllByRole("button")[0];

    await userEvent.click(menuBtn);

    // settings
    const settingsBtn =
      screen.getByText("Settings");

    await userEvent.hover(settingsBtn);

    // logout button in dropdown
    const logoutBtn =
      screen.getByText("Log Out");

    await userEvent.click(logoutBtn);

    // confirm modal button
    const confirmLogoutBtn =
      screen.getAllByText("Log Out")[1];

    await userEvent.click(
      confirmLogoutBtn
    );

    expect(logoutMock)
      .toHaveBeenCalled();

    expect(navigateMock)
      .toHaveBeenCalledWith(
        "/login"
      );
  });
});