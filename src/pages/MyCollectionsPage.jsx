
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Link } from "react-router-dom";

import "../css/MyCollectionsPage.css";

import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import CollectionCard from "../components/CollectionCard";
import UniversalGrid from "../components/UniversalGrid";

import {
  getCollections,
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
} from "../api/collections";

export default function MyCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  const [gridMode, setGridMode] = useState(1);

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minValue: "",
    maxValue: "",
    sort: "",
  });

  useEffect(() => {
    loadCollections();
    loadFavorites();
  }, []);

  async function loadCollections() {
    try {
      const data = await getCollections();
      setCollections(data);
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const data = await getFavoriteCollections();
      setFavoriteIds(data.map((c) => c.id));
    } catch (err) {
      console.error(err);
    }
  }

  async function toggleFavorite(collectionId) {
    const isFav = favoriteIds.includes(collectionId);

    try {
      if (isFav) {
        await removeFavoriteCollection(collectionId);
        setFavoriteIds((prev) => prev.filter((id) => id !== collectionId));
      } else {
        await addFavoriteCollection(collectionId);
        setFavoriteIds((prev) => [...prev, collectionId]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function handleDeleteCollection(id) {
    setCollections((prev) => prev.filter((c) => c.id !== id));
    setFavoriteIds((prev) => prev.filter((favId) => favId !== id));
  }

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

  if (loading) return <h2>Loading collections...</h2>;

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="title">
          <h1>My Collections</h1>
          <p>Here you can manage your collections</p>

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

        {/* GRID */}
        <UniversalGrid columns={gridMode}>
          {filteredCollections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant="square"
              onDelete={handleDeleteCollection}
              isFavorite={favoriteIds.includes(collection.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </UniversalGrid>
      </div>
    </div>
  );
}