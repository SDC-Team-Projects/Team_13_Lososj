
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Button from "../ui/Button";

import { Pencil, Trash2 } from "lucide-react";

import { getItemById, deleteItem } from "../api/items";

import { useAuth } from "../context/AuthContext";
import { isOwner } from "../utils/permissions";

import "../css/ItemPage.css";

export default function ItemPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const loadItem = async () => {
      try {
        const data = await getItemById(id);
        setItem(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadItem();
  }, [id]);


  const owner = useMemo(() => {
    if (!user || !item) return false;
    return isOwner(user, item.user_id);
  }, [user, item]);

  const image =
    item?.custom_fields?.image ||
    "https://placehold.co/1200x800";

  async function handleDelete() {
    const confirmDelete = window.confirm("Delete this item?");
    if (!confirmDelete) return;

    try {
      await deleteItem(item.id);
      alert("Item deleted");
      navigate("/collections");
    } catch (err) {
      console.error(err);
      alert("Failed to delete item");
    }
  }

  if (loading) return <h2>Loading item...</h2>;
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

              <Button variant="secondary">
                <Pencil size={18} />
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

              <div>
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