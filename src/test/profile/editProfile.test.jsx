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
      avatar_url: "",
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
    /* ---- LOAD PROFILE ---- */
    fetch.mockResolvedValueOnce({
      json: async () => ({
        username: "Old User",
        email: "old@example.com",
        city: "Vilnius",
        country: "Lithuania",
        bio: "Old bio",
        avatar_url: "https://example.com/avatar.jpg",
      }),
    });

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

    expect(
      await screen.findByDisplayValue("Old User")
    ).toBeInTheDocument();

    const usernameInput = screen.getByDisplayValue("Old User");
    await userEvent.clear(usernameInput);
    await userEvent.type(usernameInput, "New Username");

    const bioInput = screen.getByDisplayValue("Old bio");
    await userEvent.clear(bioInput);
    await userEvent.type(bioInput, "Updated bio");

    await userEvent.click(
      screen.getByRole("button", { name: /save changes/i })
    );

    await waitFor(() => {
      expect(fetch).toHaveBeenLastCalledWith(
        "https://team-13-lososj.onrender.com/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            username: "New Username",
            email: "old@example.com",
            city: "Vilnius",
            country: "Lithuania",
            bio: "Updated bio",
            avatar_url: "https://example.com/avatar.jpg",
          }),
        })
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith("/profile");
  });
});