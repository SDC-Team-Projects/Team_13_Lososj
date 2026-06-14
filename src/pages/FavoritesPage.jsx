import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../components/Sidebar";
import CollectionCard from "../components/CollectionCard";
import UniversalGrid from "../components/UniversalGrid";
import SearchBar from "../components/SearchBar";
import Button from "../ui/Button";

import { getFavoriteCollections, removeFavoriteCollection } from "../api/collections";

import "../css/MyCollectionsPage.css";
import { usePageLoader } from "../hook/usePageLoader";

export default function FavoritesPage() {
  const [gridMode, setGridMode] = useState(1);
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    minValue: "",
    maxValue: "",
    sort: "",
  });

  const {
  data: collections = [],
  isLoading,
} = useQuery({
  queryKey: ["favoriteCollections"],
  queryFn: getFavoriteCollections,
});

  usePageLoader(isLoading);

const removeFavoriteMutation = useMutation({
  mutationFn: removeFavoriteCollection,

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["favoriteCollections"],
    });
  },
});

if (isLoading) {
  return <h2>Loading favorites...</h2>;
}

  // useEffect(() => {
  //   loadFavorites();
  // }, []);

  // async function loadFavorites() {

  //   try {

  //     const data = await getFavoriteCollections();

  //     setCollections(data);

  //   } catch (err) {

  //     console.error(err);

  //   } finally {

  //     setLoading(false);

  //   }
  // }

  // function handleRemoveFromUI(id) {
  //   setCollections((prev) =>
  //     prev.filter((c) => c.id !== id)
  //   );
  // }

  const filteredCollections = collections
    .filter((c) =>
      (c.name || "")
        .toLowerCase()
        .includes(filters.search.toLowerCase())
    )
    .filter((c) =>
      filters.category
        ? c.category === filters.category
        : true
    )
    .filter((c) =>
      filters.minValue
        ? Number(c.total_value) >=
          Number(filters.minValue)
        : true
    )
    .filter((c) =>
      filters.maxValue
        ? Number(c.total_value) <=
          Number(filters.maxValue)
        : true
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

  const gridOptions = [
    { label: "Large", value: 1 },
    { label: "Compact", value: 3 },
  ];

  // if (loading) {
  //   return <h2>Loading favorites...</h2>;
  // }

  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <div className="mainText">

          <div className="heroText">

            <h2 className="mainTitle">
              Favorite collections
            </h2>

            <p className="subTitle">
              Your saved collections
            </p>

          </div>

        </div>

        {/* SEARCH */}

        <div className="search">

          <SearchBar
            filters={filters}
            setFilters={setFilters}
          />

        </div>

        {/* VIEW SWITCHER */}

        {filteredCollections.length > 0 && (

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

        )}

        {/* CONTENT */}

        {filteredCollections.length === 0 ? (

          <h3>No favorites yet</h3>

        ) : (

          <UniversalGrid columns={gridMode}>

            {filteredCollections.map((collection) => (

              <CollectionCard
                key={collection.id}
                collection={collection}
                variant="square"
                disableAnalytics={true}
                isFavorite={true}
                onToggleFavorite={() => removeFavoriteMutation.mutate(collection.id)
                }
              />

            ))}

          </UniversalGrid>

        )}

      </div>

    </div>
  );
}