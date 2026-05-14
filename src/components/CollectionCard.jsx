import "../css/CollectionCard.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import {
  getCollectionAnalytics,
  deleteCollection,
} from "../api/collections";



import React, { useEffect, useState } from "react";

export default function CollectionCard({
  collection,
  variant = "square",
  onDelete,
}) {

  const [analytics, setAnalytics] = useState({
    items_count: 0,
    collections_count: 0,
    total_value: 0,
  });

  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {

      const data = await getCollectionAnalytics(
        collection.id
      );

      setAnalytics(data);

    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(e) {

    e.preventDefault();

    const confirmDelete = window.confirm(
      "Delete this collection?"
    );

    if (!confirmDelete) return;

    try {

      setDeleting(true);

      await deleteCollection(collection.id);

      if (onDelete) {
  onDelete(collection.id);
}

navigate("/collections");

    } catch (err) {

      console.error(err);

      alert("Failed to delete collection");

    } finally {

      setDeleting(false);
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

          <Link to={`/collections/edit/${collection.id}`}>
            <Button variant="primary">
              Edit
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>

        </div>
      )}

    </div>
  );
}