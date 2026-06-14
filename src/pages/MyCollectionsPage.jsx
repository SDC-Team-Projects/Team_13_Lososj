import { useState } from "react";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import "../css/MyCollectionsPage.css";
import SearchBar from "../components/SearchBar";
import CollectionCard from "../components/CollectionCard";
import UniversalGrid from "../components/UniversalGrid";
import Sidebar from "../components/Sidebar";
import { usePageLoader } from "../hook/usePageLoader";

import {
  getCollections,
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
  deleteCollection
} from "../api/collections";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";

export default function MyCollectionsPage() {
  const queryClient = useQueryClient();
  const [gridMode, setGridMode] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minValue: "",
    maxValue: "",
    sort: "",
  });

  //react query collections 
  const {
    data: collections = [],
    isLoading,
  } = useQuery({
    queryKey: ["collections"],
    queryFn: getCollections,
  });

  usePageLoader(isLoading);


//react query favorites
  const { data: favorites = [] } = useQuery({
    queryKey: ["favoriteCollections"],
    queryFn: getFavoriteCollections,
  });

  
  // helper
  const favoriteIds = favorites.map((c) => c.id);

  // toggle favorite через API + обновление cache
  async function toggleFavorite(collectionId) {
    const isFav = favoriteIds.includes(collectionId);

    try {
      if (isFav) {
        await removeFavoriteCollection(collectionId);
      } else {
        await addFavoriteCollection(collectionId);
      }

      queryClient.invalidateQueries({
        queryKey: ["favoriteCollections"],
      });
    } catch (err) {
      console.error(err);
    }
  }

  const deleteMutation = useMutation({
  mutationFn: deleteCollection,
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["collections"],
    });
  },
});

  const filteredCollections = collections
    .filter((c) =>
      c.name.toLowerCase().includes(filters.search.toLowerCase())
    )
    .filter((c) =>
      filters.category ? c.category === filters.category : true
    )
    .filter((c) =>
      filters.minValue
        ? Number(c.total_value) >= Number(filters.minValue)
        : true
    )
    .filter((c) =>
      filters.maxValue
        ? Number(c.total_value) <= Number(filters.maxValue)
        : true
    )
    .sort((a, b) => {
      if (filters.sort === "price_asc") return a.total_value - b.total_value;
      if (filters.sort === "price_desc") return b.total_value - a.total_value;
      return 0;
    });

const gridOptions = [
  { label: "Large", value: 1 },
  { label: "Compact", value: 3 },
];

// if (isLoading) {
//     return (
//       <div className="layout">
//         <Sidebar />
//         <div className="content">
//           <h2>Loading collections...</h2>
//         </div>
//       </div>
//     );
//   }

  return (
    <div className="layout">
      <div className="content">
        <div className="mainText">
          <div className="heroTitle">
          <h1>My Collections</h1>
          <p>Here you can manage your collections</p>
          </div>

          <Link to="/collectionForm">
            <Button>+ Create New Collection</Button>
          </Link>
        </div>

        <div className="search">
          <SearchBar filters={filters} setFilters={setFilters} />
        </div>

        {/* VIEW SWITCHER */}
        <div className="viewSwitcher">
          {gridOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={gridMode === opt.value ? "primary" : "secondary"}
              onClick={() => setGridMode(opt.value)}
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* EMPTY STATE */}
{filteredCollections.length === 0 ? (
  <div>
    <h3>No collections yet</h3>
  </div>
) : (
  <UniversalGrid columns={gridMode}>
    {filteredCollections.map((collection) => (
      <CollectionCard
        key={collection.id}
        collection={collection}
        variant="square"
        onDelete={(id) => deleteMutation.mutate(id)}
        isFavorite={favoriteIds.includes(collection.id)}
        onToggleFavorite={toggleFavorite}
      />
    ))}
  </UniversalGrid>
)}
      </div>
    </div>
  );
}