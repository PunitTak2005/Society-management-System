import React, { useState } from 'react';
import { login, verifyOtp } from '../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [localMessage, setLocalMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    dispatch(login({ formData }))
      .unwrap()
      .then((res) => {
        setLocalMessage(res.message || 'OTP sent to your registered email!');
        setOtpStep(true);
      })
      .catch((err) => {
        setLocalError(err?.message || 'Invalid credentials. Please try again.');
      });
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    dispatch(verifyOtp({ email: formData.email, otp }))
      .unwrap()
      .then(() => {
        setLocalMessage('Login successful!');
        setTimeout(() => navigate('/dashboard'), 1000);
      })
      .catch((err) => {
        setLocalError(err?.message || 'Invalid or expired OTP.');
      });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Column 1: Product Highlights */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-ds-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#005c2b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Society Management System{' '}
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Manage your society with{' '}
              <span className="text-primary-400">intelligence.</span>
            </h2>
            <p className="text-primary-100/80 text-lg mb-10 leading-relaxed">
              The all-in-one platform for modern residents and progressive
              society management.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: 'Smart Visitor Management',
                  desc: 'Pre-approve guests and track visitor entries in real-time.',
                },
                {
                  title: 'Digital Maintenance',
                  desc: 'Pay bills, track expenses, and view financial reports instantly.',
                },
                {
                  title: 'Community Hub',
                  desc: 'Connect with neighbors and stay updated with official notices.',
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary-500/30 flex items-center justify-center mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-base">
                      {item.title}
                    </h4>
                    <p className="text-primary-100/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-primary-100/40 text-xs">
            © 2026 SMS Portal. Empowering communities worldwide.
          </p>
        </div>
      </div>

      {/* Column 2: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-slate-50 md:bg-white">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-8 h-8 bg-sidebar rounded-ds-md flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-lg">SMS Portal</span>
          </div>

          <div className="mb-10 text-center md:text-left">
            <h1 className="ds-title text-3xl mb-2">
              {otpStep ? 'Verify OTP' : 'Sign In'}
            </h1>
            <p className="ds-subtle">
              {otpStep
                ? `Enter the 6-digit code sent to ${formData.email}`
                : 'Access your society management dashboard'}
            </p>
          </div>

          {!otpStep ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {localError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-4 rounded-ds-md flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span className="font-medium">{localError}</span>
                </div>
              )}

              {localMessage && (
                <div className="bg-success/10 border border-success/20 text-success text-xs p-4 rounded-ds-md flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="font-medium">{localMessage}</span>
                </div>
              )}

              <div>
                <label className="overline-label block mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="has-icon"
                    placeholder="name@society.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="overline-label" htmlFor="password">
                    Password
                  </label>
                  <a
                    href="#"
                    className="text-[11px] font-medium text-primary-600 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="11"
                        width="18"
                        height="11"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="has-icon"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 text-primary-600 border-slate-200 rounded-ds-md focus:ring-primary-500"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-[13px] text-slate-600 cursor-pointer"
                >
                  Remember this device
                </label>
              </div>

              <button
                type="submit"
                className="btn w-full bg-primary-600 hover:bg-primary-700 text-white py-3 transition-all duration-200 shadow-lg shadow-primary-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In to Portal'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6">
              {localError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-4 rounded-ds-md flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span className="font-medium">{localError}</span>
                </div>
              )}

              {localMessage && (
                <div className="bg-success/10 border border-success/20 text-success text-xs p-4 rounded-ds-md flex items-center gap-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span className="font-medium">{localMessage}</span>
                </div>
              )}

              <div>
                <label className="overline-label block mb-2" htmlFor="otp">
                  One-Time Password
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  className="has-icon text-center tracking-[0.5em] text-lg font-semibold"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                className="btn w-full bg-primary-600 hover:bg-primary-700 text-white py-3 transition-all duration-200 shadow-lg shadow-primary-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Verifying OTP...' : 'Verify OTP'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpStep(false);
                  setOtp('');
                  setLocalError(null);
                  setLocalMessage(null);
                }}
                className="w-full text-center text-[13px] font-medium text-primary-600 hover:underline"
              >
                Back to Sign In
              </button>
            </form>
          )}

          <div className="mt-12 pt-8 border-t border-slate-100 text-center">
            <p className="ds-subtle text-sm">
              New to the society?{' '}
              <a
                href="#"
                className="font-bold text-primary-600 hover:underline"
              >
                Request Access
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
