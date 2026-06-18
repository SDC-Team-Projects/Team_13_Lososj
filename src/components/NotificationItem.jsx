import {
  Heart,
  Plus,
  TrendingUp,
  Trash2,
  Info,
  FolderPlus,
} from "lucide-react";

import "../css/Notification.css";

const ICONS = {
  "Collection created": <FolderPlus size={18} color="green" />,
  "Collection deleted": <Trash2 size={18} color="red" />,

  "New item added": <Plus size={18} color="green" />,
  "Item updated": <TrendingUp size={18} color="gold" />,
  "Item deleted": <Trash2 size={18} color="red" />,

  "Added to favorites": <Heart size={18} color="red" />,
  "Removed from favorites": <Heart size={18} color="gray" />,

  "Password changed": <Info size={18} color="blue" />,
  "Profile updated": <Info size={18} color="blue" />,

  default: <Info size={18} />,
};

export default function NotificationItem({ notification }) {
  const { title, message, created_at } = notification;

  return (
    <div className="notificationItem">
      <div className="notificationIcon">
        {ICONS[title] || ICONS.default}
      </div>

      <div className="notificationContent">
        <div className="notificationTitle">
          {title}
        </div>

        <div className="notificationMessage">
          {message}
        </div>

        <div className="notificationDate">
          {new Date(created_at).toLocaleString()}
        </div>
      </div>
    </div>
  );
}