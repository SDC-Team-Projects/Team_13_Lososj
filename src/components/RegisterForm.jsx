import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import styles from "../css/AuthForm.module.css";
import Select from "../ui/Select";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";


countries.registerLocale(en);

const countryOptions = Object.entries(
  countries.getNames("en", { select: "official" })
)
  .map(([code, name]) => ({
    value: code,
    label: name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function RegisterForm() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    country: "",
  });

  // INPUT CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const res = await fetch(
        "https://team-13-lososj.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            username: form.username,
            city: form.city,
            country: form.country, // ✅ FIX: value, not label
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Register failed");
        return;
      }

      // сохранить токен (если backend его возвращает)
      if (data.token) {
  login(data.token);
}

      toast.success("Register successful!");

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
          <h1>Welcome !</h1>
          <p>
            Create collections in seconds and discover unique items that will
            complement your collection.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.information}>
            <h2>Create Account</h2>
            <p>Create account to access your collection</p>
          </div>

          <div className={styles.input}>
            <label className={styles.labelRequired}>Full Name</label>
            <Input
              name="username"
              placeholder="Name Surname"
              onChange={handleChange}
            />
          </div>

          <div>
            <label className={styles.labelRequired}>Email</label>
            <Input
              name="email"
              placeholder="email@example.com"
              onChange={handleChange}
            />
          </div>

          <div className={styles.pair}>
            <div className={styles.field}>
              <label className={styles.labelRequired}>Country</label>
              <Select
  name="country"
  options={countryOptions}
  value={form.country}
  onChange={handleChange}
  placeholder="Select country"
/>
            </div>

            <div className={styles.field}>
              <label className={styles.labelRequired}>City</label>
              <Input
                name="city"
                placeholder="Enter city"
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.password}>
            <label className={styles.labelRequired}>Password</label>
            <Input
              name="password"
              type="password"
              placeholder="Password"
              onChange={handleChange}
            />
          </div>

          <div className={styles.password}>
            <label className={styles.labelRequired}>Confirm Password</label>
            <Input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
            />
          </div>

          <Button className={styles.button} type="submit">
            Create account
          </Button>

          <p className={styles.confirmation}>
            Already have an account?{" "}
            <Link to="/login" className={styles.highlight}>
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
