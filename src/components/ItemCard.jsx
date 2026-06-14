
import "../css/ItemCard.css";

import Button from "../ui/Button";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { deleteItem } from "../api/items";

import { useAuth } from "../context/AuthContext";

import { isOwner } from "../utils/permissions";

import { Pencil } from "lucide-react";

export default function ItemCard({
  item,
  layout = "grid",
  mode = "preview",
}) {

  const isHorizontal =
    layout === "horizontal";

  const isDetails =
    mode === "details";

  const navigate = useNavigate();

  const { user } = useAuth();

  const owner =
    user && item
      ? isOwner(
          user,
          item.user_id || item.owner_id
        )
      : false;

  async function handleDelete() {

    const confirmDelete =
      window.confirm(
        "Delete this item?"
      );

    if (!confirmDelete) return;

    try {

      await deleteItem(item.id);

      alert("Item deleted");

      navigate(-1);

    } catch (err) {

      console.error(err);

      alert("Failed to delete item");
    }
  }

  const imageSrc =
    item.image ||
    item.custom_fields?.image ||
    "https://placehold.co/600x400";

  const card = (
    <div
      className={`itemCard ${
        isHorizontal
          ? "horizontal"
          : ""
      } ${
        isDetails
          ? "details"
          : ""
      }`}
    >

      {!isHorizontal ? (
        <>
          {/* GRID VERSION */}

          <div className="coverWrapper">

            <img
              src={imageSrc}
              alt={item.name}
              className="coverImage"
            />

          </div>

          <div className="cardContent">

            <div className="topRow">

              <div className="categoryBadge">
                {item.category}
              </div>

            </div>

            <h3 className="cardTitle">
              {item.name}
            </h3>

            <p className="cardDescription">
              {item.description}
            </p>

            {!isDetails && (
              <div className="stats">

                <div className="statItem">
                  ${item.price}
                </div>

              </div>
            )}

           {isDetails && (
  <div className="actions">
    {owner && (
      <>
        <Button
          variant="primary"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/items/${item.id}/edit`);
          }}
        >
          Edit
        </Button>

        <Button
          variant="danger"
          onClick={handleDelete}
        >
          Delete
        </Button>
      </>
    )}
  </div>
)}

          </div>
        </>
      ) : (
        <>
          {/* HORIZONTAL VERSION */}

          <div className="horizontalCard">

            <div className="leftSide">

              <img
                src={imageSrc}
                alt={item.name}
                className="horizontalImage"
              />

            </div>

            <div className="rightSide">

              <div className="categoryBadge">
                {item.category}
              </div>

              <h3 className="cardTitle">
                {item.name}
              </h3>

              <p className="cardDescription">
                {item.description}
              </p>

              {!isDetails && (
                <div className="stats">

                  <div className="statItem">
                    ${item.price}
                  </div>

                </div>
              )}

              {!isDetails ? (

                <Button variant="primary">
                  View
                </Button>

              ) : (

                <div className="actions">

                  {owner && (
                    <>
                      <Button
                        variant="primary"
                        onClick={(e) => {

                          e.preventDefault();

                          e.stopPropagation();

                          navigate(
                            `/items/${item.id}/edit`
                          );
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        variant="danger"
                        onClick={handleDelete}
                      >
                        Delete
                      </Button>
                    </>
                  )}

                </div>
              )}

            </div>

          </div>
        </>
      )}

    </div>
  );

  if (!isDetails) {
    return (
      <Link
        to={`/items/${item.id}`}
        className="cardLink"
      >
        {card}
      </Link>
    );
  }

  return card;
}