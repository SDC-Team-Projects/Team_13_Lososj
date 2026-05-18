import "../css/CollectionCard.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import { deleteCollection } from "../api/collections";

import React, { useState } from "react";

import {
  Heart,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";

export default function CollectionCard({
  collection,
  variant = "square",
  onDelete,
  isFavorite,
  onToggleFavorite,
}) {

  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();

    if (onToggleFavorite) {
      onToggleFavorite(collection.id);
    }
  }

  async function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm("Delete this collection?")) return;

    try {
      setDeleting(true);

      await deleteCollection(collection.id);

      onDelete?.(collection.id);

      navigate("/collections");

    } catch (err) {
      console.error(err);

    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className={`collectionCard ${variant}`}>

      {variant === "square" && (
        <button
          className={`favoriteIcon ${
            isFavorite ? "active" : ""
          }`}
          onClick={handleFavorite}
          type="button"
        >
          <Heart
            size={20}
            fill={isFavorite ? "#ef4444" : "none"}
            color={isFavorite ? "#ef4444" : "currentColor"}
          />
        </button>
      )}

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
                {Number(collection.items_count) || 0}
              </strong>
            </div>

            <div>
              <span>Total cost</span>

              <strong>
                ${(Number(collection.total_value) || 0).toFixed(2)}
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

          <Button
            className="horizontalFavoriteButton"
            variant="secondary"
            onClick={handleFavorite}
          >
            <Heart
              size={18}
              fill={isFavorite ? "#ef4444" : "none"}
              color={isFavorite ? "#ef4444" : "currentColor"}
            />

            {isFavorite ? "Saved" : "Favourites"}
          </Button>

          <Button variant="secondary">
            <Download size={18} />
          </Button>

          <Link to={`/collections/edit/${collection.id}`}>
            <Button variant="secondary">
              <Pencil size={18} />
            </Button>
          </Link>

          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            <Trash2 size={18} />
          </Button>

        </div>
      )}
    </div>
  );
}