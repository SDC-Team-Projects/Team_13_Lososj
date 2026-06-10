import { useEffect, useState } from "react";
import { getUsers, banUser, unbanUser } from "../../api/admin";
import { useAuth } from "../../context/AuthContext";
import styles from "../../css/AdminPage.module.css";
import Modal from "../../components/Modal";

export default function UsersManagement() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [banModalOpen, setBanModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  /* ---------------- LOAD USERS ---------------- */

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  /* ---------------- MODAL ---------------- */

  const openBanModal = (user) => {
    setSelectedUser(user);
    setBanModalOpen(true);
  };

  const closeBanModal = () => {
    setBanModalOpen(false);
    setSelectedUser(null);
  };

  const confirmBan = async () => {
    if (!selectedUser) return;

    try {
      await banUser(selectedUser.id, token);
      await fetchUsers();
      closeBanModal();
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  /* ---------------- ACTIONS ---------------- */

  const handleUnban = async (id) => {
    try {
      await unbanUser(id, token);
      await fetchUsers();
    } catch (err) {
      console.error(err.message);
      alert(err.message);
    }
  };

  if (loading) return <p>Loading users...</p>;

  return (
    <div>
      <h2>Users Management</h2>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>

              <td>
                {user.status === "active" ? (
                  <button
                    className={`${styles.actionBtn} ${styles.banBtn}`}
                    onClick={() => openBanModal(user)}
                  >
                    Ban
                  </button>
                ) : (
                  <button
                    className={`${styles.actionBtn} ${styles.unbanBtn}`}
                    onClick={() => handleUnban(user.id)}
                  >
                    Unban
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={banModalOpen}
        onClose={closeBanModal}
        title="Ban user?"
      >
        <p>
          Are you sure you want to ban{" "}
          <strong>{selectedUser?.username}</strong>?
        </p>

        <div className="logoutActions">
          <button
            className="cancelBtn"
            onClick={closeBanModal}
          >
            Cancel
          </button>

          <button
            className="logoutBtn"
            onClick={confirmBan}
          >
            Ban User
          </button>
        </div>
      </Modal>
    </div>
  );
}