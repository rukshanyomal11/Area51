import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '' });
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input change
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setError('');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: formData.otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setResetToken(data.resetToken);
        setStep(3);
        setError('');
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: formData.newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        // Clear localStorage to ensure user is not remembered
        localStorage.removeItem('token');
        alert('Password reset successful! Please log in with your new password.');
        navigate('/login');
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white">
      <Navigation />
      <main className="flex-grow flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 sm:p-10">
          <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
            {step === 1 ? 'Forgot Password' : step === 2 ? 'Verify OTP' : 'Reset Password'}
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSubmitEmail} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition-colors duration-300"
              >
                Send OTP
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmitOTP} className="space-y-5">
              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter OTP (6 digits)
                </label>
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition-colors duration-300"
              >
                Verify OTP
              </button>
              <p className="text-sm text-center text-gray-600 mt-2">
                Didn’t receive OTP?{' '}
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmitPassword} className="space-y-5">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md shadow-sm transition-colors duration-300"
              >
                Reset Password
              </button>
            </form>
          )}

          <p className="text-sm text-center text-gray-600 mt-5">
            Back to{' '}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;