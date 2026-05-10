const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET COLLECTIONS ---------------- */

export async function getCollections() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/collections`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return response.json();
}

/* ---------------- CREATE COLLECTION ---------------- */

export async function createCollection(collectionData) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(collectionData),
  });

  if (!response.ok) {
    throw new Error("Failed to create collection");
  }

  return response.json();
}

/* ---------------- DELETE COLLECTION ---------------- */

export async function deleteCollection(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete collection");
  }

  return response.json();
}


/* ---------------- USER ANALYTICS ---------------- */

export async function getUserAnalytics() {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/analytics/user`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}


/* ---------------- GET COLLECTION BY ID ---------------- */

export async function getCollectionById(id) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/collections/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch collection");
  }

  return response.json();
}