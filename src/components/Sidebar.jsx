

// import "../css/Sidebar.css";

// import { Link, useNavigate } from "react-router-dom";

// import { logoutUser } from "../api/auth";

// import { useState } from "react";

// export default function Sidebar() {

//   const navigate = useNavigate();

//   const [settingsOpen, setSettingsOpen] = useState(false);

//   const handleLogout = async () => {
//     try {

//       await logoutUser();

//       localStorage.removeItem("token");

//       navigate("/login");

//     } catch (err) {

//       console.error(err);

//     }
//   };

//   return (
//     <aside className="sidebar">

//       <div className="sidebar__header">
//         Collector App
//       </div>

//       <nav className="sidebar__nav">

//         <Link to="/home">Home</Link>

//         <Link to="/overview">Overview</Link>

//         <Link to="/collections">My Collections</Link>

//         <Link to="/favorites">Favourites</Link>

//         <Link to="/profile">Profile</Link>

//         {/* SETTINGS */}

//         <div
//           className="sidebarSettings"
//           onMouseEnter={() => setSettingsOpen(true)}
//           onMouseLeave={() => setSettingsOpen(false)}
//         >

//           <button className="sidebarSettingsButton">
//             Settings
//           </button>

//           {settingsOpen && (
//             <div className="sidebarDropdown">

//               <Link to="/settings/password">
//                 Change Password
//               </Link>

//               <button onClick={handleLogout}>
//                 Log Out
//               </button>

//             </div>
//           )}

//         </div>

//       </nav>

//     </aside>
//   );
// }




import "../css/Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Sidebar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      {/* ===== MOBILE BUTTON ===== */}
      <button className="mobileMenuBtn" onClick={() => setOpen(true)}>
        <Menu />
      </button>

      {/* ===== OVERLAY ===== */}
      {open && (
        <div className="sidebarOverlay" onClick={() => setOpen(false)} />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside className={`sidebar ${open ? "open" : ""}`}>

        {/* close button (mobile) */}
        <button className="closeBtn" onClick={() => setOpen(false)}>
          <X />
        </button>

        <div className="sidebar__header">
          Collector App
        </div>

        <nav className="sidebar__nav">

          <Link onClick={() => setOpen(false)} to="/home">Home</Link>
          <Link onClick={() => setOpen(false)} to="/overview">Overview</Link>
          <Link onClick={() => setOpen(false)} to="/collections">My Collections</Link>
          <Link onClick={() => setOpen(false)} to="/favorites">Favourites</Link>
          <Link onClick={() => setOpen(false)} to="/profile">Profile</Link>

          {/* SETTINGS */}
          <div
            className="sidebarSettings"
            onMouseEnter={() => setSettingsOpen(true)}
            onMouseLeave={() => setSettingsOpen(false)}
          >
            <button className="sidebarSettingsButton">
              Settings
            </button>

            {settingsOpen && (
              <div className="sidebarDropdown">
                <Link to="/settings/password" onClick={() => setOpen(false)}>
                  Change Password
                </Link>

                <button onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>

        </nav>
      </aside>
    </>
  );
}