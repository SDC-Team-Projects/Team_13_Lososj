import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import CollectionCard from "../components/CollectionCard";

import { getFavoriteCollections } from "../api/collections";

import "../css/MyCollectionsPage.css";

export default function FavoritesPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      const data = await getFavoriteCollections();
      setCollections(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function handleRemoveFromUI(id) {
    setCollections((prev) => prev.filter((c) => c.id !== id));
  }

  if (loading) {
    return <h2>Loading favorites...</h2>;
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="title">
          <h2>Favorite collections</h2>
          <p>Your saved collections</p>
        </div>

        {collections.length === 0 ? (
          <h3>No favorites yet</h3>
        ) : (
          <div className="itemsGrid">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                variant="square"
                disableAnalytics={true}
                isFavorite={true}
                onToggleFavorite={() => handleRemoveFromUI(collection.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}