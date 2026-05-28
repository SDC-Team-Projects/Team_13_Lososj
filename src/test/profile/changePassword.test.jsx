import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChangePassword from "../../components/ChangePasswordForm";

vi.mock("../../api/profile", () => ({
  changePassword: vi.fn(() =>
    Promise.resolve()
  ),
}));

import { changePassword } from "../../api/profile";

describe("change password flow", () => {

  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("user can change password successfully", async () => {

    render(<ChangePassword />);

    await userEvent.type(
      screen.getByPlaceholderText(
        "Old password"
      ),
      "oldpassword123"
    );

    await userEvent.type(
      screen.getByPlaceholderText(
        "New password"
      ),
      "newpassword123"
    );

    await userEvent.type(
      screen.getByPlaceholderText(
        "Confirm new password"
      ),
      "newpassword123"
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: /change password/i,
      })
    );

    expect(changePassword)
      .toHaveBeenCalledWith({
        old_password: "oldpassword123",
        new_password: "newpassword123",
      });

    expect(
      await screen.findByText(
        "Password updated successfully"
      )
    ).toBeInTheDocument();
  });
});