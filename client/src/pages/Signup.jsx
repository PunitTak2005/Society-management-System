import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:9007/api';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setLoading(true);

    const emailToSubmit = formData.email.trim();
    setSubmittedEmail(emailToSubmit);

    try {
      const payload = {
        name: formData.name.trim(),
        email: emailToSubmit,
        phone: formData.phone.trim(),
      };

      const res = await axios.post(`${apiUrl}/auth/register`, payload, {
        withCredentials: true,
      });

      setIsSuccess(true);
      setSuccessMessage(
        res.data?.message ||
          'Your access request has been submitted successfully! Temporary login credentials have been sent to your email.'
      );
    } catch (err) {
      console.error('Signup error:', err);
      const errMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "We couldn't send your temporary login credentials. Please try again later.";
      setLocalError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Column 1: Product Highlights / Brand Sidebar */}
      <div className="hidden md:flex md:w-1/2 bg-sidebar p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-white rounded-ds-md flex items-center justify-center shadow-md">
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
              Society Management System
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Join your residential{' '}
              <span className="text-primary-400">community.</span>
            </h2>
            <p className="text-primary-100/80 text-lg mb-10 leading-relaxed">
              Request access to verify your residency, manage visitors, pay maintenance, and stay informed with your society.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: 'Instant Member Verification',
                  desc: 'Register your details and receive secure access credentials.',
                },
                {
                  title: 'Visitor & Delivery Passcodes',
                  desc: 'Generate pre-approved passes for hassle-free entry at the gate.',
                },
                {
                  title: 'Complaints & Notice Board',
                  desc: 'Raise maintenance tickets and get real-time society announcements.',
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

      {/* Column 2: Signup / Request Access Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-slate-50 md:bg-white overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Mobile Logo */}
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

          {/* Header */}
          <div className="mb-8 text-center md:text-left">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 mb-4 transition-colors"
            >
              <ArrowLeft size={14} /> Back to Sign In
            </Link>
            <h1 className="ds-title text-3xl mb-2">Request Access</h1>
            <p className="ds-subtle text-sm">
              Fill in your details to register for your society member account.
            </p>
          </div>

          {/* Success Screen */}
          {isSuccess ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-6 shadow-sm animate-fade-in">
              <div className="w-16 h-16 bg-emerald-50 text-[#005c2b] rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Request Submitted!</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {successMessage}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600 text-left space-y-1.5">
                <p className="font-semibold text-slate-700">Next Steps:</p>
                <p>1. Check your email inbox (<strong className="text-slate-800">{submittedEmail || formData.email}</strong>) for your temporary password.</p>
                <p>2. Sign in using your registered email and the provided password.</p>
                <p>3. You can update your password anytime from your profile settings.</p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="btn w-full bg-primary-600 hover:bg-primary-700 text-white py-3 transition-all duration-200 shadow-lg shadow-primary-600/20 font-semibold text-sm cursor-pointer"
              >
                Proceed to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {localError && (
                <div className="bg-danger/10 border border-danger/20 text-danger text-xs p-4 rounded-ds-md flex items-center gap-3 animate-fade-in">
                  <AlertCircle size={16} className="flex-shrink-0" />
                  <span className="font-medium">{localError}</span>
                </div>
              )}

              {/* Full Name */}
              <div>
                <label className="overline-label block mb-1.5" htmlFor="name">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    className="has-icon w-full"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="overline-label block mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="has-icon w-full"
                    placeholder="name@society.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="overline-label block mb-1.5" htmlFor="phone">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="has-icon w-full"
                    placeholder="e.g. 9876543210"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-full bg-primary-600 hover:bg-primary-700 text-white py-3 transition-all duration-200 shadow-lg shadow-primary-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  'Submit Access Request'
                )}
              </button>
            </form>
          )}

          {/* Footer Navigation */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="ds-subtle text-sm">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold text-primary-600 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
