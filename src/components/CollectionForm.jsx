import styles from "../css/CollectionForm.module.css";
import { CloudUpload } from "lucide-react";
import Select from "../ui/Select";
import { Link, useNavigate } from "react-router-dom";
import Input from "../ui/Input";


export default function CollectionForm({onChange}) {
  return (
    <form className={styles.collectionForm}>
    <div className={styles.left}>
    <div className={styles.mainText}> 
    <h1>Add New Collection</h1>
    <p>Fill in the details below to add a new collection</p>
    </div>
        <label className={styles.uploadBox}>
        <input
          type="file"
          className={styles.uploadInput}
          accept="image/*"
          onChange={(e) => console.log(e.target.files[0])}
        />

        <div className={styles.uploadContent}>
          <div className={styles.uploadIcon}>
            <CloudUpload />
          </div>

          <p className={styles.uploadText}>
            Click to <span>upload image</span>
          </p>
        </div>
      </label>
      </div>

<div className={styles.right}>
     <div className={styles.input}>
                <label className={styles.labelRequired}>Collection Name</label>
                <Input
                  name="collectionname"
                  placeholder="e.g. Books collection"
                />
              </div>

              <label className={styles.labelRequired}>Category</label>
            <select>
        <option>Select a category</option>
      </select>

      <label className={styles.labelRequired}>Description</label>
                <Input
                  name="description"
                  placeholder="Describe  your collection in detail..."
                />
</div>

    </form>
  );
}