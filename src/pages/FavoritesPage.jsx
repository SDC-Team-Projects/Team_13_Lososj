// import { useEffect, useState } from "react";

// import Sidebar from "../components/Sidebar";
// import CollectionCard from "../components/CollectionCard";

// import { getFavoriteCollections } from "../api/collections";

// import "../css/MyCollectionsPage.css";

// export default function FavoritesPage() {
//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadFavorites();
//   }, []);

//   async function loadFavorites() {
//     try {
//       const data = await getFavoriteCollections();
//       setCollections(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   }

//   function handleRemoveFromUI(id) {
//     setCollections((prev) => prev.filter((c) => c.id !== id));
//   }

//   if (loading) {
//     return <h2>Loading favorites...</h2>;
//   }

//   return (
//     <div className="layout">
//       <Sidebar />

//       <div className="content">
//         <div className="title">
//           <h2>Favorite collections</h2>
//           <p>Your saved collections</p>
//         </div>

//         {collections.length === 0 ? (
//           <h3>No favorites yet</h3>
//         ) : (
//           <div className="itemsGrid">
//             {collections.map((collection) => (
//               <CollectionCard
//                 key={collection.id}
//                 collection={collection}
//                 variant="square"
//                 disableAnalytics={true}
//                 isFavorite={true}
//                 onToggleFavorite={() => handleRemoveFromUI(collection.id)}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import CollectionCard from "../components/CollectionCard";
import UniversalGrid from "../components/UniversalGrid";

import Button from "../ui/Button";

import { getFavoriteCollections } from "../api/collections";

import "../css/MyCollectionsPage.css";

export default function FavoritesPage() {

  const [collections, setCollections] = useState([]);

  const [loading, setLoading] = useState(true);

  const [gridMode, setGridMode] = useState(1);

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
    setCollections((prev) =>
      prev.filter((c) => c.id !== id)
    );
  }

  const gridOptions = [
    { label: "Large", value: 1 },
    { label: "Compact", value: 3 },
  ];

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

        {/* VIEW SWITCHER */}

        {collections.length > 0 && (
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

        {collections.length === 0 ? (

          <h3>No favorites yet</h3>

        ) : (

          <UniversalGrid columns={gridMode}>

            {collections.map((collection) => (

              <CollectionCard
                key={collection.id}
                collection={collection}
                variant="square"
                disableAnalytics={true}
                isFavorite={true}
                onToggleFavorite={() =>
                  handleRemoveFromUI(collection.id)
                }
              />

            ))}

          </UniversalGrid>

        )}

      </div>

    </div>
  );
}