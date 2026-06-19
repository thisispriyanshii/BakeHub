import React from "react";
import "./DetailCard.css";

function DetailCard({ product, reversed, quantity, onIncrement, onDecrement }) {
  return (
    <div className={`detail-card ${reversed ? "reverse" : ""}`}>
      <div className="card-image">
        <img src={product.imageUrl} alt={product.name} />
      </div>
      <div className="card-copy">
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        {product.calories != null && (
          <div className="calories-label">
            <span className="fire-icon">🔥</span>
            <span>{product.calories} kcal</span>
          </div>
        )}
        <div className="card-footer">
          <span className="price-bubble">₹{product.price.toFixed(2)}</span>
          <div className="cart-controls">
            <button type="button" onClick={() => onDecrement(product.id)}>-</button>
            <span>{quantity}</span>
            <button type="button" onClick={() => onIncrement(product.id)}>+</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DetailCard;
