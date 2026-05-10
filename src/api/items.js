const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET ITEMS BY COLLECTION ---------------- */

export async function getItemsByCollection(collectionId) {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/collections/${collectionId}/items`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch items");
  }

  return response.json();
}

/* ---------------- CREATE ITEM ---------------- */

export async function createItem(itemData) {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/items`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(itemData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to create item");
  }

  return response.json();
}

/* ---------------- GET ITEM BY ID ---------------- */

export async function getItemById(id) {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/items/${id}`,
    {
      method: "GET",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch item");
  }

  return response.json();
}

/* ---------------- DELETE ITEM ---------------- */

export async function deleteItem(id) {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/items/${id}`,
    {
      method: "DELETE",

      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete item");
  }

  return response.json();
}

/* ---------------- UPDATE ITEM ---------------- */

export async function updateItem(id, itemData) {

  const token = localStorage.getItem("token");

  const response = await fetch(
    `${API_URL}/items/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",

        Authorization: `Bearer ${token}`,
      },

      body: JSON.stringify(itemData),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update item");
  }

  return response.json();
}