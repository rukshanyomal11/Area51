import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { FaEnvelope, FaLock, FaCheckCircle, FaKey, FaArrowLeft, FaShieldAlt } from 'react-icons/fa';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ email: '', otp: '', newPassword: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setSuccess('OTP sent successfully! Check your email.');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
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
        setSuccess('OTP verified! Set your new password.');
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: formData.newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.removeItem('token');
        setSuccess('Password reset successful!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      setError('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressSteps = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex flex-col items-center">
          <div className={'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ' + (step >= 1 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500')}>
            <FaEnvelope className="text-lg" />
          </div>
          <span className="text-xs mt-2 font-medium">Email</span>
        </div>
        <div className={'w-16 h-1 transition-all duration-300 ' + (step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200')}></div>
        <div className="flex flex-col items-center">
          <div className={'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ' + (step >= 2 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500')}>
            <FaKey className="text-lg" />
          </div>
          <span className="text-xs mt-2 font-medium">Verify</span>
        </div>
        <div className={'w-16 h-1 transition-all duration-300 ' + (step >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-200')}></div>
        <div className="flex flex-col items-center">
          <div className={'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ' + (step >= 3 ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-500')}>
            <FaLock className="text-lg" />
          </div>
          <span className="text-xs mt-2 font-medium">Reset</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navigation Bar */}
      <Navigation />
      
      {/* Main Content with Background Image */}
      <div className="flex-grow relative overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/shopping.png" 
            alt="Shopping Background" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30"></div>
        </div>

        {/* Form Overlay */}
        <div className="relative z-10 flex items-center justify-center min-h-full px-4 py-12">
          <div className="w-full max-w-lg">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-12 border border-white/40">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
                  <FaShieldAlt className="text-3xl text-white" />
                </div>
                <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify Your Identity' : 'Create New Password'}
                </h2>
                <p className="text-gray-700 text-center mt-2 text-sm font-medium">
                  {step === 1 && "Don't worry! We'll send you a code to reset it."}
                  {step === 2 && "Enter the 6-digit code sent to your email."}
                  {step === 3 && "Choose a strong password for your account."}
                </p>
              </div>
            {renderProgressSteps()}
            {success && (
              <div className="bg-green-100/90 backdrop-blur-sm border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center animate-fade-in">
                <FaCheckCircle className="mr-3 text-xl" />
                <span>{success}</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100/90 backdrop-blur-sm border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-6 animate-shake">
                {error}
              </div>
            )}
            {step === 1 && (
              <form onSubmit={handleSubmitEmail} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaEnvelope className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Sending...
                    </div>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleSubmitOTP} className="space-y-6">
                <div>
                  <label htmlFor="otp" className="block text-sm font-semibold text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaKey className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      maxLength={6}
                      pattern="\d{6}"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300 text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      required
                      disabled={loading}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Code sent to <span className="font-semibold">{formData.email}</span>
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verifying...
                    </div>
                  ) : (
                    'Verify Code'
                  )}
                </button>
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setFormData({ ...formData, otp: '' }); setError(''); setSuccess(''); }}
                    className="text-sm text-blue-600 hover:text-purple-600 font-medium transition-colors duration-300"
                  >
                    Didn't receive code? Resend
                  </button>
                </div>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleSubmitPassword} className="space-y-6">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Enter new password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FaLock className="text-gray-400" />
                    </div>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-300"
                      placeholder="Confirm new password"
                      required
                      disabled={loading}
                      minLength={6}
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Resetting...
                    </div>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </form>
            )}
            <div className="mt-8 pt-6 border-t border-gray-300/50">
              <Link
                to="/login"
                className="flex items-center justify-center text-sm text-gray-700 hover:text-blue-600 font-medium transition-colors duration-300 group"
              >
                <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
                Back to Login
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-600 font-medium bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
              🔒 Your security is our priority. All communications are encrypted.
            </p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
