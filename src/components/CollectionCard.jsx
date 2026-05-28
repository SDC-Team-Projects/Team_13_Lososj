import "../css/CollectionCard.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import React, { useState } from "react";
import { downloadCollectionPdf } from "../api/collections";

import { Heart, Download } from "lucide-react";

export default function CollectionCard({
  collection,
  variant = "square", // square | horizontal | mini
  onDelete,
  isFavorite,
  onToggleFavorite,
}) {
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  function trimText(text, maxLength = 30) {
    if (!text) return "";
    return text.length > maxLength
      ? text.slice(0, maxLength).trim() + "..."
      : text;
  }

  function handleFavorite(e) {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(collection.id);
  }

  async function handleDownload(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
      setDownloading(true);

      const blob = await downloadCollectionPdf(collection.id);
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${collection.name}.pdf`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className={`collectionCard ${variant}`}>

      {/* FAVORITE */}
      {variant === "square" && (
        <button
          className={`favoriteIcon ${isFavorite ? "active" : ""}`}
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

      {/* MAIN CARD LINK */}
      <Link to={`/collections/${collection.id}`} className="cardLink">

        <div className="imageBlock">
          <img src={collection.image} alt={collection.name} />
        </div>

        <div className="contentBlock">

          <div className="topRow">
            <div className="category">
              {collection.category}
            </div>
          </div>

          <h2 className="title">{collection.name}</h2>

          <p className="desc">
            {variant === "square"
              ? trimText(collection.description)
              : variant === "mini"
              ? trimText(collection.description, 60)
              : collection.description}
          </p>

          {variant !== "mini" && (
            <div className="statsRow">

              <div>
                <span>Items</span>
                <strong>{Number(collection.items_count) || 0}</strong>
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
                  <span
                    className="ownerLink"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();

                      navigate(
                        `/users/${collection.user_id}`
                      );
                    }}
                  >
                    {collection.owner_name || "User"}
                  </span>
                </strong>
              </div>

            </div>
          )}

        </div>
      </Link>

      {/* ACTIONS (ALL USERS) */}
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

          <Button
            variant="secondary"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={18} />
            {downloading ? "Downloading..." : "Download"}
          </Button>

        </div>
      )}
    </div>
  );
}