import styles from "../css/CollectionForm.module.css";
import { CloudUpload } from "lucide-react";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCollection } from "../api/collections";

export default function CollectionForm() {

const [name, setName] = useState("");
const [description, setDescription] = useState("");
const [category, setCategory] = useState("");
const [image, setImage] = useState("");

const navigate = useNavigate();

  const categories = [
    { value: "books", label: "Books" },
    { value: "movies", label: "Movies" },
    { value: "music", label: "Music" },
    { value: "games", label: "Games" },
    { value: "art", label: "Art" },
    { value: "sports", label: "Sports" },
    { value: "technology", label: "Technology" },
    { value: "other", label: "Other" },
  ];

  const handleImageChange = (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const imageUrl = URL.createObjectURL(file);

  setImage(imageUrl);
};

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await createCollection({
      name,
      description,
      category,
      image,
      is_public: true,
    });

    navigate("/collections");

  } catch (err) {
    console.error(err);
  }
};

  return (
    <form className={styles.collectionForm}  onSubmit={handleSubmit}>

      {/* LEFT */}
      <div className={styles.left}>

        <div className={styles.mainText}>
          <h1>Add New Collection</h1>
          <p>Fill in the details below to add a new collection</p>
        </div>

        <label className={styles.uploadBox}>
          <input
            type="file"
            onChange={handleImageChange}
            className={styles.uploadInput}
            accept="image/*"
          />

          <div className={styles.uploadContent}>
            <div className={styles.uploadIcon}>
              <CloudUpload />
            </div>

            <p className={styles.uploadText}>
              <span>Click to</span> upload image
            </p>
          </div>
        </label>

      </div>

      {/* RIGHT */}
      <div className={styles.right}>

        <div className={styles.input}>
          <label className={styles.labelRequired}>
            Collection Name
          </label>

          <Input
  placeholder="e.g. Books collection"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
        </div>

        <label className={styles.labelRequired}>
          Category
        </label>

        <Select
  options={categories}
  value={category}
  onChange={(e) => setCategory(e.target.value)}
/>

        <label className={styles.labelRequired}>
          Description
        </label>

        <Input
  placeholder="Describe your collection in detail..."
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>

        <div className={styles.buttons}>

          <Button type="button" className={`${styles.button} ${styles.primary}`}>
            Cancel
          </Button>

          <Button type="submit" className={`${styles.button} ${styles.primary}`}>
            Add Collection
          </Button>

        </div>

      </div>

    </form>
  );
}