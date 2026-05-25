// import { apiFetch } from "./apiClient";

// const API_URL = "https://team-13-lososj.onrender.com/api";

// /* ---------------- GET COLLECTIONS ---------------- */

// export async function getCollections() {

//   const response = await apiFetch(`${API_URL}/collections`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch collections");
//   }

//   return response.json();
// }

// /* ---------------- CREATE COLLECTION ---------------- */

// export async function createCollection(collectionData) {

//   const response = await apiFetch(`${API_URL}/collections`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(collectionData),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to create collection");
//   }

//   return response.json();
// }

// /* ---------------- DELETE COLLECTION ---------------- */

// export async function deleteCollection(id) {

//   const response = await apiFetch(`${API_URL}/collections/${id}`, {
//     method: "DELETE",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to delete collection");
//   }

//   return response.json();
// }


// /* ---------------- USER ANALYTICS ---------------- */

// export async function getUserAnalytics() {

//   const response = await apiFetch(`${API_URL}/analytics/user`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch analytics");
//   }

//   return response.json();
// }


// /* ---------------- GET COLLECTION BY ID ---------------- */

// export async function getCollectionById(id) {

//   const response = await apiFetch(`${API_URL}/collections/${id}`, {
//     method: "GET",
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("Failed to fetch collection");
//   }

//   return response.json();
// }


// /* ---------------- UPDATE COLLECTION ---------------- */

// export async function updateCollection(id, collectionData) {


//   const response = await apiFetch(`${API_URL}/collections/${id}`, {
//     method: "PUT",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`,
//     },
//     body: JSON.stringify(collectionData),
//   });

//   if (!response.ok) {
//     throw new Error("Failed to update collection");
//   }

//   return response.json();
// }


// /* ---------------- COLLECTION ANALYTICS ---------------- */

// export async function getCollectionAnalytics(id) {

//   const response = await apiFetch(
//     `${API_URL}/analytics/collection/${id}`,
//     {
//       method: "GET",
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch collection analytics");
//   }

//   return response.json();
// }



// /* ---------------- GET PUBLIC COLLECTIONS ---------------- */

// export async function getPublicCollections() {

//   const headers = {
//     "Content-Type": "application/json",
//   };

//   // ✅ теперь public feed тоже с auth
//   if (token) {
//     headers.Authorization = `Bearer ${token}`;
//   }

//   const response = await apiFetch(
//     `${API_URL}/collections/public`,
//     {
//       method: "GET",
//       headers,
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch public collections");
//   }

//   return response.json();
// }

// /* ---------------- FAVORITES ---------------- */

// export async function getFavoriteCollections() {

//   const res = await apiFetch(`${API_URL}/favorites/collections`, {

//   });

//   if (!res.ok) {
//     throw new Error("Failed to load favorites");
//   }

//   return res.json();
// } 

// export async function removeFavoriteCollection(id) {

//   const res = await apiFetch(
//     `${API_URL}/favorites/collections/${id}`,
//     {
//       method: "DELETE",
//     }
//   );

//   if (!res.ok) {
//     throw new Error("Failed to remove favorite");
//   }

//   return res.json();
// }


// export async function addFavoriteCollection(id) {

//   const res = await apiFetch(
//     `${API_URL}/favorites/collections/${id}`,
//     {
//       method: "POST",
//     }
//   );

//   if (!res.ok) {
//     throw new Error("Failed to add favorite");
//   }

//   return res.json();
// }


// export const searchCollections = async (params = {}) => {
//   const query = new URLSearchParams();

//   if (params.q) {
//     query.append("q", params.q);
//   }

//   if (params.category) {
//     query.append("category", params.category);
//   }

//   if (params.min_value) {
//     query.append("min_value", params.min_value);
//   }

//   if (params.max_value) {
//     query.append("max_value", params.max_value);
//   }

//   if (params.sort) {
//     query.append("sort", params.sort);
//   }

//   const response = await apiFetch(
//     `${API_URL}/collections/search?${query.toString()}`
//   );

//   if (!response.ok) {
//     throw new Error("Failed to fetch collections");
//   }

//   return response.json();
// };

// export const downloadCollectionPdf = async (id) => {

//   const response = await apiFetch(
//     `${API_URL}/collections/${id}/export`,
//     {
//       headers: {
//         Authorization: `Bearer ${token}`
//       }
//     }
//   );

//   if (!response.ok) {
//     throw new Error("Failed to download PDF");
//   }

//   return response.blob();

// };



import { apiFetch } from "./apiClient";

const API_URL = "https://team-13-lososj.onrender.com/api";

/* ---------------- GET COLLECTIONS ---------------- */
export async function getCollections() {
  const response = await apiFetch(`${API_URL}/collections`);

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return response.json();
}

/* ---------------- CREATE COLLECTION ---------------- */
export async function createCollection(collectionData) {
  const response = await apiFetch(`${API_URL}/collections`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
  const response = await apiFetch(`${API_URL}/collections/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete collection");
  }

  return response.json();
}

/* ---------------- USER ANALYTICS ---------------- */
export async function getUserAnalytics() {
  const response = await apiFetch(`${API_URL}/analytics/user`);

  if (!response.ok) {
    throw new Error("Failed to fetch analytics");
  }

  return response.json();
}

/* ---------------- GET COLLECTION BY ID ---------------- */
export async function getCollectionById(id) {
  const response = await apiFetch(`${API_URL}/collections/${id}`);

  if (!response.ok) {
    throw new Error("Failed to fetch collection");
  }

  return response.json();
}

/* ---------------- UPDATE COLLECTION ---------------- */
export async function updateCollection(id, collectionData) {
  const response = await apiFetch(`${API_URL}/collections/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(collectionData),
  });

  if (!response.ok) {
    throw new Error("Failed to update collection");
  }

  return response.json();
}

/* ---------------- COLLECTION ANALYTICS ---------------- */
export async function getCollectionAnalytics(id) {
  const response = await apiFetch(
    `${API_URL}/analytics/collection/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collection analytics");
  }

  return response.json();
}

/* ---------------- GET PUBLIC COLLECTIONS ---------------- */
export async function getPublicCollections() {
  const response = await apiFetch(`${API_URL}/collections/public`);

  if (!response.ok) {
    throw new Error("Failed to fetch public collections");
  }

  return response.json();
}

/* ---------------- FAVORITES ---------------- */
export async function getFavoriteCollections() {
  const res = await apiFetch(`${API_URL}/favorites/collections`);

  if (!res.ok) {
    throw new Error("Failed to load favorites");
  }

  return res.json();
}

export async function removeFavoriteCollection(id) {
  const res = await apiFetch(
    `${API_URL}/favorites/collections/${id}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to remove favorite");
  }

  return res.json();
}

export async function addFavoriteCollection(id) {
  const res = await apiFetch(
    `${API_URL}/favorites/collections/${id}`,
    {
      method: "POST",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to add favorite");
  }

  return res.json();
}

/* ---------------- SEARCH COLLECTIONS ---------------- */
export const searchCollections = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.q) query.append("q", params.q);
  if (params.category) query.append("category", params.category);
  if (params.min_value) query.append("min_value", params.min_value);
  if (params.max_value) query.append("max_value", params.max_value);
  if (params.sort) query.append("sort", params.sort);

  const response = await apiFetch(
    `${API_URL}/collections/search?${query.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }

  return response.json();
};

/* ---------------- DOWNLOAD PDF ---------------- */
export const downloadCollectionPdf = async (id) => {
  const response = await apiFetch(
    `${API_URL}/collections/${id}/export`
  );

  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  return response.blob();
};