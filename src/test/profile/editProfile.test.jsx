import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import EditProfilePage from "../../pages/EditProfilePage";

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

    localStorage.setItem("token", "fake-token");
  });

  test("user can edit profile successfully", async () => {

    /* ---- FIRST FETCH = LOAD PROFILE ---- */

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

    /* ---- SECOND FETCH = UPDATE PROFILE ---- */

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    render(
      <MemoryRouter>
        <EditProfilePage />
      </MemoryRouter>
    );

    /* ================= WAIT FOR DATA ================= */

    expect(
      await screen.findByDisplayValue("Old User")
    ).toBeInTheDocument();

    /* ================= EDIT FIELDS ================= */

    const usernameInput =
      screen.getByDisplayValue("Old User");

    await userEvent.clear(usernameInput);

    await userEvent.type(
      usernameInput,
      "New Username"
    );

    const bioInput =
      screen.getByDisplayValue("Old bio");

    await userEvent.clear(bioInput);

    await userEvent.type(
      bioInput,
      "Updated bio"
    );

    /* ================= SUBMIT ================= */

    await userEvent.click(
      screen.getByRole("button", {
        name: /save changes/i,
      })
    );

    /* ================= ASSERT API ================= */

    await waitFor(() => {

      expect(fetch).toHaveBeenLastCalledWith(
        "https://team-13-lososj.onrender.com/api/profile",
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Authorization: "Bearer fake-token",
          }),
          body: JSON.stringify({
            username: "New Username",
            email: "old@example.com",
            city: "Vilnius",
            country: "Lithuania",
            bio: "Updated bio",
            avatar_url:
              "https://example.com/avatar.jpg",
          }),
        })
      );

    });

    /* ================= REDIRECT ================= */

    expect(mockNavigate).toHaveBeenCalledWith(
      "/profile"
    );

  });

});