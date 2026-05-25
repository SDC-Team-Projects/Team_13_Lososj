// import { apiFetch } from "./apiClient";

// const API_URL = "https://team-13-lososj.onrender.com/api";

// /* ---------------- GET PROFILE ---------------- */

// export async function getProfile() {


//   const response = await apiFetch(
//     `${API_URL}/profile`,
//     {
//       method: "GET",

//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch profile");
//   }

//   return response.json();
// }

// /* ---------------- UPDATE PROFILE ---------------- */

// export async function updateProfile(profileData) {

//   const response = await apiFetch(
//     `${API_URL}/profile`,
//     {
//       method: "PUT",

//       headers: {
//         "Content-Type": "application/json",

//         Authorization: `Bearer ${token}`,
//       },

//       body: JSON.stringify(profileData),
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to update profile");
//   }

//   return response.json();
// }


// /* ---------------- CHANGE PASSWORD ---------------- */

// export async function changePassword(passwordData) {

//   const response = await apiFetch(
//     `${API_URL}/profile/password`,
//     {
//       method: "PUT",

//       headers: {
//         "Content-Type": "application/json",

//         Authorization: `Bearer ${token}`,
//       },

//       body: JSON.stringify(passwordData),
//     }
//   );

//   const data = await response.json();

//   if (!response.ok) {
//     throw new Error(data.error || "Failed to change password");
//   }

//   return data;
// }



import { apiFetch } from "./apiClient";

const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET PROFILE ---------------- */
export async function getProfile() {
  const response = await apiFetch(`${API_URL}/profile`);

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
}

/* ---------------- UPDATE PROFILE ---------------- */
export async function updateProfile(profileData) {
  const response = await apiFetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to update profile");
  }

  return response.json();
}

/* ---------------- CHANGE PASSWORD ---------------- */
export async function changePassword(passwordData) {
  const response = await apiFetch(`${API_URL}/profile/password`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(passwordData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to change password");
  }

  return data;
}

/* ---------------- GET USER BY ID ---------------- */
export async function getUserById(id) {
  const response = await apiFetch(`${API_URL}/users/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}