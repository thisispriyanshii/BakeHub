import React, { useState } from "react";
import { adminCreateCoupon } from "../api/client";

function AdminCoupons() {
  const [form, setForm] = useState({ code:'', type:'PERCENTAGE', value:0, expiresAt:'', minOrderValue:0, usageLimit:0 });

  const submit = async () => {
    try{
      await adminCreateCoupon(form);
      alert('Coupon created');
      setForm({ code:'', type:'PERCENTAGE', value:0, expiresAt:'', minOrderValue:0, usageLimit:0 });
    }catch(e){ alert('create failed'); }
  };

  return (
    <div>
      <h1>Coupons & Promotions</h1>
      <div className="mt-12 admin-card">
        <div className="mb-8">
          <label>Code</label>
          <input className="input" value={form.code} onChange={e=>setForm({...form, code:e.target.value})} />
        </div>
        <div className="mb-8">
          <label>Type</label>
          <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat Amount</option>
          </select>
        </div>
        <div className="mb-8">
          <label>Value</label>
          <input className="input" type="number" value={form.value} onChange={e=>setForm({...form, value:Number(e.target.value)})} />
        </div>
        <div className="mb-8">
          <label>Expires At</label>
          <input className="input" type="date" value={form.expiresAt} onChange={e=>setForm({...form, expiresAt:e.target.value})} />
        </div>
        <div className="mb-8">
          <label>Min Order Value</label>
          <input className="input" type="number" value={form.minOrderValue} onChange={e=>setForm({...form, minOrderValue:Number(e.target.value)})} />
        </div>
        <div className="mb-8">
          <label>Usage Limit</label>
          <input className="input" type="number" value={form.usageLimit} onChange={e=>setForm({...form, usageLimit:Number(e.target.value)})} />
        </div>
        <div style={{marginTop:8}}>
          <button className="btn btn-primary" onClick={submit}>Create Coupon</button>
        </div>
      </div>
    </div>
  );
}

export default AdminCoupons;