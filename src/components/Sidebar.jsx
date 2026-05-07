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
        <a href="/projects">Overview</a>
        <a href="/settings">My Collections</a>
        <a href="/settings">Favourites</a>
        <Link to="/profile">Profile</Link>
        <a href="/settings">Log Out</a>
      </nav>
    </aside>
  );
}