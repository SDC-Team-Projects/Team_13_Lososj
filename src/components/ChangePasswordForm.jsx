
import React, { useState } from "react";

import Button from "../ui/Button";
import { changePassword } from "../api/profile";

import "../css/ChangePassword.css";

export default function ChangePassword() {

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [confirmError, setConfirmError] = useState("");

  function handleNewPasswordChange(e) {
    const value = e.target.value;
    setNewPassword(value);

    if (confirmPassword && value !== confirmPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }

  function handleConfirmChange(e) {
    const value = e.target.value;
    setConfirmPassword(value);

    if (newPassword && value !== newPassword) {
      setConfirmError("Passwords do not match");
    } else {
      setConfirmError("");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("Fill all fields");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {

      setLoading(true);

      await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccess("Password updated successfully");

      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setConfirmError("");

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="passwordPage">

      <div className="passwordCard">

        <h2 className="passwordTitle">
          Change Password
        </h2>

        <form className="passwordForm" onSubmit={handleSubmit}>

          <input
            type="password"
            placeholder="Old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={handleNewPasswordChange}
          />

          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={handleConfirmChange}
          />

          <Button
            type="submit"
            disabled={loading || confirmError}
          >
            {loading ? "Updating..." : "Change password"}
          </Button>

          {error && (
            <p className="passwordError">
              {error}
            </p>
          )}

          {confirmError && (
            <p className="passwordError">
              {confirmError}
            </p>
          )}

          {success && (
            <p className="passwordSuccess">
              {success}
            </p>
          )}

        </form>

      </div>

    </div>
  );
}