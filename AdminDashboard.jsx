import React, { useState, useEffect } from "react";
import axios from "axios";

const AdminDashboard = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", image: "" });
  const [salesReport, setSalesReport] = useState(null);
  const [login, setLogin] = useState({ username: "", password: "" });

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleLogin = async () => {
    try {
      const res = await axios.post("/login", login);
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (error) {
      alert("Login failed");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get("/products", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const addProduct = async () => {
    try {
      await axios.post("/products", newProduct, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to add product");
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product");
    }
  };

  const fetchSalesReport = async () => {
    try {
      const res = await axios.get("/sales-report", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesReport(res.data);
    } catch (error) {
      console.error("Failed to fetch sales report");
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      {!token ? (
        <div>
          <h2>Login</h2>
          <input type="text" placeholder="Username" onChange={(e) => setLogin({ ...login, username: e.target.value })} />
          <input type="password" placeholder="Password" onChange={(e) => setLogin({ ...login, password: e.target.value })} />
          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        <div>
          <h2>Admin Dashboard</h2>
          <button onClick={fetchSalesReport}>Get Sales Report</button>
          {salesReport && <pre>{JSON.stringify(salesReport, null, 2)}</pre>}

          <h3>Products</h3>
          <ul>
            {products.map((product) => (
              <li key={product.id}>
                {product.name} - ${product.price} <button onClick={() => deleteProduct(product.id)}>Delete</button>
              </li>
            ))}
          </ul>

          <h3>Add Product</h3>
          <input type="text" placeholder="Name" onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input type="number" placeholder="Price" onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <button onClick={addProduct}>Add</button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
