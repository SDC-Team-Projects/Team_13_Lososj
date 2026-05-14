import "../css/Sidebar.css";
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        Collector App
      </div>

      <nav className="sidebar__nav">
        <Link to="/home">Home</Link>
        <Link to="/overview">Overview</Link>
        <Link to="/collections">My Collections</Link>
        <a href="/settings">Favourites</a>
        <Link to="/profile">Profile</Link>
        <Link to="/collections/:id">Log Out</Link>
      </nav>
    </aside>
  );
}