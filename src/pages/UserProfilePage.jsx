// import Sidebar from "../components/Sidebar";
// import ProfileCard from "../components/ProfileCard";
// import InfoCard from "../components/InfoCard";
// import { useParams } from "react-router-dom";
// import { useEffect, useState } from "react";
// import { getUserById } from "../api/profile";
// // import { getUserAnalyticsById } from "../api/collections";
// import "../css/ProfilePage.css";

// export default function UserProfilePage() {
//   const { id } = useParams();

//   const [user, setUser] = useState(null);
// //   const [analytics, setAnalytics] = useState({
// //     items_count: 0,
// //     collections_count: 0,
// //     total_value: 0,
// //   });

//   useEffect(() => {
//     loadUser();
//     // loadAnalytics();
//   }, [id]);

//   async function loadUser() {
//     try {
//       const data = await getUserById(id);
//       setUser(data);
//     } catch (err) {
//       console.error(err);
//     }
//   }

// //   async function loadAnalytics() {
// //     try {
// //       const data = await getUserAnalyticsById(id);
// //       setAnalytics(data);
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   }

//   if (!user) return null;

//   return (
//     <div className="layout">
//       <Sidebar />

//       <div className="content">
//         <ProfileCard user={user} />

//         {/* <div className="infoRow">
//           <InfoCard title="Items" count={analytics.items_count} />
//           <InfoCard title="Collections" count={analytics.collections_count} />
//           <InfoCard title="Total value" count={analytics.total_value} />
//         </div> */}
//       </div>
//     </div>
//   );
// }

import Sidebar from "../components/Sidebar";
import ProfileCard from "../components/ProfileCard";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../api/profile";
import { useAuth } from "../context/AuthContext";
import "../css/ProfilePage.css";

export default function UserProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();

  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  async function loadUser() {
    try {
      const data = await getUserById(id);
      setUser(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (!user) return <div>Loading...</div>;

  const isMe = currentUser?.id === user?.id;

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <ProfileCard user={user} isMe={isMe} />
      </div>
    </div>
  );
}