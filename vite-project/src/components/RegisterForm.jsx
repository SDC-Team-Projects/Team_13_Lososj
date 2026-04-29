import Input from "../ui/Input";
import Button from "../ui/Button";
import styles from "../css/AuthForm.module.css";
import Select from "../ui/Select";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { Link } from "react-router-dom";

countries.registerLocale(en);

const countryOptions = Object.entries(countries.getNames("en", { select: "official" }))
  .map(([code, name]) => ({
    value: code,
    label: name,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export default function RegisterForm() {
  return (
    <div className={styles.page}>
      <div className={styles.main}> 
      <h1>Welcome !</h1>
      <p>Create collections in seconds and discover unique items 
      that will complement your collection.</p>
      </div>


    <form className={styles.form}>
      <div className={styles.information}>
        <h2>Create Account</h2>
      <p>Create account to access your collection</p>
      </div>
      <div className={styles.input}>
        <label className={styles.labelRequired}>Full Name</label>
        <Input placeholder="Name Surname"/>
      </div>

      <div>
      <label className={styles.labelRequired}>Email</label>
      <Input placeholder="email@example.com" />
      </div>

<div className={styles.pair}>
    <div className={styles.field}>
        <label className={styles.labelRequired}>Country</label>
        <Select options={countryOptions} className={styles.select} />
        </div>
    
      <div className={styles.field}>
        <label className={styles.labelRequired}>City</label>
        <Input placeholder="Enter city" />
        </div>
</div>

          <div className={styles.password}>
                            <label className={styles.labelRequired}>Password</label>
                            <Input placeholder="Password" type="password" />
                              </div>
                            <div className={styles.password}>
                            <label className={styles.labelRequired}>Confirm Password</label>
                            <Input placeholder="Confirm Password" type="password" />
                          </div>

      <Button className={styles.button}>Create account</Button>
      <p className={styles.confirmation}>Already have an account?<Link to="/login" className={styles.highlight}>Sign in</Link></p>
    </form>
    </div>
  );
}