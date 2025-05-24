import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:8082';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image_url: ''
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 1000000 });
  const navigate = useNavigate();

  const handleProductClick = (id) => {
    navigate(`/products/${id}`);
  };

  useEffect(() => {
    fetchProducts();
  }, [page, pageSize, filters]);

  const fetchProducts = async () => {
    const res = await fetch(
      `${API_URL}/products?page=${page}&pageSize=${pageSize}&minPrice=${filters.minPrice}&maxPrice=${filters.maxPrice}`
    );
    const data = await res.json();
    setProducts(data);
  };

  const createProduct = async () => {
    const payload = {
      ...newProduct,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
    };

    await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    fetchProducts();
  };

  const deleteProduct = async (id) => {
    await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    fetchProducts();
  };
  const [filterError, setFilterError] = useState("");

const handleApplyFilters = () => {
  const min = Number(filters.minPrice);
  const max = Number(filters.maxPrice);

  if (isNaN(min) || isNaN(max)) {
    setFilterError("Введите корректные значения.");
    return;
  }
  if (min < 0 || max < 0) {
    setFilterError("Цены не могут быть отрицательными.");
    return;
  }
  if (min > max) {
    setFilterError("Минимальная цена не может быть больше максимальной.");
    return;
  }
  setFilterError("");
  fetchProducts();
};

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Products</h1>

      {/* Create Product */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Create Product</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input className="border p-2 rounded" placeholder="Name" onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          <input className="border p-2 rounded" placeholder="Description" onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} />
          <input className="border p-2 rounded" type="number" placeholder="Price" onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          <input className="border p-2 rounded" type="number" placeholder="Stock" onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} />
          <input className="border p-2 rounded col-span-1 md:col-span-2" placeholder="Image URL" onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })} />
        </div>
        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded" onClick={createProduct}>Create</button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="flex gap-4 flex-col md:flex-row">
          <input className="border p-2 rounded w-full" 
          type="number" min= "0" placeholder="Min Price" onChange={(e) => 
          setFilters({ ...filters, minPrice: e.target.value })} />
          <input className="border p-2 rounded w-full" 
          type="number" min = "0" placeholder="Max Price" onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
<button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={handleApplyFilters}>Apply</button>
        </div>
      </div>

      {/* Page size */}
      <div className="mb-4">
        <label className="mr-2 font-medium">Page size:</label>
        <select className="border p-2 rounded" value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))}>
          <option value={1}>1</option>
          <option value={5}>5</option>
          <option value={10}>10</option>
        </select>
      </div>

      {/* Product List */}
        {filterError && (
   <p className="text-red-600 mt-2">{filterError}</p>
 )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.ID}
            className="border p-4 rounded-lg shadow hover:shadow-lg cursor-pointer bg-white"
            onClick={() => handleProductClick(p.ID)}
          >
            <img
              src={p.image_url || "https://via.placeholder.com/150"}
              alt={p.name}
              className="w-full h-40 object-cover rounded mb-2"
            />
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-gray-600 mb-2">{p.description}</p>
            <p className="text-green-700 font-semibold mb-2">${p.price}</p>
            <p className="text-sm text-gray-500">In Stock: {p.stock}</p>
            <button
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded"
              onClick={(e) => {
                e.stopPropagation();
                deleteProduct(p.ID);
              }}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          Prev
        </button>
        <span className="font-semibold">Page {page}</span>
        <button
          className="px-4 py-2 bg-gray-200 rounded"
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
