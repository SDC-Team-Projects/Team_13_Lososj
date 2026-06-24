import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import ChangePasswordForm from "../../components/ChangePasswordForm";
import { changePassword } from "../../api/profile";

vi.mock("../../api/profile", () => ({
  changePassword: vi.fn(),
}));

function setup() {
  render(<ChangePasswordForm />);

  return {
    user: userEvent.setup(),
    oldPasswordInput: screen.getByPlaceholderText("Old password"),
    newPasswordInput: screen.getByPlaceholderText("New password"),
    confirmPasswordInput: screen.getByPlaceholderText("Confirm new password"),
    submitButton: screen.getByRole("button", {
      name: /change password/i,
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  changePassword.mockResolvedValue({});
});

describe("ChangePasswordForm", () => {
  test("renders change password form", () => {
    setup();

    expect(
      screen.getByText("Change Password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Old password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("New password")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Confirm new password")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /change password/i,
      })
    ).toBeInTheDocument();
  });

  test("shows error when fields are empty", async () => {
    const { user, submitButton } = setup();

    await user.click(submitButton);

    expect(
      screen.getByText("Fill all fields")
    ).toBeInTheDocument();

    expect(changePassword).not.toHaveBeenCalled();
  });

  test("shows error when new password is shorter than 8 characters", async () => {
    const {
      user,
      oldPasswordInput,
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
    } = setup();

    await user.type(oldPasswordInput, "oldpassword");
    await user.type(newPasswordInput, "123");
    await user.type(confirmPasswordInput, "123");

    await user.click(submitButton);

    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();

    expect(changePassword).not.toHaveBeenCalled();
  });

  test("shows confirm error when passwords do not match", async () => {
    const {
      user,
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
    } = setup();

    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "different123");

    expect(
      screen.getByText("Passwords do not match")
    ).toBeInTheDocument();

    expect(submitButton).toBeDisabled();
  });

  test("removes confirm error when passwords match again", async () => {
    const {
      user,
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
    } = setup();

    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "different123");

    expect(
      screen.getByText("Passwords do not match")
    ).toBeInTheDocument();

    await user.clear(confirmPasswordInput);
    await user.type(confirmPasswordInput, "newpassword123");

    expect(
      screen.queryByText("Passwords do not match")
    ).not.toBeInTheDocument();

    expect(submitButton).not.toBeDisabled();
  });

  test("calls changePassword with correct data", async () => {
    const {
      user,
      oldPasswordInput,
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
    } = setup();

    await user.type(oldPasswordInput, "oldpassword123");
    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");

    await user.click(submitButton);

    await waitFor(() => {
      expect(changePassword).toHaveBeenCalledWith({
        old_password: "oldpassword123",
        new_password: "newpassword123",
      });
    });
  });

  test("shows success message and clears fields after successful password change", async () => {
    const {
      user,
      oldPasswordInput,
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
    } = setup();

    await user.type(oldPasswordInput, "oldpassword123");
    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");

    await user.click(submitButton);

    expect(
      await screen.findByText("Password updated successfully")
    ).toBeInTheDocument();

    expect(oldPasswordInput).toHaveValue("");
    expect(newPasswordInput).toHaveValue("");
    expect(confirmPasswordInput).toHaveValue("");
  });

  test("shows API error when password change fails", async () => {
    changePassword.mockRejectedValueOnce(
      new Error("Wrong old password")
    );

    const {
      user,
      oldPasswordInput,
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
    } = setup();

    await user.type(oldPasswordInput, "wrongoldpassword");
    await user.type(newPasswordInput, "newpassword123");
    await user.type(confirmPasswordInput, "newpassword123");

    await user.click(submitButton);

    expect(
      await screen.findByText("Wrong old password")
    ).toBeInTheDocument();
  });
});