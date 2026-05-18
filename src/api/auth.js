const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- LOGOUT ---------------- */
export async function logoutUser() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  // важно: logout ВСЕГДА чистит фронт
  localStorage.removeItem("token");

  return res.json();
}