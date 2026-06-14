
import {  useState } from "react";
import { useQuery, useMutation, useQueryClient, } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import CollectionCard from "../components/CollectionCard";
import UniversalGrid from "../components/UniversalGrid";
import "../css/OverviewPage.css";
import Button from "../ui/Button";

import {
  getPublicCollections,
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
} from "../api/collections";

import "../css/MyCollectionsPage.css";

export default function OverviewPage() {
  const queryClient = useQueryClient();
  // const [collections, setCollections] = useState([]);
  // const [loading, setLoading] = useState(true);

  const {
  data: collections = [],
  isLoading,
} = useQuery({
  queryKey: ["publicCollections"],
  queryFn: getPublicCollections,
});

  // const [favoriteIds, setFavoriteIds] = useState([]);

const { data: favorites = [] } = useQuery({
  queryKey: ["favoriteCollections"],
  queryFn: getFavoriteCollections,
});

const favoriteIds = favorites.map((c) => c.id);

  const [gridMode, setGridMode] = useState(3);

  const gridOptions = [
    { label: "Large", value: 1 },
    { label: "Compact", value: 3 },
  ];

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minValue: "",
    maxValue: "",
    sort: "",
  });

  // useEffect(() => {
  //   loadCollections();
  //   loadFavorites();
  // }, []);

  // async function loadCollections() {
  //   try {
  //     const data = await getPublicCollections();

  //     setCollections(data);
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  // async function loadFavorites() {
  //   try {
  //     const data = await getFavoriteCollections();

  //     setFavoriteIds(data.map((c) => c.id));
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // async function toggleFavorite(collectionId) {
  //   const isFav = favoriteIds.includes(collectionId);

  //   try {
  //     if (isFav) {
  //       await removeFavoriteCollection(collectionId);

  //       setFavoriteIds((prev) =>
  //         prev.filter((id) => id !== collectionId)
  //       );
  //     } else {
  //       await addFavoriteCollection(collectionId);

  //       setFavoriteIds((prev) => [...prev, collectionId]);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  // function handleDeleteCollection(id) {
  //   setCollections((prev) =>
  //     prev.filter((c) => c.id !== id)
  //   );

  //   setFavoriteIds((prev) =>
  //     prev.filter((idFav) => idFav !== id)
  //   );
  // }


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



  /* FILTERED */

  const filteredCollections = collections
    .filter((c) =>
      (c.name || "")
        .toLowerCase()
        .includes((filters.search || "").toLowerCase())
    )
    .filter(
      (c) =>
        !filters.category ||
        c.category === filters.category
    )
    .filter(
      (c) =>
        !filters.minValue ||
        Number(c.total_value) >=
          Number(filters.minValue)
    )
    .filter(
      (c) =>
        !filters.maxValue ||
        Number(c.total_value) <=
          Number(filters.maxValue)
    )
    .sort((a, b) => {
      if (filters.sort === "price_asc") {
        return a.total_value - b.total_value;
      }

      if (filters.sort === "price_desc") {
        return b.total_value - a.total_value;
      }

      return 0;
    });

  // if (loading) {
  //   return <h2>Loading collections...</h2>;
  // }

  if (isLoading) {
    return <h2>Loading collections...</h2>;
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="heroText">

  <h2 className="mainTitle">
    Overview of collections
  </h2>

  <p className="subTitle">
    Discover amazing collections from users
    all over the world
  </p>

</div>

        <div className="search">
          <SearchBar
            filters={filters}
            setFilters={setFilters}
          />
        </div>

        {/* VIEW SWITCHER */}

        <div className="viewSwitcher">
          {gridOptions.map((opt) => (
            <Button
              key={opt.value}
              variant={
                gridMode === opt.value
                  ? "primary"
                  : "secondary"
              }
              onClick={() =>
                setGridMode(opt.value)
              }
            >
              {opt.label}
            </Button>
          ))}
        </div>

        {/* GRID */}

        {filteredCollections.length === 0 ? (
          <h3>No collections found</h3>
        ) : (
          <UniversalGrid columns={gridMode}>
            {filteredCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                variant="square"
                disableAnalytics={true}
                // onDelete={handleDeleteCollection}
                isFavorite={favoriteIds.includes(
                  collection.id
                )}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </UniversalGrid>
        )}
      </div>
    </div>
  );
}