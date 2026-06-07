import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminItems } from "../../api/admin";
import styles from "../../css/AdminPage.module.css";


const API_URL = "https://team-13-lososj.onrender.com/api";

export default function ItemsModeration() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */
  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await getAdminItems(token);
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchItems();
  }, [token]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    const confirm = window.confirm(
      "Delete this item?"
    );

    if (!confirm) return;

    try {
      await fetch(`${API_URL}/admin/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <p>Loading items...</p>;

  return (
    <div>
      <h2>Items Moderation</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Item</th>
            <th>Collection</th>
            <th>Owner</th>
            <th>Value</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.collection_name}</td>
              <td>{item.owner_name}</td>
              <td>{item.estimated_value}</td>

              <td>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={() => handleDelete(item.id)}
                        >
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