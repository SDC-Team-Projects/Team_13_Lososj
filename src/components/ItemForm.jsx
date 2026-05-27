import styles from "../css/CollectionForm.module.css";

import { CloudUpload } from "lucide-react";

import Input from "../ui/Input";
import Button from "../ui/Button";
import Select from "../ui/Select";

import { useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import { createItem } from "../api/items";

export default function ItemForm() {

  const navigate = useNavigate();

  const { id } = useParams();

  const [name, setName] = useState("");

  const [description, setDescription] =
    useState("");

  const [notes, setNotes] = useState("");

  const [condition, setCondition] =
    useState("");

  const [price, setPrice] = useState("");

  const [image, setImage] = useState("");

  const conditions = [
    {
      value: "new",
      label: "New",
    },
    {
      value: "excellent",
      label: "Excellent",
    },
    {
      value: "good",
      label: "Good",
    },
    {
      value: "used",
      label: "Used",
    },
  ];

  const handleImageChange = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    formData.append(
      "upload_preset",
      "collections_upload"
    );

    try {

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/ddtujezze/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!data.secure_url) {
        console.error(data);
        return;
      }

      setImage(data.secure_url);

    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createItem({
        collection_id: id,
        name,
        description,
        notes,
        condition,
        estimated_value: Number(price),
        image,

        custom_fields: {
          // image,
        },
      });

      navigate(`/collections/${id}`);

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
          <h1>Add New Item</h1>

          <p>
            Fill in the details below to add
            a new item
          </p>
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
                <span>Click to</span>
                upload image
              </p>

            </div>
          )}

        </label>

      </div>

      {/* RIGHT */}

      <div className={styles.right}>

        <div className={styles.input}>

          <label className={styles.labelRequired}>
            Item Name
          </label>

          <Input
            placeholder="e.g. Harry Potter Book"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />

        </div>

        <label className={styles.labelRequired}>
          Condition
        </label>

        <Select
          placeholder="Select condition"
          options={conditions}
          value={condition}
          onChange={(e) =>
            setCondition(e.target.value)
          }
        />

        <label className={styles.labelRequired}>
          Description
        </label>

        <Input
          placeholder="Describe item..."
          value={description}
          onChange={(e) =>
            setDescription(e.target.value)
          }
        />

        <label className={styles.labelRequired}>
          Notes
        </label>

        <Input
          placeholder="Additional notes..."
          value={notes}
          onChange={(e) =>
            setNotes(e.target.value)
          }
        />

        <label className={styles.labelRequired}>
          Estimated Price
        </label>

        <Input
          type="number"
          placeholder="100"
          value={price}
          onChange={(e) =>
            setPrice(e.target.value)
          }
        />

        <div className={styles.buttons}>

          <Button
            type="button"
            className={`${styles.button} ${styles.primary}`}
            onClick={() =>
              navigate(`/collections/${id}`)
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={!image}
            className={`${styles.button} ${styles.primary}`}
          >
            Add Item
          </Button>

        </div>

      </div>

    </form>
  );
}
