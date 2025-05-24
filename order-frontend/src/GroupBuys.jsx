import { useEffect, useState } from 'react';
import Select from 'react-select';

export default function GroupBuys() {
  const [groupBuys, setGroupBuys] = useState([]);
  const [selectedGroupBuy, setSelectedGroupBuy] = useState(null);
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product: null,
    discount: 0,
    minParticipants: 1,
    status: 'active',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchGroupBuys();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:8082/products');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      setError('Failed to load products.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGroupBuys = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:8082/groupbuys');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setGroupBuys(data);
    } catch (error) {
      setError('Failed to load group buys.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOneGroupBuy = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8082/groupbuys/${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setSelectedGroupBuy(data);
    } catch (error) {
      setError('Failed to load group buy details.');
    } finally {
      setIsLoading(false);
    }
  };

  const createGroupBuy = async () => {
    if (!formData.product?.value || formData.discount <= 0 || formData.minParticipants <= 0) {
      setError('Please provide a valid product, discount, and minimum participants.');
      return;
    }

    const groupBuyData = {
      product_id: formData.product.value,
      discount: formData.discount,
      min_participants: formData.minParticipants,
      status: formData.status,
    };

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:8082/groupbuys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(groupBuyData),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      await res.json();
      setFormData({ product: null, discount: 0, minParticipants: 1, status: 'active' });
      setError('');
      fetchGroupBuys();
    } catch (error) {
      setError(`Failed to create group buy: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const joinGroupBuy = async (id) => {
    if (!id) {
      setError('Please select a group buy to join.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8082/groupbuys/${id}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupbuy_id: id }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      await res.json();
      setError('');
      fetchGroupBuys();
    } catch (error) {
      setError(`Failed to join group buy: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGroupBuy = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8082/groupbuys/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      fetchGroupBuys();
    } catch (error) {
      setError(`Failed to delete group buy: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const productOptions = products.map(p => ({
    value: p.ID,
    label: `${p.name} — $${p.price}`,
  }));

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold text-center">Group Buys</h1>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {isLoading && <p className="text-gray-600 text-center">Loading...</p>}

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Create Group Buy</h2>
        <div className="space-y-4">
          <Select
            className="w-full"
            options={productOptions}
            value={formData.product}
            onChange={(option) => setFormData({ ...formData, product: option })}
            placeholder="Choose a product"
            isClearable
            isDisabled={isLoading}
          />
          <p>Discount</p>
          <input
            className="border rounded p-2 w-full"
            placeholder="Discount (%)"
            type="number"
            value={formData.discount}
            onChange={(e) => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
            min="0"
            disabled={isLoading}
          />
          <p>Participants</p>
          <input
            className="border rounded p-2 w-full"
            placeholder="Minimum Participants"
            type="number"
            value={formData.minParticipants}
            onChange={(e) => setFormData({ ...formData, minParticipants: parseInt(e.target.value) || 1 })}
            min="1"
            disabled={isLoading}
          />
            <p>Status</p>
          <select
            className="border rounded p-2 w-full"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            disabled={isLoading}
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
          <button
            onClick={createGroupBuy}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            disabled={isLoading || !formData.product?.value}
          >
            Create Group Buy
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">All Group Buys</h2>
        <ul className="space-y-4">
          {groupBuys.map((gb) => (
            <li key={gb.ID} className="border rounded p-4 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <p className="font-semibold">Group Buy #{gb.ID} - {gb.Product.name}</p>
                <p className="text-sm text-gray-600">Discount: {gb.discount}%, Participants: {gb.participants}/{gb.min_participants}, Status: {gb.status}</p>
              </div>
              <div className="mt-2 md:mt-0 flex space-x-3">
                <button onClick={() => fetchOneGroupBuy(gb.ID)} className="text-blue-600 hover:underline">View</button>
                <button onClick={() => joinGroupBuy(gb.ID)} className="text-green-600 hover:underline">Join</button>
                <button onClick={() => deleteGroupBuy(gb.ID)} className="text-red-600 hover:underline">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {selectedGroupBuy && (
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Group Buy Details</h2>
          <p><strong>ID:</strong> {selectedGroupBuy.ID}</p>
          <p><strong>Product:</strong> {selectedGroupBuy.Product.name}</p>
          <p><strong>Discount:</strong> {selectedGroupBuy.discount}%</p>
          <p><strong>Participants:</strong> {selectedGroupBuy.participants}/{selectedGroupBuy.min_participants}</p>
          <p><strong>Status:</strong> {selectedGroupBuy.status}</p>
        </div>
      )}
    </div>
  );
}
