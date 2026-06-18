import { apiFetch } from "./apiClient";

const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- NOTIFICATIONS ---------------- */
export async function getNotifications() {
  const res = await apiFetch(`${API_URL}/notifications`);

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}