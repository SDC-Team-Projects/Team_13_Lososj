

import { apiFetch } from "./apiClient";

const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET USERS ---------------- */
export async function getUsers() {
  const res = await apiFetch(`${API_URL}/admin/users`);

  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }

  return res.json();
}



/* ---------------- BAN USER ---------------- */
export async function banUser(id, token) {
  const res = await fetch(`${API_URL}/admin/users/${id}/ban`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to ban user");
  }

  return res.json();
}

/* ---------------- UNBAN USER ---------------- */
export async function unbanUser(id, token) {
  const res = await fetch(`${API_URL}/admin/users/${id}/unban`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to unban user");
  }

  return res.json();
}

/* ---------------- GET ALL COLLECTIONS ---------------- */
export async function getAdminCollections() {
  const res = await apiFetch(`${API_URL}/admin/collections`);

  if (!res.ok) {
    throw new Error("Failed to fetch collections");
  }

  return res.json();
}

/* ---------------- GET ALL ITEMS ---------------- */
export async function getAdminItems() {
  const res = await apiFetch(`${API_URL}/admin/items`);

  if (!res.ok) {
    throw new Error("Failed to fetch items");
  }

  return res.json();
}