import "../css/Sidebar.css";
import { Link, useNavigate } from "react-router-dom";
import { logoutUser } from "../api/auth";
import Button from "../ui/Button";

export default function Sidebar() {

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login");
    } catch (err) {
      console.error(err);
    }
  };


  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        Collector App
      </div>

      <nav className="sidebar__nav">
        <Link to="/home">Home</Link>
        <Link to="/overview">Overview</Link>
        <Link to="/collections">My Collections</Link>
        <Link to="/favorites">Favourites</Link>
        <Link to="/profile">Profile</Link>
        <Link onClick={handleLogout} className="logout-btn">Log Out</Link>
      </nav>
    </aside>
  );
}