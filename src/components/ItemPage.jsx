import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Sidebar from "../components/Sidebar";
import Button from "../ui/Button";
import { Trash2 } from "lucide-react";

import { getItemById, deleteItem } from "../api/items";
import { useAuth } from "../context/AuthContext";
import { isOwner } from "../utils/permissions";
import { usePageLoader } from "../hook/usePageLoader";

import "../css/ItemPage.css";

export default function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const {
    data: item,
    isLoading,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id),
    enabled: !!id,
  });

  usePageLoader(isLoading);

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      navigate("/collections");
    },
  });

  const owner = useMemo(() => {
    if (!user || !item) return false;
    return isOwner(user, item.user_id);
  }, [user, item]);

  const image =
    item?.custom_fields?.image ||
    item?.image ||
    "https://placehold.co/1200x800";

  function handleDeleteClick() {
    setShowDeleteConfirm(true);
  }

  function confirmDeleteItem() {
    if (!item) return;

    deleteMutation.mutate(item.id);
    setShowDeleteConfirm(false);
  }

  function cancelDeleteItem() {
    setShowDeleteConfirm(false);
  }

  if (isLoading) return <h2>Loading item...</h2>;
  if (!item) return <h2>Item not found</h2>;

  return (
    <div className="layout">
      <Sidebar />

      <div className="content">
        <div className="itemPage">
          <div className="itemHero">
            <img src={image} alt={item.name} />
          </div>

          <div className="itemCategory">
            {item.condition}
          </div>

          <h1 className="itemTitle">
            {item.name}
          </h1>

          <div className="itemPrice">
            ${item.estimated_value}
          </div>

          {owner && (
            <div className="itemActions">
              <Button
                variant="primary"
                onClick={() =>
                  navigate(`/items/${item.id}/edit`)
                }
              >
                Edit
              </Button>

              <Button
                variant="danger"
                onClick={handleDeleteClick}
              >
                <Trash2 size={18} />
                Delete
              </Button>
            </div>
          )}

          <div className="detailsCard">
            <div className="detailBlock">
              <h3>Description</h3>
              <p>
                {item.description || "No description"}
              </p>
            </div>

            <div className="detailsGrid">
              <div className="condition">
                <span>Condition</span>
                <strong>{item.condition}</strong>
              </div>

              <div>
                <span>Date of purchase</span>
                <strong>
                  {new Date(item.created_at).toLocaleDateString()}
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
        <div className="deleteOverlay">
          <div className="deleteModal">
            <h3>Delete item?</h3>

            <p>
              Are you sure you want to delete "{item.name}"?
              This action cannot be undone.
            </p>

            <div className="deleteModalActions">
              <Button
                variant="secondary"
                onClick={cancelDeleteItem}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>

              <Button
                variant="danger"
                onClick={confirmDeleteItem}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}