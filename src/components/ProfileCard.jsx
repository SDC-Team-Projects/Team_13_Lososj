// import React, { useEffect, useState } from "react";
// import "../css/ProfileCard.css";
// import { Link } from "react-router-dom";

// export default function ProfileCard() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [avatarFile, setAvatarFile] = useState(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");

//     // если токена нет — просто прекращаем загрузку
//     if (!token) {
//       setLoading(false);
//       return;
//     }

//     fetch("https://team-13-lososj.onrender.com/api/profile", {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     })
//       .then((res) => {
//         if (!res.ok) throw new Error("Failed to fetch profile");
//         return res.json();
//       })
//       .then((data) => {
//         setUser({
//   firstName: data.username,
//   lastName: "",
//   avatar: data.avatar_url,
//   description: data.bio,
//   joinDate: data.created_at,
//   email: data.email,
//   city: data.city,
//   country: data.country,
// });
//       })
//       .catch((err) => {
//         console.error(err);
//         setUser(null);
//       })
//       .finally(() => {
//         setLoading(false);
//       });
//   }, []);

//   // LOADING
//   if (loading) {
//     return <div className="profileCard">Loading...</div>;
//   }

//   // если пользователя нет
//   if (!user) {
//     return <div className="profileCard">No user data</div>;
//   }

//   const handleAvatarChange = (e) => {
//   const file = e.target.files[0];
//   if (!file) return;

//   setAvatarFile(file);

//   const reader = new FileReader();
//   reader.onload = () => {
//     setUser((prev) => ({
//       ...prev,
//       avatar: reader.result, // превью
//     }));
//   };

//   reader.readAsDataURL(file);
// };

//   return (
//     <div className="profileCard">
//       <div className="top">
//        <div className="avatarWrapper">
//   {user.avatar ? (
//     <img className="avatar" src={user.avatar} alt="profile" />
//   ) : (
//     <div className="avatarPlaceholder">
//       <span className="userIcon">👤</span>
//     </div>
//   )}

//   <label className="avatarUpload">
//     +
//     <input
//       type="file"
//       accept="image/*"
//       onChange={handleAvatarChange}
//       hidden
//     />
//   </label>
// </div>
//         <div className="info">
//           <div className="headerRow">
//             <h2 className="name">
//               {user.firstName} {user.lastName}
//             </h2>

// <Link to="/profile/edit"> 
// <button className="editBtn">Edit profile</button> 
// </Link>
//           </div>

//           <p className="description">{user.description}</p>
//         </div>
//       </div>

//       <div className="bottom">
//         <span>Joined on {new Date(user.joinDate).toLocaleDateString()}</span>
//         <span>{user.email}</span>
//         <span>
//           {user.city}, {user.country}
//         </span>
//       </div>
//     </div>
//   );
// }



import React, { useEffect, useState } from "react";
import "../css/ProfileCard.css";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { isOwner } from "../utils/permissions";

export default function ProfileCard() {

  const { user } = useAuth();

  const [profileUser, setProfileUser] = useState(null);

  const [loading, setLoading] = useState(true);

  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {

    const token = localStorage.getItem("token");

    // если токена нет — просто прекращаем загрузку
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("https://team-13-lososj.onrender.com/api/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {

        if (!res.ok) {
          throw new Error("Failed to fetch profile");
        }

        return res.json();

      })

      .then((data) => {

        setProfileUser({
          id: data.id,
          firstName: data.username,
          lastName: "",
          avatar: data.avatar_url,
          description: data.bio,
          joinDate: data.created_at,
          email: data.email,
          city: data.city,
          country: data.country,
        });

      })

      .catch((err) => {

        console.error(err);

        setProfileUser(null);

      })

      .finally(() => {
        setLoading(false);
      });

  }, []);

  // OWNER CHECK
  const owner = isOwner(
    user,
    profileUser?.id
  );

  // LOADING
  if (loading) {
    return (
      <div className="profileCard">
        Loading...
      </div>
    );
  }

  // NO USER
  if (!profileUser) {
    return (
      <div className="profileCard">
        No user data
      </div>
    );
  }

  const handleAvatarChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setAvatarFile(file);

    const reader = new FileReader();

    reader.onload = () => {

      setProfileUser((prev) => ({
        ...prev,
        avatar: reader.result,
      }));

    };

    reader.readAsDataURL(file);

  };

  return (
    <div className="profileCard">

      <div className="top">

        <div className="avatarWrapper">

          {profileUser.avatar ? (

            <img
              className="avatar"
              src={profileUser.avatar}
              alt="profile"
            />

          ) : (

            <div className="avatarPlaceholder">
              <span className="userIcon">
                👤
              </span>
            </div>

          )}

          {owner && (
            <label className="avatarUpload">

              +

              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                hidden
              />

            </label>
          )}

        </div>

        <div className="info">

          <div className="headerRow">

            <h2 className="name">
              {profileUser.firstName}{" "}
              {profileUser.lastName}
            </h2>

            {owner && (
              <Link to="/profile/edit">

                <button className="editBtn">
                  Edit profile
                </button>

              </Link>
            )}

          </div>

          <p className="description">
            {profileUser.description}
          </p>

        </div>

      </div>

      <div className="bottom">

        <span>
          Joined on{" "}
          {new Date(
            profileUser.joinDate
          ).toLocaleDateString()}
        </span>

        <span>
          {profileUser.email}
        </span>

        <span>
          {profileUser.city},{" "}
          {profileUser.country}
        </span>

      </div>

    </div>
  );
}