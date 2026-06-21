import React, { useEffect, useState } from "react";
import AlertBanner from "../components/AlertBanner";
import { adminFetchOrders, adminUpdateOrderStatus, adminFetchOrder } from "../api/client";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionAlert, setActionAlert] = useState({ type: '', title: '', message: '' });

  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const ongoing = React.useRef(false);
  const intervalRef = React.useRef(null);

  const POLL_MS = 10000; // poll every 10s

  const load = async () => {
    if (ongoing.current) return;
    ongoing.current = true;
    setLoading(true);
    setFetchError(null);
    try {
      const list = await adminFetchOrders();
      console.log('adminFetchOrders result', list);
      setOrders(list || []);
    } catch (err) {
      console.error("adminFetchOrders error", err);
      setFetchError(err.message || String(err));
    } finally {
      setLoading(false);
      ongoing.current = false;
    }
  };

  const startPolling = () => {
    // avoid duplicate intervals
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      if (document.hidden || selected) return; // pause when tab hidden or modal open
      load();
    }, POLL_MS);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    load();
    startPolling();

    const onVis = () => {
      if (document.hidden) stopPolling(); else startPolling();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // pause polling while a modal is open
  useEffect(() => {
    if (selected) stopPolling(); else startPolling();
  }, [selected]);

  const getNextStatus = (status) => ({
    PLACED: 'PREPARING',
    PREPARING: 'READY',
    READY: 'DELIVERED',
    DISPATCHED: 'DELIVERED',
    DELIVERED: 'COMPLETED'
  })[status] || null;

  const formatStatus = (status) => String(status || '').trim().toUpperCase();

  const advance = async (o) => {
    const next = getNextStatus(formatStatus(o.status));
    if (!next) {
      setActionAlert({ type: 'warning', title: 'Warning!', message: 'Unable to advance this order' });
      return;
    }

    try{
      await adminUpdateOrderStatus(o.id, next);
      load();
    }catch(e){ setActionAlert({ type: 'danger', title: 'Error!', message: 'Unable to update' }); }
  };

  return (
    <div>
      <h1>Live Orders</h1>
      <AlertBanner
        type={actionAlert.type}
        title={actionAlert.title}
        message={actionAlert.message}
        onClose={() => setActionAlert({ type: '', title: '', message: '' })}
      />
      <div className="mt-12">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Products</th>
              <th>Status</th>
              <th>Total</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o=> (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.user?.name} <div className="text-muted">{o.deliveryAddress}</div></td>
                <td>
                  {o.items && o.items.length > 0 ? (
                    o.items.map(it => it.product?.name).filter(Boolean).join(', ')
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td><span className={`status-badge status-${formatStatus(o.status).toLowerCase()}`}>{formatStatus(o.status)}</span></td>
                <td>₹{o.totalPrice}</td>
                <td style={{display:'flex', gap:8}}>
                  <button className="btn btn-primary" onClick={()=>advance(o)}>{getNextStatus(formatStatus(o.status)) ? `${getNextStatus(formatStatus(o.status))}` : 'Done'}</button>
                  <button className="btn btn-ghost" onClick={async ()=>{
                    setLoadingDetails(true);
                    try{
                      const full = await adminFetchOrder(o.id);
                      setSelected(full);
                    }catch(e){ setActionAlert({ type: 'danger', title: 'Error!', message: 'Unable to load order details' }); }
                    setLoadingDetails(false);
                  }}>{loadingDetails ? 'Loading...' : 'Details'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="mt-12 text-muted">Refreshing orders...</div>}
        {fetchError && <div className="mt-12" style={{color:'crimson'}}>Error loading orders: {fetchError}</div>}
      </div>

      {selected && (
        <div className="admin-modal-backdrop" onClick={()=>setSelected(null)}>
          <div className="admin-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Order #{selected.id} — Details</h3>
              <div>
                <button className="btn btn-ghost" onClick={()=>setSelected(null)}>Close</button>
              </div>
            </div>
            <div className="admin-modal-body">
              <div style={{marginBottom:12}}>
                <strong>Customer:</strong> {selected.user?.name} <div className="text-muted">{selected.user?.email}</div>
              </div>
              <div style={{marginBottom:12}}>
                <strong>Delivery Address:</strong>
                <div className="text-muted">{selected.deliveryAddress}</div>
              </div>
              <div style={{marginBottom:12}}>
                <strong>Items:</strong>
                <div>
                  {selected.items?.map(it => (
                    <div key={it.id} style={{padding:10, marginTop:8, borderRadius:8, background:'#fff'}}>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div>
                          <strong>{it.product?.name}</strong>
                          <div className="text-muted">Qty: {it.quantity} • ₹{it.lineTotal}</div>
                        </div>
                        <div>
                          <div className="text-muted">Unit Price: ₹{it.itemPrice}</div>
                        </div>
                      </div>
                      <div style={{marginTop:8}}>
                        <strong>Customization:</strong>
                        <div className="text-muted">
                          {renderCustomization(it.customizationDetails)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <strong>Total:</strong> ₹{selected.totalPrice}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderCustomization(details) {
  if (!details) return <span className="text-muted">—</span>;

  // attempt JSON parse for structured custom cake details
  try {
    const obj = typeof details === 'string' ? JSON.parse(details) : details;
    // pretty render key-values
    return (
      <pre>{JSON.stringify(obj, null, 2)}</pre>
    );
  } catch (e) {
    // fallback to plain text
    return <div>{details}</div>;
  }
}

export default AdminOrders;