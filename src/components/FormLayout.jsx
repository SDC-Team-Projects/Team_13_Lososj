import { Outlet } from "react-router-dom";

export default function FormLayout() {
  return (
    <main className="appContent">
      <Outlet />
    </main>
  );
}