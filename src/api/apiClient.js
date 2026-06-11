// export async function apiFetch(url, options = {}) {
//   const token = sessionStorage.getItem("token");

//   const headers = {
//     ...(options.headers || {}),
//     ...(token ? { Authorization: `Bearer ${token}` } : {}),
//   };

//   return fetch(url, {
//     ...options,
//     headers,
//   });
// }


export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  };

  return fetch(url, {
    ...options,
    headers,
  });
}