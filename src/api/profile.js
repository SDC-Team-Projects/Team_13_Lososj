const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET PROFILE ---------------- */

export async function getProfile() {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/profile`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
}

/* ---------------- UPDATE PROFILE ---------------- */

export async function updateProfile(profileData) {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/profile`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(profileData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}