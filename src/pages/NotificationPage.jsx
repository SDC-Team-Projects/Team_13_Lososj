import { useEffect, useState } from "react";
import NotificationItem from "../components/NotificationItem";
import { getNotifications } from "../api/notification"; // или где у тебя файл

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error("Notifications error:", err);
      setNotifications([]); // важно
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="notificationsPage">
      <h1>Notifications</h1>

      {notifications.length === 0 ? (
        <div className="emptyState">No notifications yet</div>
      ) : (
        <div className="notificationsList">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}