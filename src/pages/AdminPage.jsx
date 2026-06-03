

// import UsersManagement from "../components/admin/UsersManagement";
// import CollectionsModeration from "../components/admin/CollectionsModeration";
// import ItemsModeration from "../components/admin/ItemsModeration";

// export default function AdminPage() {
//   return (
//     <div style={{ padding: 20 }}>
//       <h1>Admin Dashboard</h1>

//       <UsersManagement />

//       <hr />

//       <CollectionsModeration />

//       <hr />

//       <ItemsModeration />
//     </div>
//   );
// }



import { useState } from "react";

import UsersManagement from "../components/admin/UsersManagement";
import CollectionsModeration from "../components/admin/CollectionsModeration";
import ItemsModeration from "../components/admin/ItemsModeration";

import styles from "../css/AdminPage.module.css";

export default function AdminPage() {
  const [tab, setTab] = useState("users");

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Admin Dashboard</h1>

      <div className={styles.container}>
        {/* SIDEBAR / TABS */}
        <div className={styles.sidebar}>
          <button
            className={tab === "users" ? styles.active : ""}
            onClick={() => setTab("users")}
          >
            Users
          </button>

          <button
            className={tab === "collections" ? styles.active : ""}
            onClick={() => setTab("collections")}
          >
            Collections
          </button>

          <button
            className={tab === "items" ? styles.active : ""}
            onClick={() => setTab("items")}
          >
            Items
          </button>
        </div>

        {/* CONTENT */}
        <div className={styles.content}>
          {tab === "users" && <UsersManagement />}
          {tab === "collections" && <CollectionsModeration />}
          {tab === "items" && <ItemsModeration />}
        </div>
      </div>
    </div>
  );
}