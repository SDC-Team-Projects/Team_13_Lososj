import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import styles from "../css/AuthForm.module.css";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function LoginForm() {
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(
        "https://team-13-lososj.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
  toast.error(data.error || "Login failed");
  return;
}

      
      login(data.token, data.user);

      toast.success("Login successful!");

      // перейти на профиль
      navigate("/home");

    } catch (err) {
      console.error(err);
      toast.error("Error");
    }
  };

  return (
    <>
      <Toaster />  
    <div className={styles.page}>
      <div className={styles.main}>
        <h1>Welcome Back!</h1>
        <p>
          Create collections in seconds and discover unique items 
          that will complement your collection.
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <h2>Login</h2>

        <div>
          <label className={styles.labelRequired}>Email</label>
          <Input
            name="email"
            placeholder="email@example.com"
            onChange={handleChange}
          />
        </div>

        <div className={styles.password}>
          <label className={styles.labelRequired}>Password</label>
          <Input
            name="password"
            placeholder="Password"
            type="password"
            onChange={handleChange}
          />
        </div>

        <Button type="submit" variant="primary">
  Sign In
</Button>

        <p className={styles.confirmation}>
          Don't have an account?{" "}
          <Link to="/" className={styles.highlight}>
            Create now
          </Link>
        </p>
      </form>
    </div>
     </>
  );
}
