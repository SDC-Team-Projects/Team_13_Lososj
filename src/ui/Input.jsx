import styles from "../css/Input.module.css";

export default function Input({ type = "text", placeholder, value, onChange }) {
  return (
    <input className={styles.input} type={type} placeholder={placeholder} value={value} onChange={onChange}/>
  );
}



// style={{
//         display: "block",
//         marginBottom: "10px",
//         padding: "8px",
//         width: "100%",
//       }}