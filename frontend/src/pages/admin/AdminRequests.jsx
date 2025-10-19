import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/requests', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setRequests(data);
        } else {
          setError(data.message || 'Failed to fetch requests');
        }
      } catch (err) {
        setError('Server error. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [token]);

  const handleApprove = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        setRequests(requests.map(req => 
          req._id === requestId ? { ...req, status: 'approved' } : req
        ));
      }
    } catch (err) {
      console.error('Error approving request:', err);
    }
    setConfirmModal(null);
  };

  const handleCancel = async (requestId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}/cancel`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      if (response.ok) {
        setRequests(requests.map(req => 
          req._id === requestId ? { ...req, status: 'cancelled' } : req
        ));
      }
    } catch (err) {
      console.error('Error cancelling request:', err);
    }
    setConfirmModal(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="min-h-screen bg-gray-100">
      {token && <AdminSidebar />}
      <div className={`${token ? 'ml-64' : ''}`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">User Checkout Requests</h1>
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.userEmail}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs">
                          <div className="truncate" title={request.items.map(item => item.title).join(', ')}>
                            {request.items.map(item => item.title).join(', ')}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {request.items.length} item{request.items.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        ${request.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="max-w-xs">
                          <div className="font-medium">{request.shippingAddress?.name}</div>
                          <div>{request.shippingAddress?.address}</div>
                          <div className="text-xs text-gray-400">
                            {request.shippingAddress?.phone} • {request.shippingAddress?.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setConfirmModal({ type: 'approve', requestId: request._id })}
                                className="text-green-600 hover:text-green-900 font-medium"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setConfirmModal({ type: 'cancel', requestId: request._id })}
                                className="text-red-600 hover:text-red-900 font-medium"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {request.status === 'approved' && (
                            <span className="text-green-600 text-sm">Approved</span>
                          )}
                          {request.status === 'cancelled' && (
                            <span className="text-red-600 text-sm">Cancelled</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {requests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No checkout requests found
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Modal */}
          {confirmModal && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3 text-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {confirmModal.type === 'approve' ? 'Approve Request' : 'Cancel Request'}
                  </h3>
                  <div className="mt-2 px-7 py-3">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to {confirmModal.type} this request?
                    </p>
                  </div>
                  <div className="items-center px-4 py-3">
                    <button
                      onClick={() => setConfirmModal(null)}
                      className="px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-3"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        confirmModal.type === 'approve' 
                          ? handleApprove(confirmModal.requestId)
                          : handleCancel(confirmModal.requestId);
                      }}
                      className={`px-4 py-2 text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        confirmModal.type === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                          : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                      }`}
                    >
                      {confirmModal.type === 'approve' ? 'Approve' : 'Cancel'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Statistics */}
          {requests.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Requests</h3>
                <p className="text-3xl font-bold text-blue-600">{requests.length}</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {requests.filter(r => r.status === 'pending').length}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Approved</h3>
                <p className="text-3xl font-bold text-green-600">
                  {requests.filter(r => r.status === 'approved').length}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Revenue</h3>
                <p className="text-3xl font-bold text-purple-600">
                  ${requests.reduce((sum, request) => sum + request.total, 0).toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminRequests;
