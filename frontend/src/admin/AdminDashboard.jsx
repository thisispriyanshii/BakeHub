import React, { useEffect, useState } from "react";
import { adminFetchOrders, adminFetchProducts } from "../api/client";

function AdminDashboard() {
  const [ordersCount, setOrdersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);

  useEffect(() => {
    adminFetchOrders().then(list => setOrdersCount(list.length)).catch(()=>{});
    adminFetchProducts().then(list => setProductsCount(list.length)).catch(()=>{});
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <div className="mt-12 admin-row">
        <div className="admin-card" style={{flex:1}}>
          <h3>Total Orders</h3>
          <p style={{fontSize:24, margin:0}}>{ordersCount}</p>
        </div>
        <div className="admin-card" style={{flex:1}}>
          <h3>Total Products</h3>
          <p style={{fontSize:24, margin:0}}>{productsCount}</p>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;