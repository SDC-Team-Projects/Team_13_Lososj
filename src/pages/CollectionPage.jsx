
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import ItemCard from "../components/ItemCard";
import CollectionCard from "../components/CollectionCard";


import Button from "../ui/Button";

import "../css/CollectionPage.css";
import "../css/CollectionCard.css";

import { getCollectionById } from "../api/collections";
import { getItemsByCollection } from "../api/items";

export default function CollectionPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [collection, setCollection] = useState(null);

  const [items, setItems] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadData = async () => {

      try {

        const [collectionData, itemsData] =
          await Promise.all([
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

    loadData();

  }, [id]);

  if (loading) {
    return <h2>Loading collection...</h2>;
  }

  if (!collection) {
    return <h2>Collection not found</h2>;
  }

  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >

          <h1>{collection.name}</h1>

        </div>

        <div className="itemsList">

          <CollectionCard
            collection={collection}
            variant="horizontal"
          />

        </div>

<div className="button">
  <Link to={`/collections/${id}/items/new`}>
  <Button variant="primary">
    + Add Item
  </Button>
</Link>

</div>
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