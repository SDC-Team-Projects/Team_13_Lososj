// export default function AdminPage() {
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Admin Panel</h1>
//       <p>Only ADMIN can see this page</p>
//     </div>
//   );
// }

import UsersManagement from "../components/admin/UsersManagement";
import CollectionsModeration from "../components/admin/CollectionsModeration";
import ItemsModeration from "../components/admin/ItemsModeration";

export default function AdminPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Dashboard</h1>

      <UsersManagement />

      <hr />

      <CollectionsModeration />

      <hr />

      <ItemsModeration />
    </div>
  );
}