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

export default function MainPage() {

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

  return (
    <>
     <Sidebar />
   <div className="layout">
        
          <div className="content">

           <div className="infoRow">
           <InfoCard title="Items" count={analytics.items_count}/>
           <InfoCard title="Collections" count={analytics.collections_count}/>
           <InfoCard title="Total value" count={analytics.total_value}/>
         </div>

         <div className="costChart">
                <CostChart />
            </div>
        </div>
         </div>
    </>
  );
}