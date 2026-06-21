import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import AlertBanner from "../components/AlertBanner";
import { fetchMyOrders, getToken, fetchReviews, fetchReviewsByOrder, submitReview } from "../api/client";
import "./Orders.css";

function parseCustomizationDetails(rawDetails) {
  if (!rawDetails) {
    return null;
  }

  try {
    return JSON.parse(rawDetails);
  } catch {
    return { summary: rawDetails };
  }
}

function normalizeStatus(status) {
  return String(status || "").trim().toUpperCase();
}

function formatStatus(status) {
  const normalized = normalizeStatus(status);
  return normalized ? `${normalized.charAt(0)}${normalized.slice(1).toLowerCase()}` : "";
}

function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [topReviews, setTopReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState({});
  const [reviewDrafts, setReviewDrafts] = useState({});
  const [alert, setAlert] = useState({ type: "", title: "", message: "" });

  const isDeliveredOrder = (order) => normalizeStatus(order?.status) === "DELIVERED";

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setError("Please log in to view your orders.");
      return;
    }

    Promise.all([
      fetchMyOrders(),
      fetchReviews(4.0, 5)
    ])
      .then(([ordersData, recentReviews]) => {
        const list = Array.isArray(ordersData) ? ordersData : [];
        const sortedOrders = [...list].sort((a, b) => {
          const statusA = normalizeStatus(a.status);
          const statusB = normalizeStatus(b.status);

          if (statusA === "PENDING" && statusB !== "PENDING") return -1;
          if (statusB === "PENDING" && statusA !== "PENDING") return 1;
          if (statusA === "DELIVERED" && statusB !== "DELIVERED") return -1;
          if (statusB === "DELIVERED" && statusA !== "DELIVERED") return 1;
          return new Date(b.orderDate || b.updatedAt || 0) - new Date(a.orderDate || a.updatedAt || 0);
        });

        setOrders(sortedOrders);
        setCurrentOrder(sortedOrders[0] || null);
        setTopReviews(Array.isArray(recentReviews) ? recentReviews.slice(0, 3) : []);

        sortedOrders.filter(isDeliveredOrder).forEach((o) => {
          fetchReviewsByOrder(o.id)
            .then((res) => {
              if (Array.isArray(res) && res.length > 0) {
                setReviewed((prev) => ({ ...prev, [o.id]: true }));
              }
            })
            .catch(() => {});
        });
      })
      .catch((fetchError) => {
        setError(fetchError.message || "Unable to load orders.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="orders-page">
      <Navbar />
      <section className="orders-hero">
        <h1>My Orders</h1>
        <p>Track your custom cake requests and celebration orders.</p>
      </section>

      <AlertBanner
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ type: "", title: "", message: "" })}
      />

      <main className="orders-content">
        {loading && <p className="orders-message">Loading your orders...</p>}
        {!loading && error && (
          <div className="orders-message error">
            <p>{error}</p>
            <Link to="/login">Go to Login</Link>
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <p className="orders-message">No orders yet. Design a custom cake to get started.</p>
        )}

        <div className="orders-grid">
          <section className="orders-list">
            {orders.map((order) => {
              const item = order.items?.[0];
              const details = parseCustomizationDetails(item?.customizationDetails);

              const isCustom = Boolean(
                details && (
                  details.occasion || details.shape || details.flavor || details.weight ||
                  details.frosting || (Array.isArray(details.toppings) && details.toppings.length > 0) ||
                  details.message || details.deliveryDate || details.deliveryTime
                )
              );

              return (
                <article key={order.id} className="order-card">
                  <div className="order-card-head">
                    <div>
                      <span>Order #{order.id}</span>
                      <strong>{item?.product?.name || "Custom Cake"}</strong>
                    </div>
                    <span className={`order-status status-${normalizeStatus(order.status).toLowerCase()}`}>
                      {formatStatus(order.status)}
                    </span>
                  </div>

                  {isCustom ? (
                    <div className="order-details">
                      {details.occasion && (
                        <p><span>Occasion</span><strong>{details.occasion}</strong></p>
                      )}
                      {details.shape && (
                        <p><span>Shape</span><strong>{details.shape}</strong></p>
                      )}
                      {details.flavor && (
                        <p><span>Flavor</span><strong>{details.flavor}</strong></p>
                      )}
                      {details.weight && (
                        <p><span>Weight</span><strong>{details.weight}</strong></p>
                      )}
                      {details.frosting && (
                        <p><span>Frosting</span><strong>{details.frosting}</strong></p>
                      )}
                      {Array.isArray(details.toppings) && details.toppings.length > 0 && (
                        <p><span>Toppings</span><strong>{details.toppings.join(", ")}</strong></p>
                      )}
                      {details.message && (
                        <p><span>Message</span><strong>{details.message}</strong></p>
                      )}
                      {details.deliveryDate && details.deliveryTime && (
                        <p>
                          <span>Delivery</span>
                          <strong>{details.deliveryDate} · {details.deliveryTime}</strong>
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="order-details">
                      <p>
                        <span>Items</span>
                        <strong>
                          {order.items?.map((it) => `${it.product?.name}${it.quantity && it.quantity > 1 ? ` x${it.quantity}` : ''}`).join(', ')}
                        </strong>
                      </p>
                    </div>
                  )}

                  <div className="order-card-footer">
                    <span>{order.deliveryAddress}</span>
                    <strong>₹{Number(order.totalPrice).toFixed(2)}</strong>
                  </div>
                  {isDeliveredOrder(order) && !reviewed[order.id] && (
                    <div className="review-entry">
                      <p>Please leave a short review (two sentences) and rating:</p>
                      <textarea rows={2} value={reviewDrafts[order.id]?.text || ''} onChange={(e)=> setReviewDrafts(prev=> ({...prev, [order.id]: {...prev[order.id], text: e.target.value}}))} placeholder="Write two short sentences about your experience" />
                      <div className="review-controls">
                        <label>Rating:</label>
                        <select value={reviewDrafts[order.id]?.rating || 5} onChange={(e)=> setReviewDrafts(prev=> ({...prev, [order.id]: {...prev[order.id], rating: Number(e.target.value)}}))}>
                          {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={async ()=>{
                          const draft = reviewDrafts[order.id] || {};
                          const text = (draft.text||'').trim();
                          const sentences = text.split('.').map(s=>s.trim()).filter(Boolean);
                          if (sentences.length < 2) { setAlert({ type: 'warning', title: 'Warning!', message: 'Please provide two short sentences.' }); return; }
                          try {
                            await submitReview({ orderId: order.id, rating: draft.rating || 5, text });
                            setReviewed(prev => ({...prev, [order.id]: true}));
                            setAlert({ type: 'success', title: 'Success!', message: 'Thanks for your review!' });
                          } catch(err) { setAlert({ type: 'danger', title: 'Error!', message: err.message || 'Failed to submit review' }); }
                        }}>Submit Review</button>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </section>

          <aside className="orders-sidebar">
            <div className="current-order-panel">
              <h2>Current Order</h2>
              {currentOrder ? (
                <>
                    <p className="current-order-meta">#{currentOrder.id} · {formatStatus(currentOrder.status)}</p>
                    <p>{currentOrder.items?.map((it) => `${it.product?.name}${it.quantity && it.quantity > 1 ? ` x${it.quantity}` : ''}`).join(', ') || 'No items listed'}</p>
                    <p><strong>₹{Number(currentOrder.totalPrice).toFixed(2)}</strong></p>
                    <p>{currentOrder.deliveryAddress}</p>
                    {isDeliveredOrder(currentOrder) && !reviewed[currentOrder.id] && (
                      <div className="current-order-review-cta">
                        <strong>Your order is delivered.</strong>
                        <p>Please share a quick review from the order card below.</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p>No active order yet.</p>
                )}
              </div>

              <div className="top-reviews-panel">
              <h2>Top Reviews</h2>
              {topReviews.length > 0 ? (
                <ul>
                  {topReviews.map((review) => (
                    <li key={review.id}>
                      <p>“{review.text}”</p>
                      <small>{review.rating} ★</small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No top reviews yet. Your feedback helps us improve.</p>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Orders;
