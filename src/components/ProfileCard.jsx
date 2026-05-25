// import React, { useEffect, useState } from "react";
// import "../css/ProfileCard.css";
// import { Link } from "react-router-dom";

// import { useAuth } from "../context/AuthContext";
// import { isOwner } from "../utils/permissions";
// export default function ProfileCard() {
//   const { user } = useAuth();

//   if (!user) {
//     return <div className="profileCard">No user data</div>;
//   }

//   return (
//     <div className="profileCard">

//       <div className="top">
//         <div className="avatarWrapper">
//           {user.avatar_url ? (
//             <img className="avatar" src={user.avatar_url} alt="profile" />
//           ) : (
//             <div className="avatarPlaceholder">
//               <span className="userIcon">👤</span>
//             </div>
//           )}
//         </div>

//         <div className="info">

//           <div className="headerRow">
//             <h2 className="name">
//               {user.username}
//               <span className={`roleBadge ${user.role === "ADMIN" ? "admin" : "user"}`}>
//                 {user.role === "ADMIN" ? "Administrator" : "Member"}
//               </span>
//             </h2>

//             <Link to="/profile/edit">
//               <button className="editBtn">Edit profile</button>
//             </Link>
//           </div>

//           <p className="description">{user.bio}</p>

//         </div>
//       </div>

//       <div className="bottom">
//         <span>
//           Joined on {new Date(user.created_at).toLocaleDateString()}
//         </span>

//         <span>{user.email}</span>

//         <span>{user.city}, {user.country}</span>
//       </div>

//     </div>
//   );
// }


import "../css/ProfileCard.css";
import { Link } from "react-router-dom";

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
              className="avatar"
              src={user.avatar_url}
              alt="profile"
            />
          ) : (
            <div className="avatarPlaceholder">
              <span className="userIcon">👤</span>
            </div>
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