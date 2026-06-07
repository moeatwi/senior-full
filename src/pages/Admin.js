import { useState, useEffect } from "react";
import { toast } from "sonner";
import { categories } from "../data/products";
import { productService, adminService } from '../services/AdminService';
import { useAuth } from "../context/AuthContext";
import { SpecEditor } from "../components/SpecEditor";
import "../styles/Admin.css";

const PAGE_SIZE = 10;

const EMPTY_FORM = {
  pid: "",
  name: "",
  category: "",
  subcategory: "",
  price: "",
  stock: "",
  availability: "",
  description: "",
  image: "",
  featured: false,
  newarrival: true,
  bestseller: false,
  specs: {}
};

export const Admin = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [activeTab, setActiveTab] = useState("products");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / PAGE_SIZE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Keep current page in bounds when products list shrinks
  useEffect(() => {
    if (currentPage > 1 && currentPage > Math.ceil(products.length / PAGE_SIZE)) {
      setCurrentPage(prev => Math.max(1, prev - 1));
    }
  }, [products.length, currentPage]);

  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  useEffect(() => {
    fetchProducts();
    fetchAllowedEmails();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllowedEmails = async () => {
    try {
      const data = await adminService.getAllowedEmails();
      setAllowedEmails(data || []);
    } catch (error) {
      console.error("Error fetching allowed emails:", error);
      toast.error("Failed to fetch allowed admin emails");
    }
  };

  const openAddModal = () => {
    setIsAddingNew(true);
    setEditingProduct(null);
    const defaultCat = categories[0];
    setFormData({
      ...EMPTY_FORM,
      category: defaultCat?.id || "",
      subcategory: defaultCat?.subcategories?.[0] || "",
      availability: "In Stock",
      image: "https://images.unsplash.com/photo-1745847768408-b7b83796cae6?w=400"
    });
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setIsAddingNew(false);
    setFormData({
      pid: product.pid || "",
      name: product.name || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      price: String(product.price ?? ""),
      stock: String(product.stock ?? ""),
      availability: product.availability || "",
      description: product.description || "",
      image: product.image || "",
      featured: product.featured || false,
      newarrival: product.newarrival || false,
      bestseller: product.bestseller || false,
      specs: product.specs
        ? (typeof product.specs === "object"
            ? product.specs
            : (() => { try { return JSON.parse(product.specs); } catch { return {}; } })())
        : {}
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setIsAddingNew(false);
    setFormData(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: type === "checkbox" ? checked : value };
      if (name === "category") {
        const cat = categories.find(c => c.id === value);
        next.subcategory = cat?.subcategories?.[0] || "";
        next.specs = {};
      }
      if (name === "subcategory") next.specs = {};
      return next;
    });
  };

  const handleSpecChange = (key, value) => {
    setFormData(prev => ({ ...prev, specs: { ...prev.specs, [key]: value } }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const specsObj = Object.fromEntries(
      Object.entries(formData.specs || {}).filter(([, v]) => v !== "")
    );

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      specs: Object.keys(specsObj).length > 0 ? specsObj : null
    };

    try {
      if (isAddingNew) {
        const pid = formData.pid.trim() || `${formData.category}-${Date.now()}`;
        const saved = await productService.create({ ...payload, pid });
        setProducts(prev => [saved, ...prev]);
        setCurrentPage(1);
        toast.success("Product added successfully!");
      } else {
        const saved = await productService.update(editingProduct.pid, payload);
        setProducts(prev => prev.map(p => p.pid === editingProduct.pid ? saved : p));
        toast.success("Product updated successfully!");
      }
      closeModal();
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(`Failed to ${isAddingNew ? "add" : "update"} product`);
    }
  };

  const handleDelete = async (pid) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await productService.delete(pid);
      setProducts(prev => prev.filter(p => p.pid !== pid));
      toast.success("Product deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const addAllowedEmail = async () => {
    if (!newEmail) { toast.error("Please enter an email address."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) { toast.error("Please enter a valid email address."); return; }
    try {
      await adminService.addAllowedEmail(newEmail);
      toast.success(`Email ${newEmail} added to allowed list.`);
      setNewEmail("");
      fetchAllowedEmails();
    } catch (error) {
      toast.error(error.message.includes("duplicate")
        ? "This email is already in the allowed list."
        : "Failed to add email to allowed list.");
    }
  };

  const removeAllowedEmail = async (id, email) => {
    if (user && user.email === email) {
      toast.error("You cannot remove your own email from the list.");
      return;
    }
    if (!window.confirm(`Are you sure you want to remove ${email}?`)) return;
    try {
      await adminService.removeAllowedEmail(id);
      toast.success(`Email ${email} removed from allowed list.`);
      fetchAllowedEmails();
    } catch (error) {
      toast.error("Failed to remove email from allowed list.");
    }
  };

  const statsConfig = [
    {
      label: "Total Products",
      count: products.length,
      color: "primary",
      svg: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
    },
    {
      label: "In Stock",
      count: products.filter(p => p.availability === "In Stock").length,
      color: "success",
      svg: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      label: "Low Stock",
      count: products.filter(p => p.stock < 10 && p.stock > 0).length,
      color: "warning",
      svg: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4"
    },
    {
      label: "Out of Stock",
      count: products.filter(p => p.availability === "Out of Stock").length,
      color: "danger",
      svg: "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    }
  ];

  if (loading && activeTab === "products") {
    return (
      <div className="container-fluid py-4">
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      {/* ── Modal ── */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" onClick={closeModal} />
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {isAddingNew ? "Add New Product" : "Edit Product"}
                  </h5>
                  <button type="button" className="btn-close" onClick={closeModal} />
                </div>

                <div className="modal-body">
                  <form id="product-form" onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Product ID</label>
                        <input
                          type="text"
                          name="pid"
                          value={formData.pid}
                          onChange={handleChange}
                          placeholder="Auto-generated if empty"
                          className="form-control"
                          disabled={!isAddingNew}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Product Name</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label">Subcategory</label>
                        <select
                          name="subcategory"
                          value={formData.subcategory}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="">Select subcategory</option>
                          {(categories.find(c => c.id === formData.category)?.subcategories || []).map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Price ($)</label>
                        <input
                          type="number"
                          name="price"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          step="0.01"
                          min="0"
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Stock</label>
                        <input
                          type="number"
                          name="stock"
                          value={formData.stock}
                          onChange={handleChange}
                          required
                          min="0"
                          className="form-control"
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label">Availability</label>
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleChange}
                          required
                          className="form-select"
                        >
                          <option value="In Stock">In Stock</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Image URL</label>
                        <input
                          type="text"
                          name="image"
                          value={formData.image}
                          onChange={handleChange}
                          className="form-control"
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label">Specifications</label>
                        <SpecEditor
                          subcategory={formData.subcategory}
                          specs={formData.specs}
                          onChange={handleSpecChange}
                        />
                      </div>

                      <div className="col-md-4">
                        <div className="form-check mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="featured"
                            checked={formData.featured}
                            onChange={handleChange}
                            id="featured"
                          />
                          <label className="form-check-label" htmlFor="featured">
                            Featured Product
                          </label>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-check mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="newarrival"
                            checked={formData.newarrival}
                            onChange={handleChange}
                            id="newarrival"
                          />
                          <label className="form-check-label" htmlFor="newarrival">
                            New Arrival
                          </label>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="form-check mt-4">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="bestseller"
                            checked={formData.bestseller}
                            onChange={handleChange}
                            id="bestseller"
                          />
                          <label className="form-check-label" htmlFor="bestseller">
                            Best Seller
                          </label>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" form="product-form" className="btn btn-primary">
                    {isAddingNew ? "Add Product" : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Page header ── */}
      <section className="text-center mb-4">
        <h1 className="display-4 fw-bold">Admin Dashboard</h1>
        <p className="lead">Manage your product inventory and admin access</p>
        <div className="d-flex justify-content-center mb-3">
          <button
            className={`btn ${activeTab === "products" ? "btn-primary" : "btn-outline-primary"} me-2`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`btn ${activeTab === "admins" ? "btn-primary" : "btn-outline-primary"}`}
            onClick={() => setActiveTab("admins")}
          >
            Admin Access
          </button>
        </div>
      </section>

      {/* ── Products tab ── */}
      {activeTab === "products" && (
        <>
          <div className="row g-4 mb-4">
            {statsConfig.map((item, index) => (
              <div key={index} className="col-12 col-sm-6 col-lg-3">
                <div className="card shadow-sm h-100 d-flex flex-row align-items-center p-3">
                  <div
                    className={`bg-${item.color} bg-opacity-10 text-${item.color} rounded-circle d-flex align-items-center justify-content-center me-3`}
                    style={{ width: "3.5rem", height: "3.5rem" }}
                  >
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width={32} height={32}>
                      <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d={item.svg} />
                    </svg>
                  </div>
                  <div>
                    <div className="fs-2 fw-bold">{item.count}</div>
                    <div className="text-muted">{item.label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="d-flex justify-content-end mb-4">
            <button onClick={openAddModal} className="btn btn-primary d-flex align-items-center gap-2">
              <svg fill="none" stroke="currentColor" width={20} height={20} viewBox="0 0 24 24">
                <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add New Product
            </button>
          </div>

          <div className="card p-4">
            <h2 className="h4 mb-3">Product Inventory</h2>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead className="table-light">
                  <tr>
                    {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(
                      (title, i) => <th key={i}>{title}</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map(product => {
                    const stockClass =
                      product.stock === 0 ? "bg-danger"
                      : product.stock < 10 ? "bg-warning text-dark"
                      : "bg-success";

                    return (
                      <tr key={product.pid}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <img src={product.image} className="product-thumb" alt={product.name} />
                            <span className="product-name small">{product.name}</span>
                          </div>
                        </td>
                        <td>{product.category}</td>
                        <td>${product.price.toFixed(2)}</td>
                        <td>
                          <span className={`badge rounded-pill ${stockClass}`}>{product.stock}</span>
                        </td>
                        <td>{product.availability}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button
                              type="button"
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => openEditModal(product)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDelete(product.pid)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <span className="text-muted small">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, products.length)} of {products.length} products
                </span>
                <nav>
                  <ul className="pagination pagination-sm mb-0">
                    <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(p => p - 1)}>
                        &lsaquo;
                      </button>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${page === currentPage ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setCurrentPage(page)}>
                          {page}
                        </button>
                      </li>
                    ))}
                    <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setCurrentPage(p => p + 1)}>
                        &rsaquo;
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Admins tab ── */}
      {activeTab === "admins" && (
        <div className="card p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 m-0">Admin Access Management</h2>
            <span className="badge bg-primary">Logged in as {user?.email}</span>
          </div>

          <div className="mb-4">
            <h5 className="mb-3">Allowed Admin Emails</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Added Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allowedEmails.map(emailRecord => (
                    <tr key={emailRecord.id}>
                      <td>{emailRecord.email}</td>
                      <td>{new Date(emailRecord.created_at).toLocaleDateString()}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeAllowedEmail(emailRecord.id, emailRecord.email)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {allowedEmails.length === 0 && (
                <p className="text-muted text-center mt-3">No additional admin emails have been added.</p>
              )}
            </div>
          </div>

          <div className="card bg-light p-3">
            <h5 className="mb-3">Add New Admin Email</h5>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAllowedEmail()}
              />
              <button className="btn btn-primary" onClick={addAllowedEmail}>
                Add Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
