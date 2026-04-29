import styles from "../css/Select.module.css";

export default function Select ({options, value, onChange, className}) {
    return (
 <select value={value} onChange={onChange} className={styles.select}>
      <option value="">Select country</option>

      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    )
}
