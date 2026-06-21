import React, { useEffect, useState } from "react";
import AlertBanner from "../components/AlertBanner";
import { adminFetchProducts, adminCreateProduct, adminDeleteProduct, adminUpdateProduct, adminUploadImage, adminFetchCategories } from "../api/client";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', description:'', price:0, categoryId:null, imageUrl:'',  tags:'', calories:0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [alert, setAlert] = useState({ type: '', title: '', message: '' });
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const load = () => {
    setLoading(true);
    adminFetchProducts().then(list=>setProducts(list)).catch(()=>{}).finally(()=>setLoading(false));
  };

  useEffect(()=>{ load(); adminFetchCategories().then(c=>setCategories(c)).catch(()=>{}); }, []);

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    try {
      const data = await adminUploadImage(f);
      setForm({...form, imageUrl: data.url});
    } catch(err){ setAlert({ type: 'danger', title: 'Error!', message: err.message || 'Upload failed' }); }
  };

  const handleAdd = async () => {
    const payload = { 
      ...form, 
      price: Number(form.price),
      calories: form.calories !== undefined ? Number(form.calories) : undefined,
      category: form.categoryId ? { id: form.categoryId } : null,
      tags: form.tags ? form.tags.split(',').map(t=>t.trim()).filter(Boolean) : []
    };
    try{
      if (isEditing && editingId) {
        await adminUpdateProduct(editingId, payload);
      } else {
        await adminCreateProduct(payload);
      }
      setShowAdd(false);
      setIsEditing(false);
      setEditingId(null);
      setForm({ name:'', description:'', price:0, categoryId:null, imageUrl:'',  tags:'', calories:0 });
      load();
    }catch(e){ setAlert({ type: 'danger', title: 'Error!', message: e.message || (isEditing ? 'Update failed' : 'Create failed') }); }
  };



  const handleDelete = async (id) => {
    setDeleteCandidate(id);
  };

  const confirmDelete = async () => {
    if (!deleteCandidate) return;
    try {
      await adminDeleteProduct(deleteCandidate);
      setAlert({ type: 'success', title: 'Deleted!', message: 'Product has been removed.' });
    } catch (err) {
      const msg = err?.message || 'Delete failed';
      setAlert({ type: 'danger', title: 'Error!', message: msg });
    } finally {
      setDeleteCandidate(null);
      load();
    }
  };

  const cancelDelete = () => {
    setDeleteCandidate(null);
  };

  return (
    <div>
      <h1>Menu & Products</h1>
      <AlertBanner
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ type: '', title: '', message: '' })}
      />
      <div className="mt-12">
        <button className="btn btn-primary" onClick={()=>setShowAdd(true)}>Add Product</button>
      </div>

      <AlertBanner
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ type: '', title: '', message: '' })}
      />

      {deleteCandidate && (
        <div className="alert alert-warning alert-dismissible fade show" role="alert">
          <strong>Warning!</strong> Are you sure you want to delete this product?
          <div className="mt-3">
            <button className="btn btn-sm btn-danger me-2" onClick={confirmDelete}>Yes, delete</button>
            <button className="btn btn-sm btn-secondary" onClick={cancelDelete}>Cancel</button>
          </div>
        </div>
      )}

      {showAdd && (
        <div className="mt-12 admin-card">
          <div className="mb-8">
            <label>Name</label>
            <input className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </div>
          <div className="mb-8">
            <label>Description</label>
            <textarea className="input" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          </div>
          <div className="mb-8">
            <label>Price</label>
            <input className="input" type="number" value={form.price} onChange={e=>setForm({...form, price:e.target.value})} />
          </div>
          <div className="mb-8">
            <label>Calories</label>
            <input className="input" type="number" value={form.calories} onChange={e=>setForm({...form, calories: e.target.value})} />
          </div>
          <div className="mb-8">
            <label>Category</label>
            <select className="input" value={form.categoryId||''} onChange={e=>setForm({...form, categoryId: e.target.value || null})}>
              <option value="">-- choose --</option>
              {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="mb-8">
            <label>Image</label>
            <input className="input" type="file" accept="image/*" onChange={handleFile} />
            {form.imageUrl && (<div className="mt-12"><img src={form.imageUrl} style={{maxWidth:120}} alt="preview"/></div>)}
          </div>
          <div className="mb-8">
            <label>Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} />
          </div>
          <div style={{marginTop:8}}>
            <button className="btn btn-primary" onClick={handleAdd}>{isEditing ? 'Save Changes' : 'Create'}</button>
            <button className="btn btn-ghost" onClick={()=>{ setShowAdd(false); setIsEditing(false); setEditingId(null); setForm({ name:'', description:'', price:0, categoryId:null, imageUrl:'', tags:'', calories:0 }); }} style={{marginLeft:8}}>Cancel</button>
          </div>
        </div>
      )}

      <div className="product-grid">
        {products.map(p=> (
          <div key={p.id} className="product-card">
            <img src={p.imageUrl} alt={p.name} />
            <div className="body">
              <h4>{p.name}</h4>
              <p>{p.description}</p>
              <p>₹{p.price}</p>
            </div>
              <div className="product-actions">
                <button className="btn btn-ghost" onClick={()=>{
                  // open form for editing
                  setShowAdd(true);
                  setIsEditing(true);
                  setEditingId(p.id);
                  setForm({
                    name: p.name || '',
                    description: p.description || '',
                    price: p.price || 0,
                    categoryId: p.category?.id || p.categoryId || null,
                    imageUrl: p.imageUrl || '',
                    tags: p.tags ? p.tags.join(',') : '',
                    calories: p.calories || 0
                  });
                }} style={{marginLeft:6}}>Modify</button>
                <button className="btn" onClick={()=>handleDelete(p.id)} style={{marginLeft:6}}>Delete</button>
              </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default AdminProducts;