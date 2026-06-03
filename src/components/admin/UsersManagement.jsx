import { useEffect, useState } from "react";
import { getUsers, banUser, unbanUser } from "../../api/admin";
import { useAuth } from "../../context/AuthContext";
import styles from "../../css/AdminPage.module.css";


export default function UsersManagement() {
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  /* ---------------- ACTIONS ---------------- */
  const handleBan = async (id) => {
  try {
    await banUser(id, token);
    await fetchUsers();
  } catch (err) {
    console.error(err.message);
    alert(err.message);
  }
};

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
  onClick={() => handleBan(user.id)}
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
    </div>
  );
}