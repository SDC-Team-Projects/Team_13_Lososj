import { apiFetch } from "./apiClient";

const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- SAFE JSON HELPER ---------------- */
async function safeJson(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ---------------- COLLECTIONS ---------------- */
export async function getCollections() {
  const res = await apiFetch(`${API_URL}/collections`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- CREATE COLLECTION ---------------- */
export async function createCollection(data) {
  const res = await apiFetch(`${API_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- DELETE COLLECTION ---------------- */
export async function deleteCollection(id) {
  const res = await apiFetch(`${API_URL}/collections/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- GET USER ANALYTICS ---------------- */
export async function getUserAnalytics() {
  const res = await apiFetch(`${API_URL}/analytics/user`);

  if (!res.ok) {
    const err = await safeJson(res);
    console.error("Analytics error:", err);
    throw new Error(err.error || "Failed to fetch analytics");
  }

  return res.json();
}

/* ---------------- COLLECTION BY ID ---------------- */
export async function getCollectionById(id) {
  const res = await apiFetch(`${API_URL}/collections/${id}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- UPDATE COLLECTION ---------------- */
export async function updateCollection(id, data) {
  const res = await apiFetch(`${API_URL}/collections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- COLLECTION ANALYTICS ---------------- */
export async function getCollectionAnalytics(id) {
  const res = await apiFetch(`${API_URL}/analytics/collection/${id}`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- PUBLIC COLLECTIONS ---------------- */
export async function getPublicCollections() {
  const res = await apiFetch(`${API_URL}/collections/public`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- FAVORITES ---------------- */
export async function getFavoriteCollections() {
  const res = await apiFetch(`${API_URL}/favorites/collections`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function addFavoriteCollection(id) {
  const res = await apiFetch(`${API_URL}/favorites/collections/${id}`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

export async function removeFavoriteCollection(id) {
  const res = await apiFetch(`${API_URL}/favorites/collections/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- SEARCH ---------------- */
export async function searchCollections(params = {}) {
  const query = new URLSearchParams();

  if (params.q) query.append("q", params.q);
  if (params.category) query.append("category", params.category);
  if (params.min_value) query.append("min_value", params.min_value);
  if (params.max_value) query.append("max_value", params.max_value);
  if (params.sort) query.append("sort", params.sort);

  const res = await apiFetch(
    `${API_URL}/collections/search?${query.toString()}`
  );

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.json();
}

/* ---------------- PDF DOWNLOAD ---------------- */
export async function downloadCollectionPdf(id) {
  const res = await apiFetch(`${API_URL}/collections/${id}/export`);

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return res.blob();
}

/* ---------------- COST CHART ---------------- */
export async function getCostChart() {
  const res = await apiFetch(`${API_URL}/analytics/user`);

  if (!res.ok) {
    const err = await safeJson(res);
    console.error("Chart error:", err);
    return [];
  }

  const data = await res.json();

  return data.chart_data || [];
}