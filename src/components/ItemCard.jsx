import "../css/ItemCard.css";
import Button from "../ui/Button";

export default function ItemCard({ item }) {
  return (
    <div className="itemCard">

      {/* COVER IMAGE */}
      <div className="coverWrapper">
        <img
          src={item.image}
          alt={item.name}
          className="coverImage"
        />
      </div>

      {/* CARD CONTENT */}
      <div className="cardContent">

        {/* TOP ROW */}
        <div className="topRow">

          {/* PROFILE */}
          <div className="profileSection">
            <img
              src={item.profileImage}
              alt={item.owner}
              className="avatar"
            />
          </div>

          {/* CATEGORY */}
          <div className="categoryBadge">
            {item.category}
          </div>

        </div>

        {/* TITLE */}
        <h3 className="cardTitle">
          {item.name}
        </h3>

        {/* DESCRIPTION */}
        <p className="cardDescription">
          {item.description}
        </p>

        {/* STATS */}
        <div className="stats">

          <div className="statItem">
            💰 ${item.price}
          </div>

        </div>

        {/* BUTTON */}
        <Button variant="primary">
          View
        </Button>

      </div>
    </div>
  );
}