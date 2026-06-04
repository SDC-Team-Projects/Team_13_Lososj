


import "../css/CollectionCard.css";
import { Link, useNavigate } from "react-router-dom";
import Button from "../ui/Button";
import React, { useState, useMemo } from "react";

import { downloadCollectionPdf } from "../api/collections";
import { useAuth } from "../context/AuthContext";
import { isOwner } from "../utils/permissions";

import { Heart, Download, Pencil, Trash2, User, Share2 } from "lucide-react";

const LIMITS = {
  square: {
    title: 20,
    desc: 27,
  },
  horizontal: {
    title: 60,
    desc: 120,
  },
  mini: {
    title: 30,
    desc: 120,
  },
};

export default function CollectionCard({
  collection,
  variant = "square",
  onDelete,
  isFavorite,
  onToggleFavorite,
}) {
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const owner = useMemo(() => {
    if (!user || !collection) return false;
    return isOwner(user, collection.user_id);
  }, [user, collection]);

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


  async function handleShare(e) {
  e.preventDefault();
  e.stopPropagation();

  const link =
    `${window.location.origin}/public/collections/${collection.id}`;

  try {
    if (navigator.share) {
      await navigator.share({
        title: collection.name,
        text: collection.description,
        url: link,
      });
    } else {
      await navigator.clipboard.writeText(link);
      alert("Link copied to clipboard");
    }
  } catch (err) {
    console.error(err);
  }
}

  function handleEdit(e) {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/collections/edit/${collection.id}`);
  }

  function handleDelete(e) {
    e.preventDefault();
    e.stopPropagation();

    const confirmed = window.confirm(
      "Are you sure you want to delete this collection?"
    );

    if (confirmed) onDelete?.(collection.id);
  }

  return (
    <div className={`collectionCard ${variant}`}>
      {/* FAVORITE ICON */}
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

      {/* MAIN CARD */}
      <Link
        to={`/collections/${collection.id}`}
        className="cardLink"
      >
        <div className="imageBlock">
          <img src={collection.image} alt={collection.name} />
        </div>

        <div className="contentBlock">
          <div className="topRow">
            <div className="category">
              {collection.category}
            </div>
          </div>

          <h2 className="title">
            {trimText(
              collection.name,
              LIMITS[variant].title
            )}
          </h2>

          <p className="desc">
            {trimText(
              collection.description,
              LIMITS[variant].desc
            )}
          </p>

          {variant !== "mini" && (
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
<div className="ownerAvatarWrapper">
  {collection.owner_avatar ? (
    <img
      src={collection.owner_avatar}
      alt="owner"
      className="ownerAvatar"
    />
  ) : (
    <User size={14} />
  )}
</div>
              </div>
            </div>
          )}
        </div>
      </Link>

      {/* ACTIONS */}
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
          </Button>

          <Button
            variant="secondary"
            onClick={handleDownload}
            disabled={downloading}
          >
            <Download size={18} />
          </Button>

          <Button
            variant="secondary"
            onClick={handleShare}
            >
              <Share2 size={18} />
          </Button>

          {owner && (
            <>
              <Button variant="primary" onClick={handleEdit}>
                <Pencil size={18} />
              </Button>

              <Button variant="danger" onClick={handleDelete}>
                <Trash2 size={18} />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}