import "../css/CollectionCard.css";
import { Link } from "react-router-dom";
import Button from "../ui/Button";
import { getUserAnalytics } from "../api/collections";
import React, { useEffect, useState } from "react";

export default function CollectionCard({
  collection,
  variant = "square",
}) {

  const [analytics, setAnalytics] = useState({
    items_count: 0,
    collections_count: 0,
    total_value: 0,
  });

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const data = await getUserAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={`collectionCard ${variant}`}>

      <Link
        to={`/collections/${collection.id}`}
        className="cardLink"
      >

        <div className="imageBlock">
          <img
            src={collection.image}
            alt={collection.name}
          />
        </div>

        <div className="contentBlock">

          <div className="topRow">
            <div className="category">
              {collection.category}
            </div>
          </div>

          <h2 className="title">
            {collection.name}
          </h2>

          <p className="desc">
            {collection.description}
          </p>

          <div className="statsRow">

            <div>
              <span>Items</span>
              <strong>
                {analytics.items_count || 0}
              </strong>
            </div>

            <div>
              <span>Total cost</span>
              <strong>
                ${analytics.total_value || 0}
              </strong>
            </div>

            <div>
              <span>Owner</span>
              <strong>
                {collection.owner_name || "You"}
              </strong>
            </div>

          </div>

        </div>

      </Link>

      {variant === "horizontal" && (
        <div className="actions">

          <Button variant="secondary">
            Download PDF
          </Button>

          <Button variant="primary">
            Edit
          </Button>

          <Button variant="danger">
            Delete
          </Button>

        </div>
      )}

    </div>
  );
}