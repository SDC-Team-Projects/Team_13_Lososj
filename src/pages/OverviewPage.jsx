// import { useEffect, useState } from "react";

// import Sidebar from "../components/Sidebar";
// import SearchBar from "../components/SearchBar";
// import CollectionCard from "../components/CollectionCard";

// import {
//   getPublicCollections,
// } from "../api/collections";

// import "../css/MyCollectionsPage.css";

// export default function OverviewPage() {

//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadCollections();
//   }, []);

//   async function loadCollections() {

//     try {

//       const data =
//         await getPublicCollections();

//       setCollections(data);

//     } catch (err) {

//       console.error(err);

//     } finally {

//       setLoading(false);
//     }
//   }

//   if (loading) {
//     return <h2>Loading collections...</h2>;
//   }

//   return (
//     <div className="layout">

//       <Sidebar />

//       <div className="content">

//         <div className="title">

//           <h2>
//             Overview of collections
//           </h2>

//           <p>
//             Discover amazing collections
//             from users all over the world
//           </p>

//         </div>

//         <div className="search">
//           <SearchBar />
//         </div>

//         <div className="itemsGrid">

//           {collections.map((collection) => (

//             <CollectionCard
//               key={collection.id}
//               collection={collection}
//               variant="square"
//             />

//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }



import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import SearchBar from "../components/SearchBar";
import CollectionCard from "../components/CollectionCard";

import {
  getPublicCollections,
  getCollections,
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
} from "../api/collections";

import "../css/MyCollectionsPage.css";

export default function OverviewPage() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    loadCollections();
    loadFavorites();
  }, []);

  async function loadCollections() {
    try {
      const data = await getPublicCollections();
      setCollections(data);
    } catch (err) {
      console.error(err);
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
          setFavoriteIds((prev) =>
            prev.filter((id) => id !== collectionId)
          );
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

    setFavoriteIds((prev) =>
      prev.filter((favId) => favId !== id)
    );
  }
  
    
  if (loading) {
    return <h2>Loading collections...</h2>;
  }

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">

        <div className="title">
          <h2>Overview of collections</h2>
          <p>Discover amazing collections from users all over the world</p>
        </div>

        <div className="search">
          <SearchBar />
        </div>

        {collections.length === 0 ? (
          <h3>No public collections yet</h3>
        ) : (
          <div className="itemsGrid">
            {collections.map((collection) => (
              <CollectionCard
              key={collection.id}
              collection={collection}
              variant="square"
              disableAnalytics={true}
              onDelete={handleDeleteCollection}
              isFavorite={favoriteIds.includes(collection.id)}
              onToggleFavorite={toggleFavorite}
/>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}