import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getOrderDetails } from '../../api/apiService';
import { FaBox, FaCalendarAlt, FaMoneyBillWave, FaTruck } from 'react-icons/fa';

const OrderDetails = () => {
  const { id } = useParams();
  const { auth } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await getOrderDetails(id);
        setOrder(data.order);
      } catch (err) {
        setError(err.response?.data?.message || 'Error loading order details');
      } finally {
        setLoading(false);
      }
    };

    if (auth.isAuthenticated) {
      fetchOrder();
    }
  }, [id, auth]);

  if (loading) return <div className="flex justify-center py-8">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Link to="/account/orders" className="text-blue-500 hover:underline mb-4 inline-block">
        &larr; Back to Orders
      </Link>

      <h1 className="text-2xl font-bold mb-6">Order Details</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {order && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-lg font-semibold mb-2">Order Information</h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <FaBox className="mr-2 text-gray-500" />
                  <span>Order ID: {order._id.substring(0, 8)}</span>
                </p>
                <p className="flex items-center">
                  <FaCalendarAlt className="mr-2 text-gray-500" />
                  <span>Date: {new Date(order.createdAt).toLocaleDateString()}</span>
                </p>
                <p className="flex items-center">
                  <FaTruck className="mr-2 text-gray-500" />
                  <span>Status: 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.orderStatus}
                    </span>
                  </span>
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-2">Payment Information</h2>
              <div className="space-y-2">
                <p className="flex items-center">
                  <FaMoneyBillWave className="mr-2 text-gray-500" />
                  <span>Status: {order.paymentInfo.status}</span>
                </p>
                <p>Method: {order.paymentInfo.paymentMethod}</p>
                <p>Paid at: {new Date(order.paymentInfo.paidAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center border-b pb-4">
                  <img 
                    src={item.product.image} 
                    alt={item.product.name} 
                    className="w-16 h-16 object-cover rounded mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium">{item.product.name}</h3>
                    <p className="text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${item.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Items:</span>
                <span>${order.itemsPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax:</span>
                <span>${order.taxPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>Total:</span>
                <span>${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetails;