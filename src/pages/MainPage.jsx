import Sidebar from "../components/Sidebar";
import "../css/MainPage.css";
import ProfileCard from "../components/ProfileCard";
import InfoCard from "../components/InfoCard";
import CostChart from "../components/CostChart";
import CollectionForm from "../components/CollectionForm";
// import ItemCard from "../components/ItemCard";
import CollectionCard from "../components/CollectionCard";
import { getUserAnalytics } from "../api/collections";
import React, { useEffect, useState } from "react";
import { apiFetch } from "../api/apiClient";
import { ChartNoAxesCombined } from "lucide-react";

export default function MainPage() {

  const [recentCollections, setRecentCollections] = useState([]);
  const [analytics, setAnalytics] = useState({
    items_count: 0,
    collections_count: 0,
    total_value: 0,
  });

  useEffect(() => {
  loadAnalytics();
  loadRecentCollections();
}, []);

   async function loadAnalytics() {
    try {
      const data = await getUserAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }


  async function loadRecentCollections() {
  try {
    const res = await apiFetch(
      "https://team-13-lososj.onrender.com/api/views-history"
    );

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();

    // 1. берём только коллекции
    const collectionsOnly = data
      .filter((v) => v.collection_id !== null)
      .map((v) => ({
        id: v.collection_id,
        name: v.collection_name,
        image: v.collection_image,
        viewed_at: v.viewed_at,
      }));

    // 2. убираем дубли (берём последнюю версию)
    const uniqueMap = new Map();

    collectionsOnly.forEach((c) => {
      uniqueMap.set(c.id, c);
    });

    const unique = Array.from(uniqueMap.values());

// 3. сортируем по времени (новые первые)
unique.sort(
  (a, b) => new Date(b.viewed_at) - new Date(a.viewed_at)
);

setRecentCollections(unique);
  } catch (err) {
    console.error(err);
  }
}

  return (
    <>
     <Sidebar />
   <div className="layout">
        
          <div className="content">

           <div className="infoRow">
           <InfoCard title="Items" count={analytics.items_count}></InfoCard>
           <InfoCard title="Collections" count={analytics.collections_count}/>
           <InfoCard title="Total value" count={analytics.total_value}></InfoCard>
         </div>

         <div className="costChart">
                <CostChart />
            </div>

            {recentCollections.length > 0 && (
  <div className="recentBlock">
    <h2 className="sectionTitle">
      Recently viewed collections
    </h2>

    <div className="recentScroll">
      {recentCollections.map((col) => (
        <div key={col.id} className="recentItem">
          <CollectionCard
              collection={col}
              variant="mini"
                          />
        </div>
      ))}
    </div>
  </div>
)}
        </div>
         </div>
    </>
  );
}