import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getAdminCollections,
} from "../../api/admin";

const API_URL = "https://team-13-lososj.onrender.com/api";

export default function CollectionsModeration() {
  const { token } = useAuth();

  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */
  const fetchCollections = async () => {
    try {
      setLoading(true);
      const data = await getAdminCollections(token);
      setCollections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchCollections();
  }, [token]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this collection?"
    );

    if (!confirm) return;

    try {
      await fetch(`${API_URL}/admin/collections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchCollections();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading collections...</p>;

  return (
    <div>
      <h2>Collections Moderation</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Collection</th>
            <th>Owner</th>
            <th>Items</th>
            <th>Total Value</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {collections.map((c) => (
            <tr key={c.id}>
              <td>{c.name}</td>
              <td>{c.owner_name}</td>
              <td>{c.items_count}</td>
              <td>{c.total_value}</td>

              <td>
                <button onClick={() => handleDelete(c.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}