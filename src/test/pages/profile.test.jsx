import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

import ProfilePage from "../../pages/ProfilePage";

/* ================= MOCKS ================= */

vi.mock("../../components/Sidebar", () => ({
  default: () => <div>Sidebar</div>,
}));

vi.mock("../../components/ProfileCard", () => ({
  default: ({ user }) => (
    <div>
      <h2>{user.username}</h2>
      <p>{user.email}</p>
    </div>
  ),
}));

vi.mock("../../components/InfoCard", () => ({
  default: ({ title, count }) => (
    <div>
      <span>{title}</span>
      <strong>{count}</strong>
    </div>
  ),
}));

vi.mock("../../api/collections", () => ({
  getUserAnalytics: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

/* ================= IMPORTS AFTER MOCKS ================= */

import { getUserAnalytics } from "../../api/collections";
import { useAuth } from "../../context/AuthContext";

/* ================= TEST ================= */

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("profile page renders user info and analytics", async () => {
    useAuth.mockReturnValue({
      loading: false,
      user: {
        id: 1,
        username: "John Doe",
        email: "john@example.com",
      },
    });

    getUserAnalytics.mockResolvedValue({
      items_count: 12,
      collections_count: 4,
      total_value: 2500,
    });

    render(<ProfilePage />);

    /* USER INFO */

    expect(
      screen.getByText("John Doe")
    ).toBeInTheDocument();

    expect(
      screen.getByText("john@example.com")
    ).toBeInTheDocument();

    /* ANALYTICS */

    await waitFor(() => {
      expect(
        screen.getByText("Items")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Collections")
      ).toBeInTheDocument();

      expect(
        screen.getByText("Total value")
      ).toBeInTheDocument();

      expect(
        screen.getByText("12")
      ).toBeInTheDocument();

      expect(
        screen.getByText("4")
      ).toBeInTheDocument();

      expect(
        screen.getByText("2500")
      ).toBeInTheDocument();
    });
  });
});