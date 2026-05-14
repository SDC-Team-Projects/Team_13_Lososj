import styles from "../css/CollectionForm.module.css";
import { CloudUpload } from "lucide-react";
import Select from "../ui/Select";
import Input from "../ui/Input";
import Button from "../ui/Button";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getCollectionById,
  updateCollection,
} from "../api/collections";

export default function EditCollectionForm() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    loadCollection();
  }, []);

  async function loadCollection() {
    try {
      const data = await getCollectionById(id);

      setName(data.name || "");
      setDescription(data.description || "");
      setCategory(data.category || "");
      setImage(data.image || "");

    } catch (err) {
      console.error(err);
    }
  }

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

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "collections_upload");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/ddtujezze/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      setImage(data.secure_url);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      await updateCollection(id, {
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
    <form
      className={styles.collectionForm}
      onSubmit={handleSubmit}
    >

      {/* LEFT */}
      <div className={styles.left}>

        <div className={styles.mainText}>
          <h1>Edit Collection</h1>
          <p>Update your collection information</p>
        </div>

        <label className={styles.uploadBox}>

          <input
            type="file"
            onChange={handleImageChange}
            className={styles.uploadInput}
            accept="image/*"
          />

          {image ? (
            <img
              src={image}
              alt="preview"
              className={styles.previewInside}
            />
          ) : (
            <div className={styles.uploadContent}>

              <div className={styles.uploadIcon}>
                <CloudUpload />
              </div>

              <p className={styles.uploadText}>
                <span>Click to</span> upload image
              </p>

            </div>
          )}

        </label>

      </div>

      {/* RIGHT */}
      <div className={styles.right}>

        <div className={styles.input}>

          <label className={styles.labelRequired}>
            Collection Name
          </label>

          <Input
            placeholder="Collection name"
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
          placeholder="Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className={styles.buttons}>

          <Button
            type="button"
            onClick={() => navigate("/collections")}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            className={styles.primary}
          >
            Save Changes
          </Button>

        </div>

      </div>

    </form>
  );
}