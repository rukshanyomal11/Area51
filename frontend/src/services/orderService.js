import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
const getAuthHeader = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getUserOrders = async (userId, token) => {
  try {
    const response = await api.get(`/orders/user/${userId}`, getAuthHeader(token));
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error.response?.data || error;
  }
};

export const placeOrder = async (orderData, token) => {
  try {
    const response = await api.post('/orders/place', orderData, getAuthHeader(token));
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error.response?.data || error;
  }
};

export const getOrderById = async (orderId, token) => {
  try {
    const response = await api.get(`/orders/${orderId}`, getAuthHeader(token));
    return response.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw error.response?.data || error;
  }
};

export const getOrderHistory = async (token) => {
  try {
    const response = await api.get('/orders/history', getAuthHeader(token));
    return response.data;
  } catch (error) {
    console.error('Error fetching order history:', error);
    throw error.response?.data || error;
  }
};
