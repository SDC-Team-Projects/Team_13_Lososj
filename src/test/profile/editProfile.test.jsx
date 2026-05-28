import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import EditProfilePage from "../../pages/EditProfilePage";

/* ================= MOCK AUTH ================= */

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: {
      id: 1,
      username: "testuser",
      email: "test@mail.com",
      city: "Vilnius",
      country: "LT",
      bio: "test bio",
      avatar_url: "https://example.com/avatar.jpg",
    },
  }),
}));

/* ================= MOCK NAVIGATE ================= */

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

/* ================= MOCK FETCH ================= */

global.fetch = vi.fn();

describe("edit profile flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("user can edit profile successfully", async () => {
    /* ---- UPDATE PROFILE ---- */
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>
    );

    /* ================= INITIAL VALUES (from AuthContext) ================= */

    expect(
      await screen.findByDisplayValue("testuser")
    ).toBeInTheDocument();

    const usernameInput = screen.getByDisplayValue("testuser");
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, "New Username");

    const bioInput = screen.getByDisplayValue("test bio");
    await userEvent.clear(bioInput);
    await userEvent.type(bioInput, "Updated bio");

    /* ================= SUBMIT ================= */

    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i })
    );

    /* ================= ASSERT API ================= */

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "https://team-13-lososj.onrender.com/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            username: "New Username",
            email: "test@mail.com",
            city: "Vilnius",
            country: "LT",
            bio: "Updated bio",
            avatar_url: "https://example.com/avatar.jpg",
          }),
        })
      );
    });

    /* ================= REDIRECT ================= */

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});