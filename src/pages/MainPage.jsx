import Sidebar from "../components/Sidebar";
import "../css/MainPage.css";
import ProfileCard from "../components/ProfileCard";
import InfoCard from "../components/InfoCard";
import CostChart from "../components/CostChart";
import CollectionForm from "../components/CollectionForm";
import CollectionCard from "../components/CollectionCard";
import { getUserAnalytics } from "../api/collections";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
import { apiFetch } from "../api/apiClient";
import { ChartNoAxesCombined } from "lucide-react";
import { useLocation } from "react-router-dom";
import { usePageLoader } from "../hook/usePageLoader";

export default function MainPage() {
  const queryClient = useQueryClient();

  const {
  data: recentCollections = [],
  isLoading
} = useQuery({
  queryKey: ["recentCollections"],
  queryFn: getRecentCollections,
  staleTime: 1000 * 60 * 5,
});

usePageLoader(isLoading);

  const {
  data: analytics = {
    items_count: 0,
    collections_count: 0,
    total_value: 0,
  },
} = useQuery({
  queryKey: ["userAnalytics"],
  queryFn: getUserAnalytics,
  staleTime: 1000 * 60 * 5,
});

  const location = useLocation();

async function getRecentCollections() {
  const res = await apiFetch(
    "https://team-13-lososj.onrender.com/api/views-history"
  );

  if (!res.ok) {
    throw new Error("Failed");
  }

  const data = await res.json();

  const collectionsOnly = data
    .filter((v) => v.collection_id !== null)
    .map((v) => ({
      id: v.collection_id,
      name: v.collection_name,
      image: v.collection_image,
      category: v.category,
      viewed_at: v.viewed_at,
    }));

  const uniqueMap = new Map();

  collectionsOnly.forEach((c) => {
    uniqueMap.set(c.id, c);
  });

  const unique = Array.from(uniqueMap.values());

  unique.sort(
    (a, b) => new Date(b.viewed_at) - new Date(a.viewed_at)
  );

  return unique;
}

  return (
    <>
     <Sidebar />
   <div className="layout">
        
          <div className="content">

           <div className="infoRow">
           <InfoCard title="Items" count={analytics.items_count}></InfoCard>
           <InfoCard title="Collections" count={analytics.collections_count}/>
           <InfoCard title="Total value" count={`$${analytics.total_value}`}/>
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