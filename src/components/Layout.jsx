import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function Layout() {
  return (
    <div className="appLayout">
      <Sidebar />
      
      <main className="appContent">
        <Outlet />
      </main>
    </div>
  );
}