import React, { useEffect, useState } from "react";
import AlertBanner from "../components/AlertBanner";
import { adminCreateCoupon, fetchCoupons } from "../api/client";

function AdminCoupons() {
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE",
    discountPercent: 0,
    flatAmount: 0,
    minAmount: 0,
    expiresAt: "",
  });
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: "", title: "", message: "" });

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await fetchCoupons();
      setCoupons(data);
    } catch (error) {
      console.error("Failed to load coupons", error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const submit = async () => {
    const payload = {
      code: form.code.trim(),
      type: form.type,
      discountPercent: form.type === "PERCENTAGE" ? Number(form.discountPercent) || 0 : null,
      flatAmount: form.type === "FLAT" ? Number(form.flatAmount) || 0 : null,
      minAmount: Number(form.minAmount) || 0,
      expiresAt: form.expiresAt || null,
      active: true,
    };

    if (!payload.code) {
      return setAlert({ type: "warning", title: "Warning!", message: "Coupon code is required." });
    }

    if (payload.type === "PERCENTAGE" && payload.discountPercent <= 0) {
      return setAlert({ type: "warning", title: "Warning!", message: "Enter a discount percentage greater than 0." });
    }

    if (payload.type === "FLAT" && payload.flatAmount <= 0) {
      return setAlert({ type: "warning", title: "Warning!", message: "Enter a flat discount amount greater than 0." });
    }

    try {
      await adminCreateCoupon(payload);
      setAlert({ type: "success", title: "Success!", message: "Coupon created." });
      setForm({
        code: "",
        type: "PERCENTAGE",
        discountPercent: 0,
        flatAmount: 0,
        minAmount: 0,
        expiresAt: "",
      });
      await loadCoupons();
    } catch (e) {
      console.error(e);
      setAlert({ type: "danger", title: "Error!", message: "Coupon creation failed. Check console for details." });
    }
  };

  return (
    <div>
      <h1>Coupons & Promotions</h1>
      <AlertBanner
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ type: "", title: "", message: "" })}
      />
      <div className="mt-12 admin-card">
        <div className="mb-8">
          <label>Code</label>
          <input
            className="input"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </div>
        <div className="mb-8">
          <label>Type</label>
          <select
            className="input"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="PERCENTAGE">Percentage</option>
            <option value="FLAT">Flat Amount</option>
          </select>
        </div>

        {form.type === "PERCENTAGE" ? (
          <div className="mb-8">
            <label>Discount %</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.discountPercent}
              onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })}
            />
          </div>
        ) : (
          <div className="mb-8">
            <label>Flat Discount Amount</label>
            <input
              className="input"
              type="number"
              min="0"
              value={form.flatAmount}
              onChange={(e) => setForm({ ...form, flatAmount: Number(e.target.value) })}
            />
          </div>
        )}

        <div className="mb-8">
          <label>Minimum Order Amount</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.minAmount}
            onChange={(e) => setForm({ ...form, minAmount: Number(e.target.value) })}
          />
        </div>
        <div className="mb-8">
          <label>Expires At</label>
          <input
            className="input"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <button className="btn btn-primary" onClick={submit}>
            Create Coupon
          </button>
        </div>
      </div>

      <div className="mt-12 admin-card">
        <h2>Existing Coupons</h2>
        {loading ? (
          <p>Loading coupons…</p>
        ) : coupons.length === 0 ? (
          <p>No active coupons found.</p>
        ) : (
          <div className="coupon-grid">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="coupon-card">
                <div className="coupon-card-header">
                  <div>
                    <strong>{coupon.code}</strong>
                    <div className="coupon-subtitle">
                      {coupon.type === "FLAT"
                        ? `Flat ₹${coupon.flatAmount || 0} off`
                        : `${coupon.discountPercent || 0}% off`}
                    </div>
                  </div>
                  <span className={`coupon-status ${coupon.active ? "active" : "inactive"}`}>
                    {coupon.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="coupon-meta">
                  <span>Minimum order: ₹{coupon.minAmount || 0}</span>
                  <span>{coupon.expiresAt ? `Expires ${coupon.expiresAt}` : "No expiry"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminCoupons;