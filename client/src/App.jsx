import React, { useEffect, useState } from 'react';
import AppRoutes from './routes/AppRoutes';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import { Toaster, toast } from 'react-hot-toast';
import axios from 'axios';
import { Shield, Clock, Check, X } from 'lucide-react';

function App() {
  const [socket, setSocket] = useState(null);
  
  // Real-time visitor approval request states
  const [visitorRequest, setVisitorRequest] = useState(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('🔌 WebSocket is connected to SMS Server');
    });

    const userId = Cookies.get('id');
    if (userId) {
      socketInstance.emit('register_user', userId);
    }

    // Listen for incoming visitor approval requests (For Residents)
    socketInstance.on('visitor_approval_request', (data) => {
      console.log('🚨 Incoming walk-in visitor approval request:', data);
      setVisitorRequest(data);
      setCountdown(60); // Reset timer to 60s
    });

    // Listen for general notices
    socketInstance.on('new_notice', (data) => {
      toast.success(`📢 Announcement: ${data.message}`, {
        duration: 8000,
        style: {
          border: '1px solid #10b981',
          padding: '16px',
          color: '#065f46',
          borderRadius: '12px',
        },
      });
    });

    // Listen for complaint updates
    socketInstance.on('complaint_status_update', (data) => {
      toast.success(`🔔 Status Update: ${data.message}`, {
        duration: 8000,
        style: {
          border: '1px solid #3b82f6',
          padding: '16px',
          color: '#1e3a8a',
          borderRadius: '12px',
        },
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Countdown timer for active visitor requests
  useEffect(() => {
    if (!visitorRequest) return;
    if (countdown === 0) {
      setVisitorRequest(null);
      toast.error('⏳ Visitor approval request expired.');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [visitorRequest, countdown]);

  const handleApprovalResponse = async (action) => {
    if (!visitorRequest) return;

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/visitors/status`,
        {
          visitorId: visitorRequest.visitorId,
          action: action === 'approve' ? 'accepted' : 'rejected',
        },
        { withCredentials: true }
      );

      toast.success(`Entry ${action === 'approve' ? 'Approved' : 'Rejected'} successfully!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit response.');
    } finally {
      setVisitorRequest(null);
    }
  };

  return (
    <div className="App relative min-h-screen">
      <Toaster position="top-right" />
      <AppRoutes />

      {/* 🚨 Glassmorphic Real-Time Visitor Approval Request Modal */}
      {visitorRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transform scale-100 transition-all duration-300">
            {/* Header banner */}
            <div className="bg-[#005c2b] text-white p-6 flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Visitor at the Gate</h3>
                <p className="text-white/80 text-xs mt-0.5 leading-none">Real-time gatekeeper verification</p>
              </div>
              <div className="ml-auto bg-white/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-mono text-sm">
                <Clock size={14} className="animate-pulse text-amber-300" />
                <span className="text-amber-300 font-bold">{countdown}s</span>
              </div>
            </div>

            {/* Details body */}
            <div className="p-6 space-y-4">
              <p className="text-slate-500 text-sm leading-relaxed">
                A visitor has requested entry to your flat. Please review details below:
              </p>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-500 font-medium">Guest Name</span>
                  <span className="text-sm font-semibold text-slate-800">{visitorRequest.name}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs text-slate-500 font-medium">Visitor Type</span>
                  <span className="text-sm font-semibold text-slate-800 capitalize bg-slate-200/50 px-2.5 py-0.5 rounded-full text-xs">
                    {visitorRequest.type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-slate-500 font-medium">Purpose</span>
                  <span className="text-sm font-semibold text-slate-800">{visitorRequest.purpose || 'Guest Visit'}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex gap-4">
              <button
                onClick={() => handleApprovalResponse('reject')}
                className="flex-1 py-3 px-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 font-semibold text-sm hover:bg-rose-100 hover:text-rose-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <X size={16} />
                Reject Entry
              </button>
              <button
                onClick={() => handleApprovalResponse('approve')}
                className="flex-1 py-3 px-4 rounded-xl bg-[#10b981] text-white font-semibold text-sm hover:bg-[#059669] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/10"
              >
                <Check size={16} />
                Approve Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
