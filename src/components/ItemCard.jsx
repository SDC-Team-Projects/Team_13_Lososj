import React from "react";
import "../css/ItemCard.css";




export default function ItemCard({ item }) {
  return (
    <div className="itemCard">
      <div className="imageWrapper">
        <img
          src={item.image || "https://via.placeholder.com/300"}
          alt={item.name}
        />
      </div>

      <div className="itemContent">
        <h3 className="title">{item.name}</h3>
        <p className="description">{item.description}</p>

        <div className="meta">
          <span>📅 {item.purchaseDate}</span>
          {/* <span>👤 {item.owner}</span> */}
          <span>💰 {item.price}$</span>
          <span>🏷 {item.category}</span>
        </div>
      </div>
    </div>
  );
}