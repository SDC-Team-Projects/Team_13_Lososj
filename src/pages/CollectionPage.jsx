
// import { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";

// import Sidebar from "../components/Sidebar";
// import ItemCard from "../components/ItemCard";
// import CollectionCard from "../components/CollectionCard";

// import Button from "../ui/Button";

// import "../css/CollectionPage.css";
// import "../css/CollectionCard.css";

// import { getCollectionById } from "../api/collections";
// import { getItemsByCollection } from "../api/items";

// import { useAuth } from "../context/AuthContext";
// import { isOwner } from "../utils/permissions";

// import {
//   getFavoriteCollections,
//   addFavoriteCollection,
//   removeFavoriteCollection,
// } from "../api/collections";

// export default function CollectionPage() {
//   const { id } = useParams();

//   const [collection, setCollection] = useState(null);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [favoriteIds, setFavoriteIds] = useState([]);

//   const { user } = useAuth();

//   useEffect(() => {
//     loadData();
//     loadFavorites();
//   }, [id]);

//   const loadData = async () => {
//     try {
//       const [collectionData, itemsData] = await Promise.all([
//         getCollectionById(id),
//         getItemsByCollection(id),
//       ]);

//       setCollection(collectionData);
//       setItems(itemsData);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   async function loadFavorites() {
//     try {
//       const data = await getFavoriteCollections();
//       setFavoriteIds(data.map((c) => c.id));
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   async function toggleFavorite(collectionId) {
//     const isFav = favoriteIds.includes(collectionId);

//     try {
//       if (isFav) {
//         await removeFavoriteCollection(collectionId);
//         setFavoriteIds((prev) =>
//           prev.filter((id) => id !== collectionId)
//         );
//       } else {
//         await addFavoriteCollection(collectionId);
//         setFavoriteIds((prev) => [...prev, collectionId]);
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   }

//   // ✅ SAFE OWNER CHECK (ВАЖНО)
//   const owner =
//     user && collection
//       ? isOwner(user, collection.user_id)
//       : false;

//   if (loading) return <h2>Loading collection...</h2>;
//   if (!collection) return <h2>Collection not found</h2>;

//   return (
//     <div className="layout">
//       <Sidebar />

//       <div className="content">
//         <h1>{collection.name}</h1>

//         <div className="itemsList">
//           <CollectionCard
//             collection={collection}
//             variant="horizontal"
//             isFavorite={favoriteIds.includes(collection.id)}
//             onToggleFavorite={toggleFavorite}
//           />
//         </div>

//         {/* ✅ только для владельца */}
//         {owner && (
//           <div className="button">
//             <Link to={`/collections/${id}/items/new`}>
//               <Button variant="primary">
//                 + Add Item
//               </Button>
//             </Link>
//           </div>
//         )}

//         <div
//           style={{
//             marginTop: "40px",
//             display: "grid",
//             gridTemplateColumns:
//               "repeat(auto-fill, minmax(280px, 1fr))",
//             gap: "24px",
//           }}
//         >
//           {items.length > 0 ? (
//             items.map((item) => (
//               <ItemCard
//                 key={item.id}
//                 item={{
//                   ...item,
//                   image:
//                     item.custom_fields?.image ||
//                     "https://placehold.co/600x400",
//                   price: item.estimated_value,
//                   category: item.condition,
//                 }}
//               />
//             ))
//           ) : (
//             <p>No items yet</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }



import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import CollectionCard from "../components/CollectionCard";

import Button from "../ui/Button";

import "../css/CollectionPage.css";
import "../css/CollectionCard.css";

import { getCollectionById } from "../api/collections";
import { getItemsByCollection } from "../api/items";

import { useAuth } from "../context/AuthContext";
import { isOwner } from "../utils/permissions";

import {
  getFavoriteCollections,
  addFavoriteCollection,
  removeFavoriteCollection,
} from "../api/collections";

export default function CollectionPage() {
  const { id } = useParams();

  const [collection, setCollection] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [favoriteIds, setFavoriteIds] = useState([]);

  const { user } = useAuth();

  useEffect(() => {
    loadData();
    loadFavorites();
  }, [id, user]);

  const loadData = async () => {
    try {
      const [collectionData, itemsData] = await Promise.all([
        getCollectionById(id),
        getItemsByCollection(id),
      ]);

      setCollection(collectionData);
      setItems(itemsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const owner =
    user && collection
      ? isOwner(user, collection.user_id)
      : false;

  if (loading) return <h2>Loading collection...</h2>;
  if (!collection) return <h2>Collection not found</h2>;

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <h1>{collection.name}</h1>

        <div className="itemsList">
          <CollectionCard
            collection={collection}
            variant="horizontal"
            isFavorite={favoriteIds.includes(collection.id)}
            onToggleFavorite={toggleFavorite}
          />
        </div>

        {owner && (
          <div className="button">
            <Link to={`/collections/${id}/items/new`}>
              <Button variant="primary">
                + Add Item
              </Button>
            </Link>
          </div>
        )}

        <div
          style={{
            marginTop: "40px",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "24px",
          }}
        >
          {items.length > 0 ? (
            items.map((item) => (
              <ItemCard
                key={item.id}
                variant="horizontal"
                item={{
                  ...item,
                  image:
                    item.custom_fields?.image ||
                    "https://placehold.co/600x400",
                  price: item.estimated_value,
                  category: item.condition,
                }}
              />
            ))
          ) : (
            <p>No items yet</p>
          )}
        </div>
      </div>
    </div>
  );
}