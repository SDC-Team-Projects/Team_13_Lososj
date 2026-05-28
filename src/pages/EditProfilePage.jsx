


import styles from "../css/CollectionForm.module.css";
import { CloudUpload } from "lucide-react";
import Input from "../ui/Input";
import Button from "../ui/Button";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function EditProfileForm() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    if (!user) return;

    setUsername(user.username || "");
    setEmail(user.email || "");
    setCity(user.city || "");
    setCountry(user.country || "");
    setBio(user.bio || "");
    setAvatar(user.avatar_url || "");
  }, [user]);

  // IMAGE UPLOAD
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
      setAvatar(data.secure_url);
    } catch (err) {
      console.error(err);
    }
  };

  // SUBMIT PROFILE UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await apiFetch(
        "https://team-13-lososj.onrender.com/api/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            city,
            country,
            bio,
            avatar_url: avatar,
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      navigate("/profile");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form className={styles.collectionForm} onSubmit={handleSubmit}>
      {/* LEFT */}
      <div className={styles.left}>
        <div className={styles.mainText}>
          <h1>Edit Profile</h1>
          <p>Update your profile information</p>
        </div>

        <label className={styles.uploadBox}>
          <input
            type="file"
            onChange={handleImageChange}
            className={styles.uploadInput}
            accept="image/*"
          />

          {avatar ? (
            <img
              src={avatar}
              alt="preview"
              className={styles.previewInside}
            />
          ) : (
            <div className={styles.uploadContent}>
              <div className={styles.uploadIcon}>
                <CloudUpload />
              </div>

              <p className={styles.uploadText}>
                <span>Click to</span> upload avatar
              </p>
            </div>
          )}
        </label>
      </div>

      {/* RIGHT */}
      <div className={styles.right}>
        <label htmlFor="username" className={styles.labelRequired}>
            Username
              </label>

<Input
  id="username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

        <label className={styles.labelRequired}>Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>City</label>
        <Input value={city} onChange={(e) => setCity(e.target.value)} />

        <label>Country</label>
        <Input value={country} onChange={(e) => setCountry(e.target.value)} />

        <label>Bio</label>
        <Input value={bio} onChange={(e) => setBio(e.target.value)} />

        <div className={styles.buttons}>
          <Button type="button" onClick={() => navigate(-1)}>
            Cancel
          </Button>

          <Button type="submit" className={styles.primary}>
            Save Changes
          </Button>
        </div>
      </div>
    </form>
  );
}