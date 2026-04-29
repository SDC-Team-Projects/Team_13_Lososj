import Input from "../ui/Input";
import Button from "../ui/Button";
import styles from "../css/AuthForm.module.css";
import { Link } from "react-router-dom";

export default function LoginForm() {
  return (
    <div className={styles.page}>
      <div className={styles.main}>
        <h1>Welcome Back!</h1>
      <p>Create collections in seconds and discover unique items 
      that will complement your collection.</p>
      </div>
    <form className={styles.form}>
      <h2>Login</h2>

      
            <div className={styles.input}>
              <label className={styles.labelRequired}>Full Name</label>
              <Input placeholder="Name Surname"/>
            </div>
      
            <div>
            <label className={styles.labelRequired}>Email</label>
            <Input placeholder="email@example.com" />
            </div>
            
                <div className={styles.password}>
                    <label className={styles.labelRequired}>Password</label>
                    <Input placeholder="Password" type="password" />
                      </div>
                    <div className={styles.password}>
                    <label className={styles.labelRequired}>Confirm Password</label>
                    <Input placeholder="Confirm Password" type="password" />
                  </div>

      <Button variant="primary">Sign In</Button>
      <p className={styles.confirmation}>Don't have an account? <Link to="/register"className={styles.highlight}>Create now </Link></p>
    </form>
    </div>
  );
}