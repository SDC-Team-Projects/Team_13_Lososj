import "../css/Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        Collector App
      </div>

      <nav className="sidebar__nav">
        <a href="/dashboard">Home</a>
        <a href="/projects">Overview</a>
        <a href="/settings">My Collections</a>
        <a href="/settings">Favourites</a>
        <a href="/settings">Profile</a>
        <a href="/settings">Log Out</a>
      </nav>
    </aside>
  );
}