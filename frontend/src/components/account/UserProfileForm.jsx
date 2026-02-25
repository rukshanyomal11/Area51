import React, { useState, useEffect } from 'react';

const UserProfileForm = ({ userData, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        address: userData.address || ''
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      await onUpdate(formData);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <span className="text-3xl mr-3">✏️</span>
          Update Your Profile
        </h2>
        <p className="text-gray-600">Keep your information up to date for a better shopping experience</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="group">
          <label htmlFor="name" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <span className="text-lg mr-2">👤</span>
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                errors.name 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              } text-gray-900 placeholder-gray-400 focus:outline-none`}
              placeholder="Enter your full name"
            />
            {formData.name && !errors.name && (
              <span className="absolute right-3 top-3 text-green-500 text-xl">✓</span>
            )}
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.name}
            </p>
          )}
        </div>

        {/* Phone Field */}
        <div className="group">
          <label htmlFor="phone" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <span className="text-lg mr-2">📱</span>
            Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                errors.phone 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              } text-gray-900 placeholder-gray-400 focus:outline-none`}
              placeholder="Enter 10-digit phone number"
              maxLength="10"
            />
            {formData.phone && !errors.phone && formData.phone.length === 10 && (
              <span className="absolute right-3 top-3 text-green-500 text-xl">✓</span>
            )}
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.phone}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">Format: 10 digits (e.g., 1234567890)</p>
        </div>

        {/* Address Field */}
        <div className="group">
          <label htmlFor="address" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
            <span className="text-lg mr-2">🏠</span>
            Address
          </label>
          <div className="relative">
            <textarea
              id="address"
              name="address"
              rows={4}
              value={formData.address}
              onChange={handleChange}
              className={`block w-full px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                errors.address 
                  ? 'border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
              } text-gray-900 placeholder-gray-400 focus:outline-none resize-none`}
              placeholder="Enter your complete address (street, city, state, zip code)"
            />
            {formData.address && !errors.address && formData.address.length >= 5 && (
              <span className="absolute right-3 top-3 text-green-500 text-xl">✓</span>
            )}
          </div>
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 flex items-center">
              <span className="mr-1">⚠️</span>
              {errors.address}
            </p>
          )}
          <p className="mt-1 text-xs text-gray-500">Minimum 5 characters required</p>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">All fields are required</p>
          <button
            type="submit"
            disabled={loading}
            className="group relative inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating Profile...
              </>
            ) : (
              <>
                <span className="mr-2">💾</span>
                Update Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserProfileForm;
