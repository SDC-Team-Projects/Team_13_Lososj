import styles from "../css/Button.module.css";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
}) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}