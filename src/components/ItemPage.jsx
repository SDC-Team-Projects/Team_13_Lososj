import { useMemo } from "react";
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

  // 1. ITEM QUERY
  const {
    data: item,
    isLoading,
  } = useQuery({
    queryKey: ["item", id],
    queryFn: () => getItemById(id),
    enabled: !!id,
  });

  usePageLoader(isLoading);

  // 2. DELETE MUTATION
  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["items"],
      });

      navigate("/collections");
    },
  });

  // 3. OWNER CHECK
  const owner = useMemo(() => {
    if (!user || !item) return false;
    return isOwner(user, item.user_id);
  }, [user, item]);

  // 4. IMAGE SAFE
  const image =
    item?.custom_fields?.image ||
    "https://placehold.co/1200x800";

  // 5. DELETE HANDLER
  function handleDelete() {
    const confirmDelete = window.confirm("Delete this item?");
    if (!confirmDelete) return;

    deleteMutation.mutate(item.id);
  }

  // 6. LOADING STATES
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

          {/* OWNER ACTIONS */}
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
                onClick={handleDelete}
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
    </div>
  );
}