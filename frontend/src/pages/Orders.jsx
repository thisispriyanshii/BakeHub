import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "./Navbar";
import { fetchMyOrders, getToken, fetchReviewsByOrder, submitReview } from "../api/client";
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

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewed, setReviewed] = useState({});

  const [reviewDrafts, setReviewDrafts] = useState({});

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      setError("Please log in to view your orders.");
      return;
    }

    fetchMyOrders()
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setOrders(list);

        // check delivered orders for existing reviews
        list.filter(o => o.status === 'DELIVERED').forEach(o => {
          fetchReviewsByOrder(o.id).then(res => {
            if (Array.isArray(res) && res.length > 0) {
              setReviewed(prev => ({ ...prev, [o.id]: true }));
            }
          }).catch(() => {});
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
                  <span className={`order-status status-${order.status?.toLowerCase()}`}>
                    {order.status}
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
                {order.status === 'DELIVERED' && !reviewed[order.id] && (
                  <div style={{padding:16, borderTop:'1px solid #eee'}}>
                    <p>Please leave a short review (two sentences) and rating:</p>
                    <textarea rows={2} value={reviewDrafts[order.id]?.text || ''} onChange={(e)=> setReviewDrafts(prev=> ({...prev, [order.id]: {...prev[order.id], text: e.target.value}}))} placeholder="Write two short sentences about your experience" />
                    <div style={{marginTop:8}}>
                      <label>Rating: </label>
                      <select value={reviewDrafts[order.id]?.rating || 5} onChange={(e)=> setReviewDrafts(prev=> ({...prev, [order.id]: {...prev[order.id], rating: Number(e.target.value)}}))}>
                        {[5,4,3,2,1].map(r=> <option key={r} value={r}>{r}</option>)}
                      </select>
                      <button style={{marginLeft:12}} onClick={async ()=>{
                        const draft = reviewDrafts[order.id] || {};
                        const text = (draft.text||'').trim();
                        const sentences = text.split('.').map(s=>s.trim()).filter(Boolean);
                        if (sentences.length < 2) { alert('Please provide two short sentences.'); return; }
                        try {
                          await submitReview({ orderId: order.id, rating: draft.rating || 5, text });
                          setReviewed(prev => ({...prev, [order.id]: true}));
                          alert('Thanks for your review!');
                        } catch(err) { alert(err.message || 'Failed to submit review'); }
                      }}>Submit Review</button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

export default Orders;
