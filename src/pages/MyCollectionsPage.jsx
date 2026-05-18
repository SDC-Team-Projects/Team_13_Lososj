
// import { useEffect, useState } from "react";
// import Button from "../ui/Button";
// import { Link } from "react-router-dom";

// import "../css/MyCollectionsPage.css";

// import SearchBar from "../components/SearchBar";
// import Sidebar from "../components/Sidebar";
// import CollectionCard from "../components/CollectionCard";

// import { getCollections, 
//   getFavoriteCollections,
//   addFavoriteCollection,
//   removeFavoriteCollection,
//  } from "../api/collections";

// export default function MyCollectionsPage({
//   variant = "square",
// }) {

//   const [collections, setCollections] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [favoriteCollections, setFavoriteCollections] = useState([]);

//   const addCollection = (newCollection) => {
//     setCollections([
//       ...collections,
//       newCollection,
//     ]);
//   };

//   async function loadCollections() {

//     try {

//       const data = await getCollections();

//       setCollections(data);

//     } catch (err) {

//       console.error(err);

//     } finally {

//       setLoading(false);
//     }
//   }


//   useEffect(() => {
//   loadCollections();
//   loadFavorites();
// }, []);

//   function handleDeleteCollection(id) {

//     setCollections((prev) =>
//       prev.filter(
//         (collection) => collection.id !== id
//       )
//     );
//   }

// if (loading) {
//     return <h2>Loading collections...</h2>;
//   }


// async function loadFavorites() {
//   try {
//     const data = await getFavoriteCollections();
//     setFavoriteCollections(data);
//   } catch (err) {
//     console.error(err);
//   }
// }

// async function toggleFavorite(collectionId) {
//   const isFav = favoriteCollections.some(
//     c => c.id === collectionId
//   );

//   try {
//     if (isFav) {
//       await removeFavoriteCollection(collectionId);

//       setFavoriteCollections(prev =>
//         prev.filter(c => c.id !== collectionId)
//       );
//     } else {
//       await addFavoriteCollection(collectionId);

//       const collection = collections.find(
//         c => c.id === collectionId
//       );

//       if (collection) {
//         setFavoriteCollections(prev => [
//           ...prev,
//           collection,
//         ]);
//       }
//     }
//   } catch (err) {
//     console.error(err);
//   }
// }

//   return (
//     <div className="layout">

//       <Sidebar />

//       <div className="content">

//         <div className="title">

//           <h1>My Collections</h1>

//           <p>
//             Here you can manage your collections
//           </p>

//           <Link to="/collectionForm">
//             <Button type="button">
//               + Create New Collection
//             </Button>
//           </Link>

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
//               onDelete={handleDeleteCollection}
//               isFavorite={favoriteCollections.some(c => c.id === collection.id)}
//               onToggleFavorite={toggleFavorite}
//             />

//           ))}

//         </div>

//       </div>

//     </div>
//   );
// }


import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { Link } from "react-router-dom";

import "../css/MyCollectionsPage.css";

import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import CollectionCard from "../components/CollectionCard";

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

  useEffect(() => {
    loadCollections();
    loadFavorites();
  }, []);

  async function loadCollections() {
    try {
      const data = await getCollections();
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


//  async function toggleFavorite(collectionId) {
//   const isFav = favoriteIds.includes(collectionId);

//   if (isFav) {
//     setFavoriteIds((prev) =>
//       prev.filter((id) => id !== collectionId)
//     );
//   } else {
//     setFavoriteIds((prev) => [...prev, collectionId]);
//   }
// }

  function handleDeleteCollection(id) {
    setCollections((prev) =>
      prev.filter((collection) => collection.id !== id)
    );

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
          <h1>My Collections</h1>

          <p>Here you can manage your collections</p>

          <Link to="/collectionForm">
            <Button type="button">
              + Create New Collection
            </Button>
          </Link>
        </div>

        <div className="search">
          <SearchBar />
        </div>

        <div className="itemsGrid">
          {collections.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              variant="square"
              onDelete={handleDeleteCollection}
              isFavorite={favoriteIds.includes(collection.id)}
              onToggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      </div>
    </div>
  );
}