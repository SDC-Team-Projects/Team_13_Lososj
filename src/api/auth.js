// const API_URL = "https://team-13-lososj.onrender.com/api";

// /* ---------------- LOGOUT ---------------- */
// export async function logoutUser() {
//   const token = localStorage.getItem("token");

//   const res = await fetch(`${API_URL}/auth/logout`, {
//     method: "POST",
//     headers: token
//       ? {
//           Authorization: `Bearer ${token}`,
//         }
//       : {},
//   });

//   if (!res.ok) {
//     throw new Error("Logout failed");
//   }
//   localStorage.removeItem("token");

//   return res.json();
// }




// import { apiFetch } from "./apiClient";

// const API_URL = "https://team-13-lososj.onrender.com/api";

// /* ---------------- LOGOUT ---------------- */
// export async function logoutUser() {
//   const res = await apiFetch(
//     `${API_URL}/auth/logout`,
//     {
//       method: "POST",
//     }
//   );

//   if (!res.ok) {
//     throw new Error("Logout failed");
//   }

//   localStorage.removeItem("token");

//   return res.json();
// }


import { apiFetch } from "./apiClient";

const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- LOGOUT ---------------- */
export async function logoutUser() {
  const res = await apiFetch(`${API_URL}/auth/logout`, {
    method: "POST",
  });

  if (!res.ok) {
    throw new Error("Logout failed");
  }

  // чистим sessionStorage (единственный источник правды)
  sessionStorage.removeItem("token");

  return res.json();
}