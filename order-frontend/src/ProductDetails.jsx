import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const DEFAULT_IMAGE = "https://via.placeholder.com/200";

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image_url: ""
  });

  useEffect(() => {
    axios.get(`http://localhost:8082/products/${id}`)
      .then(res => {
        setProduct(res.data);
        setForm(res.data);
      });
  }, [id]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

 const handleUpdate = () => {
  const payload = {
    ...form,
    price: parseFloat(form.price),
    stock: parseInt(form.stock),
  };

  axios.put(`http://localhost:8082/products/${id}`, payload)
    .then(res => alert("Product updated"))
    .catch(err => {
      console.error(err);
      alert("Update failed");
    });
};


  if (!product) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Product Details</h2>
      <img
        src={form.image_url || DEFAULT_IMAGE}
        alt="product"
        className="w-64 h-64 object-cover border mb-4"
      />
      <div className="space-y-2">
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
        />
        <input
          type="number"
          name="price"
          value={form.price}
          onChange={handleChange}
          placeholder="Price"
        />
        <input
          type="number"
          name="stock"
          value={form.stock}
          onChange={handleChange}
          placeholder="Stock"
        />
        <input
          type="text"
          name="image_url"
          value={form.image_url}
          onChange={handleChange}
          placeholder="Image URL"
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={handleUpdate}>
          Update Product
        </button>
      </div>
    </div>
  );
}

export default ProductDetails;
