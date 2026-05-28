import styles from "../css/Input.module.css";

export default function Input({ id, type = "text", placeholder, value, onChange, name }) {
  return (
    <input  id={id} className={styles.input} type={type} placeholder={placeholder} value={value} onChange={onChange} name={name}/>
  );
}



// style={{
//         display: "block",
//         marginBottom: "10px",
//         padding: "8px",
//         width: "100%",
//       }}