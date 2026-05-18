const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET FAVORITE COLLECTIONS ---------------- */
export async function getFavoriteCollections() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/favorites/collections`, {
    method: "GET",
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : {},
  });

  if (!res.ok) {
    throw new Error("Failed to load favorite collections");
  }

  return res.json();
}

/* ---------------- ADD FAVORITE ---------------- */
export async function addFavoriteCollection(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/favorites/collections/${id}`,
    {
      method: "POST",
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  if (!res.ok) {
    throw new Error("Failed to add favorite");
  }

  return res.json();
}

/* ---------------- REMOVE FAVORITE ---------------- */
export async function removeFavoriteCollection(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/favorites/collections/${id}`,
    {
      method: "DELETE",
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  if (!res.ok) {
    throw new Error("Failed to remove favorite");
  }

  return res.json();
}