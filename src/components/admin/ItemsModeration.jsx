import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getAdminItems } from "../../api/admin";
import Modal from "../../components/Modal";
import styles from "../../css/AdminPage.module.css";

const API_URL = "https://team-13-lososj.onrender.com/api";

export default function ItemsModeration() {
  const { token } = useAuth();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

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

  /* ---------------- MODAL ---------------- */

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await fetch(
        `${API_URL}/admin/items/${selectedItem.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchItems();
      closeDeleteModal();
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
                  onClick={() => openDeleteModal(item)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={deleteModalOpen}
        onClose={closeDeleteModal}
        title="Delete item?"
      >
        <p>
          Are you sure you want to delete{" "}
          <strong>{selectedItem?.name}</strong>?
        </p>

        <div className="logoutActions">
          <button
            className="cancelBtn"
            onClick={closeDeleteModal}
          >
            Cancel
          </button>

          <button
            className="logoutBtn"
            onClick={confirmDelete}
          >
            Delete Item
          </button>
        </div>
      </Modal>
    </div>
  );
}