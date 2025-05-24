import { useEffect, useState } from 'react';
import Select from 'react-select';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [groupBuys, setGroupBuys] = useState([]);
  const [formData, setFormData] = useState({
    product: null, 
    groupBuy: null, 
    quantity: 1,
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([getOrders(), getProducts(), getGroupBuys()]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const getOrders = async () => {
    try {
      const res = await fetch('http://localhost:8082/orders');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('Orders:', data);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders.');
    }
  };

  const getProducts = async () => {
    try {
      const res = await fetch('http://localhost:8082/products');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('Products:', data);
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products.');
    }
  };

  const getGroupBuys = async () => {
    try {
      const res = await fetch('http://localhost:8082/groupbuys');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('GroupBuys:', data);
      setGroupBuys(data);
    } catch (error) {
      console.error('Error fetching group buys:', error);
      setError('Failed to load group buys.');
    }
  };

  const getOrder = async (id) => {
    try {
      const res = await fetch(`http://localhost:8082/orders/${id}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('Order details:', data);
      setCurrentOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order details.');
    }
  };

  const calculateTotalPrice = () => {
    if (!formData.product?.value || !formData.groupBuy?.value) {
      console.log('CalculateTotalPrice: Missing product or group buy');
      return 0;
    }
    const product = products.find(p => p.ID === formData.product.value);
    const group = groupBuys.find(g => g.ID === formData.groupBuy.value);
    console.log('Selected product:', product, 'Selected group:', group);
    if (!product || !group) {
      console.log('CalculateTotalPrice: Product or group not found');
      return 0;
    }
    return product.price * formData.quantity * (1 - group.discount / 100);
  };

  const createOrder = async () => {
    if (!formData.product?.value || !formData.groupBuy?.value) {
      setError('Please select both a valid product and a valid group buy.');
      console.log('Invalid selection:', formData);
      return;
    }

    const total_price = calculateTotalPrice();
    if (total_price === 0) {
      setError('Cannot calculate total price. Ensure valid product and group buy are selected.');
      console.log('Total price is 0');
      return;
    }

    const orderData = {
      product_id: formData.product.value,
      groupbuy_id: formData.groupBuy.value,
      quantity: formData.quantity,
      total_price,
    };
    console.log('Sending order:', orderData);

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:8082/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      console.log('Order created:', data);
      setFormData({ product: null, groupBuy: null, quantity: 1 });
      setError('');
      getOrders();
    } catch (error) {
      console.error('Error creating order:', error);
      setError(`Failed to create order: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteOrder = async (id) => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:8082/orders/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      getOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      setError('Failed to delete order.');
    } finally {
      setIsLoading(false);
    }
  };

  const productOptions = products.map(p => ({
    value: p.ID, 
    label: `${p.name} — $${p.price}`,
  }));
  const groupBuyOptions = groupBuys.map(g => ({
    value: g.ID,
    label: `ID ${g.ID} — discount ${(g.discount).toFixed(0)}%`,
  }));

  return (
<div className="container mx-auto border border-red-500">
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>
      {error && <p className="text-red-600">{error}</p>}
      {isLoading && <p className="text-gray-600">Loading...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold">Create Order</h2>

          <Select
            className="mb-2"
            options={productOptions}
            value={formData.product}
            onChange={(option) => {
              console.log('Selected product:', option);
              setFormData({ ...formData, product: option });
              setError('');
            }}
            placeholder="Choose product"
            isClearable
            isDisabled={isLoading}
          />

          <Select
            className="mb-2"
            options={groupBuyOptions}
            value={formData.groupBuy}
            onChange={(option) => {
              console.log('Selected groupBuy:', option);
              setFormData({ ...formData, groupBuy: option });
              setError('');
            }}
            placeholder="Choose Group Buy"
            isClearable
            isDisabled={isLoading}
          />
          <p>Quantity:</p>
          <input
            className="border p-2 w-full mb-2"
            placeholder="Quantity"
            type="number"
            value={formData.quantity}
            onChange={(e) => {
              const value = e.target.value ? parseInt(e.target.value) : 1;
              console.log('Selected quantity:', value);
              setFormData({ ...formData, quantity: isNaN(value) ? 1 : value });
            }}
            disabled={isLoading}
            min="1"
          />

          <p className="mb-2">Total Price: <strong>${calculateTotalPrice().toFixed(2)}</strong></p>

          <button
            onClick={createOrder}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
            disabled={isLoading || !formData.product?.value || !formData.groupBuy?.value}
          >
            Create Order
          </button>
        </div>

        <div>
          <h2 className="text-xl font-semibold">Order Details</h2>
          {currentOrder ? (
            <div className="border p-4">
              <p><strong>ID:</strong> {currentOrder.ID}</p>
              <p><strong>Product ID:</strong> {currentOrder.product_id}</p>
              <p><strong>GroupBuy ID:</strong> {currentOrder.groupbuy_id}</p>
              <p><strong>Quantity:</strong> {currentOrder.quantity}</p>
              <p><strong>Total Price:</strong> ${currentOrder.total_price.toFixed(2)}</p>
            </div>
          ) : (
            <p>Select an order to see details</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mt-6">All Orders</h2>
        <ul className="divide-y">
          {orders.map((order) => (
            <li key={order.ID} className="p-2 flex justify-between items-center">
              <div>
                <p>Order #{order.ID} - Quantity: {order.quantity}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => getOrder(order.ID)}
                  className="text-blue-600"
                  disabled={isLoading}
                >
                  View
                </button>
                <button
                  onClick={() => deleteOrder(order.ID)}
                  className="text-red-600"
                  disabled={isLoading}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
    </div>
  );
}