import "../css/ProfileCard.css";
import { Link } from "react-router-dom";
import { User } from "lucide-react";

export default function ProfileCard({ user, isMe }) {
  if (!user) {
    return <div className="profileCard">No user data</div>;
  }

  return (
    <div className="profileCard">

      <div className="top">
      <div className="avatarWrapper">
  {user.avatar_url ? (
    <img
      src={user.avatar_url}
      alt="owner"
      className="avatar"
    />
  ) : (
    <User size={42} />
  )}
</div>

        <div className="info">

          <div className="headerRow">

            <h2 className="name">
              {user.username}

              <span className={`roleBadge ${user.role === "ADMIN" ? "admin" : "user"}`}>
                {user.role === "ADMIN" ? "Administrator" : "Member"}
              </span>
            </h2>

            {/* EDIT BUTTON ТОЛЬКО ДЛЯ СЕБЯ */}
            {isMe && (
              <Link to="/profile/edit">
                <button className="editBtn">Edit profile</button>
              </Link>
            )}

          </div>

          <p className="description">
            {user.bio || "No description"}
          </p>

        </div>
      </div>

      <div className="bottom">

        <span>
          Joined on{" "}
          {user.created_at
            ? new Date(user.created_at).toLocaleDateString()
            : "Unknown"}
        </span>

        <span>{user.email}</span>

        <span>{user.city}, {user.country}</span>

      </div>

    </div>
  );
}