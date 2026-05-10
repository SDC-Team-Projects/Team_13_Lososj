import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import Button from "../ui/Button";

import {
  Download,
  Pencil,
  Trash2,
  Heart,
} from "lucide-react";

import { getItemById } from "../api/items";

import "../css/ItemPage.css";

export default function ItemPage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [item, setItem] = useState(null);

  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <h2>Loading item...</h2>;
  }

  if (!item) {
    return <h2>Item not found</h2>;
  }

  const image =
    item.custom_fields?.image ||
    "https://placehold.co/1200x800";

  return (
    <div className="layout">

      <Sidebar />

      <div className="content">

        <div className="itemPage">
             {/* IMAGE */}

          <div className="itemHero">
            <img
              src={image}
              alt={item.name}
            />
          </div>

          {/* CATEGORY */}

          <div className="itemCategory">
            {item.condition}
          </div>

          {/* TITLE */}

          <h1 className="itemTitle">
            {item.name}
          </h1>
 {/* PRICE */}

          <div className="itemPrice">
            ${item.estimated_value}
          </div>

          {/* ACTIONS */}

          <div className="itemActions">

            <Button
              variant="secondary"
              className="favoriteBtn"
            >
              <Heart size={18} />
              In favorites
            </Button>

            <Button variant="secondary">
              <Download size={18} />
            </Button>

            <Button variant="secondary">
              <Pencil size={18} />
               </Button>

            <Button variant="danger">
              <Trash2 size={18} />
            </Button>

          </div>

          {/* DETAILS */}

          <div className="detailsCard">

            <div className="detailBlock">

              <h3>Description</h3>
               <p>
                {item.description ||
                  "No description"}
              </p>

            </div>

            <div className="detailsGrid">

              <div>
                <span>Condition</span>

                <strong>
                  {item.condition}
                </strong>
              </div>

              <div>
                <span>Date of purchase</span>

                <strong>
                  {new Date(
                    item.created_at
                  ).toLocaleDateString()}
                </strong>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}