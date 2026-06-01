import "../css/Sidebar.css";

import { NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import { useState } from "react";
import {
  Menu,
  X,
  House,
  LayoutDashboard,
  FolderOpen,
  Heart,
  User,
  Settings,
  Shield,
  LogOut,
  KeyRound,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
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
            <NavLink to="/admin" onClick={closeSidebar}>
                  <Shield size={18} />
                <span>Admin Panel</span>
            </NavLink>
          )}

          <NavLink to="/home" onClick={closeSidebar}> <House size={18} /> Home</NavLink>
          <NavLink to="/overview" onClick={closeSidebar}>  <LayoutDashboard size={18} /> Overview</NavLink>
          <NavLink to="/collections" onClick={closeSidebar}> <FolderOpen size={18} /> My Collections</NavLink>
          <NavLink to="/favorites" onClick={closeSidebar}>  <Heart size={18} /> Favourites</NavLink>
          <NavLink to="/profile" onClick={closeSidebar}> <User size={18} /> Profile</NavLink>

          {/* SETTINGS */}
          <div
            className="sidebarSettings"
            onMouseEnter={() => setSettingsOpen(true)}
            onMouseLeave={() => setSettingsOpen(false)}
          >
            <button className="sidebarSettingsButton">
              <Settings size={18} />
              Settings
            </button>

            {settingsOpen && (
              <div className="sidebarDropdown">
                <NavLink to="/settings/password" onClick={closeSidebar}>
                  <KeyRound size={16} />
                  Change Password
                </NavLink>

                <button onClick={() => setLogoutOpen(true)}>
                    <LogOut size={16} />
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