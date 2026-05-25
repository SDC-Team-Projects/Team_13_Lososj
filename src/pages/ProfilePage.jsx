// import Sidebar from "../components/Sidebar";
// import ProfileCard from "../components/ProfileCard";
// import InfoCard from "../components/InfoCard";
// import "../css/ProfilePage.css";
// import { getUserAnalytics } from "../api/collections";
// import React, { useEffect, useState } from "react";


// export default function ProfilePage() {

//     const [analytics, setAnalytics] = useState({
//       items_count: 0,
//       collections_count: 0,
//       total_value: 0,
//     });

//       useEffect(() => {
//         loadAnalytics();
//       }, []);
    
//        async function loadAnalytics() {
//         try {
//           const data = await getUserAnalytics();
//           setAnalytics(data);
//         } catch (err) {
//           console.error(err);
//         }
//       }

//   return (
//     <>
//    <div className="layout">
//       <Sidebar />
      
//       <div className="content">
//         <ProfileCard />

//         <div className="infoRow">
//         <InfoCard title="Items" count={analytics.items_count} />
//         <InfoCard title="Collections" count={analytics.collections_count} />
//         <InfoCard title="Total value" count={analytics.total_value} />
//       </div>
//       </div>
//     </div>
//     </>
//   );
// }

import Sidebar from "../components/Sidebar";
import ProfileCard from "../components/ProfileCard";
import InfoCard from "../components/InfoCard";
import "../css/ProfilePage.css";
import { getUserAnalytics } from "../api/collections";
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  const [analytics, setAnalytics] = useState({
    items_count: 0,
    collections_count: 0,
    total_value: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const data = await getUserAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user data</div>;
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <ProfileCard user={user} isMe={true} />

        <div className="infoRow">
          <InfoCard title="Items" count={analytics.items_count} />
          <InfoCard title="Collections" count={analytics.collections_count} />
          <InfoCard title="Total value" count={analytics.total_value} />
        </div>

      </div>
    </div>
  );
}