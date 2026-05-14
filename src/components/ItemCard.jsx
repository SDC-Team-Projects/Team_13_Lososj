import "../css/ItemCard.css";
import Button from "../ui/Button";
import { Link } from "react-router-dom";
import { deleteItem } from "../api/items";
import { useNavigate } from "react-router-dom";

export default function ItemCard({
  item,
  layout = "grid",
  mode = "preview",
}) {
  const isHorizontal = layout === "horizontal";
  const isDetails = mode === "details";

  const navigate = useNavigate();

async function handleDelete() {
  const confirmDelete = window.confirm(
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

  const card = (
    <div
      className={`itemCard ${
        isHorizontal ? "horizontal" : ""
      } ${isDetails ? "details" : ""}`}
    >
      {!isHorizontal ? (
        <>
          {/* GRID VERSION */}

          <div className="coverWrapper">
            <img
              src={item.image}
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

            {/* PRICE ONLY IN PREVIEW */}
            {!isDetails && (
              <div className="stats">
                <div className="statItem">
                  💰 ${item.price}
                </div>
              </div>
            )}

            {/* BUTTONS */}
            {!isDetails ? (
              <Button variant="primary">
                View
              </Button>
            ) : (
              <div className="actions">
                <Button variant="secondary">
                  Download PDF
                </Button>

                <Button variant="primary">
                  Edit
                </Button>

                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
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
                src={item.image}
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

              {/* PRICE ONLY IN PREVIEW */}
              {!isDetails && (
                <div className="stats">
                  <div className="statItem">
                    💰 ${item.price}
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              {!isDetails ? (
                <Button variant="primary">
                  View
                </Button>
              ) : (
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
          </div>
        </>
      )}
    </div>
  );

  // PREVIEW MODE => clickable card
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

  // DETAILS MODE => no link
  return card;
}