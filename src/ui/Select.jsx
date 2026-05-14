import styles from "../css/Select.module.css";

export default function Select({
  options,
  value,
  onChange,
  name,
  placeholder = "Select option",
}) {
  return (
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={styles.select}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}