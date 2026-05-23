
import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

import Input from "../ui/Input";
import Button from "../ui/Button";

import styles from "../css/AuthForm.module.css";

export default function ResetPassword() {

  const navigate = useNavigate();
  const { token } = useParams();

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
    setConfirmError("");

    if (!newPassword || !confirmPassword) {
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

      const res = await fetch(
        "https://team-13-lososj.onrender.com/api/auth/password-reset/confirm",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            new_password: newPassword,
            confirm_new_password: confirmPassword,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }

      setSuccess("Password updated successfully");

      setTimeout(() => {
        navigate("/login");
      }, 1500);

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      <form className={styles.form} onSubmit={handleSubmit}>

        <h2>Reset Password</h2>

        <div>
          <label>New Password</label>

          <Input
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={handleNewPasswordChange}
          />
        </div>

        <div>
          <label>Confirm Password</label>

          <Input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={handleConfirmChange}
          />
        </div>

        {confirmError && (
          <p className={styles.error}>
            {confirmError}
          </p>
        )}

        <Button
          type="submit"
          disabled={loading || confirmError}
        >
          {loading ? "Updating..." : "Reset password"}
        </Button>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        {success && (
          <p className={styles.success}>
            {success}
          </p>
        )}

        <p className={styles.confirmation}>
          Back to{" "}
          <Link to="/login" className={styles.highlight}>
            Login
          </Link>
        </p>

      </form>

    </div>
  );
}