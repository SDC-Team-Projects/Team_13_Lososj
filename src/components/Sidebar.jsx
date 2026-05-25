import "../css/Sidebar.css";

import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // const { user } = useAuth();
  const [logoutOpen, setLogoutOpen] = useState(false);

// const handleLogout = async () => {
//   try {

//     await logoutUser();

//     localStorage.removeItem("token");

//     navigate("/login");

//   } catch (err) {

//     console.error(err);

//   }
// };

const { user, logout } = useAuth();

const handleLogout = async () => {
  try {
    await logoutUser();
    logout();
    navigate("/login");
  } catch (err) {
    console.error(err);
  }
};

  const closeSidebar = () => setOpen(false);

  return (
    <>
      {/* TOGGLE BUTTON */}
      <button
        className="menuToggleBtn"
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? <X size={26} /> : <Menu size={26} />}
      </button>

      {/* OVERLAY */}
      {open && (
        <div className="sidebarOverlay" onClick={closeSidebar} />
      )}

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>

        <div className="sidebar__header">
          Collector App
        </div>

        <nav className="sidebar__nav">
          {user?.role === "ADMIN" && (
  <Link to="/admin" onClick={closeSidebar}>
    Admin Panel
  </Link>
)}

          <Link to="/home" onClick={closeSidebar}>Home</Link>
          <Link to="/overview" onClick={closeSidebar}>Overview</Link>
          <Link to="/collections" onClick={closeSidebar}>My Collections</Link>
          <Link to="/favorites" onClick={closeSidebar}>Favourites</Link>
          <Link to="/profile" onClick={closeSidebar}>Profile</Link>

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
                <Link to="/settings/password" onClick={closeSidebar}>
                  Change Password
                </Link>

                <button onClick={() => setLogoutOpen(true)}>
                      Log Out
                        </button>
              </div>
            )}
          </div>

        </nav>
      </aside>
      {logoutOpen && (
  <div
    className="logoutModalOverlay"
    onClick={() => setLogoutOpen(false)}
  >

    <div
      className="logoutModal"
      onClick={(e) => e.stopPropagation()}
    >

      <h3>
        Log out?
      </h3>

      <p>
        Are you sure you want to leave your account?
      </p>

      <div className="logoutActions">

        <button
          className="cancelBtn"
          onClick={() => setLogoutOpen(false)}
        >
          Cancel
        </button>

        <button
          className="logoutBtn"
          onClick={handleLogout}
        >
          Log Out
        </button>

      </div>

    </div>

  </div>
)}
    </>
  );
}