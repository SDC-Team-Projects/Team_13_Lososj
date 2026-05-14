import styles from "../css/Button.module.css";

export default function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${styles.button} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}