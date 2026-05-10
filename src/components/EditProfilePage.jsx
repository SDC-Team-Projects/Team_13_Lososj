import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Button from "../ui/Button";

import {
  getProfile,
  updateProfile,
} from "../api/profile";

import "../css/EditProfilePage.css";

export default function EditProfilePage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    city: "",
    country: "",
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {

    try {

      const data = await getProfile();

      setFormData({
        username: data.username || "",
        city: data.city || "",
        country: data.country || "",
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {

    e.preventDefault();

    try {

      await updateProfile(formData);

      navigate("/profile");

    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  }

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <div className="editProfileCard">

          <h1>Edit Profile</h1>

          <form onSubmit={handleSubmit}>

            <div className="formGroup">

              <label>Username</label>

              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />

            </div>

            <div className="formGroup">

              <label>City</label>

              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />

            </div>

            <div className="formGroup">

              <label>Country</label>

              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />

            </div>

            <Link to="/profile"><Button variant="primary">
              Save Changes
            </Button></Link>

          </form>

        </div>

      </div>

    </div>
  );
}