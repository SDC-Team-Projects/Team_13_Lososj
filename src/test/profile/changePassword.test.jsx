import { describe, test, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { changePassword } from "../../api/profile";
import ChangePassword from "../../components/ChangePasswordForm";

vi.mock("../../api/profile", () => ({
  changePassword: vi.fn(() => Promise.resolve()),
}));



describe("change password flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("user can change password successfully", async () => {
    const user = userEvent.setup(); // ✅ ВАЖНО

    render(<ChangePassword />);

    await user.type(
      screen.getByPlaceholderText("Old password"),
      "oldpassword123"
    );

    await user.type(
      screen.getByPlaceholderText("New password"),
      "newpassword123"
    );

    await user.type(
      screen.getByPlaceholderText("Confirm new password"),
      "newpassword123"
    );

    await user.click(
      screen.getByRole("button", {
        name: /change password/i,
      })
    );

    expect(changePassword).toHaveBeenCalledWith({
      old_password: "oldpassword123",
      new_password: "newpassword123",
    });

    expect(
      await screen.findByText("Password updated successfully")
    ).toBeInTheDocument();
  });
});






// import { describe, test, expect, vi, beforeEach } from "vitest";
// import { render, screen, waitFor } from "@testing-library/react";
// import userEvent from "@testing-library/user-event";
// import ChangePassword from "../../components/ChangePasswordForm";
// import { changePassword } from "../../api/profile";

// vi.mock("../../api/profile", () => ({
//   changePassword: vi.fn(() => Promise.resolve()),
// }));

// describe("change password flow", () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//   });

//   test("user can change password successfully", async () => {
//     const user = userEvent.setup();

//     render(<ChangePassword />);

//     await user.type(
//       screen.getByPlaceholderText("Old password"),
//       "oldpassword123"
//     );

//     // 🔥 ВАЖНО: берем ВСЕ new password поля и выбираем первое
//     const newPasswordInputs = screen.getAllByPlaceholderText("New password");
//     await user.type(newPasswordInputs[0], "newpassword123");

//     const confirmInputs = screen.getAllByPlaceholderText("Confirm new password");
//     await user.type(confirmInputs[0], "newpassword123");

//     await user.click(
//       screen.getByRole("button", { name: /change password/i })
//     );

//     await waitFor(() => {
//       expect(changePassword).toHaveBeenCalledWith({
//         old_password: "oldpassword123",
//         new_password: "newpassword123",
//       });
//     });

//     expect(
//       await screen.findByText(/password updated successfully/i)
//     ).toBeInTheDocument();
//   });
// });