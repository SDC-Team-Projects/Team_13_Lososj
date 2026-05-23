import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Input from "../ui/Input";
import Button from "../ui/Button";

import styles from "../css/AuthForm.module.css";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {

    e.preventDefault();

    setError("");

    if (!email) {
      setError("Enter email");
      return;
    }

    try {

      setLoading(true);

      const res = await fetch(
        "https://team-13-lososj.onrender.com/api/auth/password-reset/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error");
        return;
      }

      navigate(`/reset-password/${data.token}`);

    } catch (err) {
      console.error(err);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >

        <h2>Forgot Password</h2>

        <div>
          <label>Email</label>

          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
        >
          {loading ? "Reseting..." : "Reset password"}
        </Button>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <p className={styles.confirmation}>
          Back to{" "}
          <Link
            to="/login"
            className={styles.highlight}
          >
            Login
          </Link>
        </p>

      </form>

    </div>
  );
}