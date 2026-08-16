import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { 
  ShieldCheck, ShieldAlert, KeyRound, UserCheck, PlusCircle, Search, 
  Copy, CheckCircle, Smartphone, Info, Calendar, ArrowRight, Loader2 
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Cookies from 'js-cookie';
import { fetchFlats } from '../redux/slice/flatSlice';
import { io } from 'socket.io-client';

function Visitors() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth.role) || Cookies.get('role');
  const loggedInUserId = useSelector((state) => state.auth.id) || Cookies.get('id');
  const { flats } = useSelector((state) => state.flat);

  const isGuard = userRole?.toLowerCase() === 'security_guard' || userRole?.toLowerCase() === 'staff';
  const isAdmin = userRole?.toLowerCase() === 'admin';

  // Tabs for Guard View
  const [activeTab, setActiveTab] = useState('verify'); // verify | register | logs

  // State management
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generatedPasscode, setGeneratedPasscode] = useState(null);
  const [copied, setCopied] = useState(false);

  // Real-time walk-in verification loading screen
  const [pendingVisitor, setPendingVisitor] = useState(null); // stores visitor currently waiting for approval
  const [pendingStatus, setPendingStatus] = useState('pending'); // pending | accepted | rejected

  // React Hook Form: Invitation Form (Residents)
  const { 
    register: registerInvite, 
    handleSubmit: handleSubmitInvite, 
    reset: resetInvite, 
    formState: { errors: inviteErrors } 
  } = useForm();

  // React Hook Form: Walk-in Registration Form (Guards)
  const { 
    register: registerWalkin, 
    handleSubmit: handleSubmitWalkin, 
    reset: resetWalkin, 
    formState: { errors: walkinErrors } 
  } = useForm();

  // React Hook Form: Passcode Verification Form (Guards)
  const { 
    register: registerVerify, 
    handleSubmit: handleSubmitVerify, 
    reset: resetVerify 
  } = useForm();

  // Load flats and logs
  const loadVisitorLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/visitors`, { withCredentials: true });
      setVisitors(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    dispatch(fetchFlats());
    loadVisitorLogs();

    // Setup socket to listen to real-time approvals inside this page (Guards)
    const socket = io('http://localhost:3000');
    socket.on('connect', () => {
      console.log('🔌 Visitors page socket registered');
    });

    socket.on('visitor_status_updated', (data) => {
      console.log('📡 Real-time visitor update received:', data);
      
      // If we are currently showing the waiting spinner for this visitor
      setPendingVisitor(prev => {
        if (prev && prev._id === data.visitorId) {
          setPendingStatus(data.status);
          toast.success(data.message);
          loadVisitorLogs();
          
          // Auto close the spinner screen after 4 seconds
          setTimeout(() => {
            setPendingVisitor(null);
            setPendingStatus('pending');
          }, 4000);
        }
        return prev;
      });

      // Reload list
      loadVisitorLogs();
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch]);

  // Residents: Generate Invitation
  const onPublishInvite = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/visitors/preauth`,
        {
          name: data.name,
          purpose: data.purpose,
          flatId: data.flatId,
          date: data.date,
          timeFrom: data.timeFrom,
          timeTo: data.timeTo
        },
        { withCredentials: true }
      );

      setGeneratedPasscode(res.data.passcode);
      toast.success('Pre-authorized Invite generated!');
      resetInvite();
      loadVisitorLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate invitation');
    } finally {
      setLoading(false);
    }
  };

  // Guards: Verify Passcode
  const onVerifyPasscode = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/visitors/verify`,
        { passcode: data.passcode },
        { withCredentials: true }
      );
      toast.success(res.data.message);
      resetVerify();
      loadVisitorLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Guards: Register Walk-in
  const onRegisterWalkin = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/visitors`,
        {
          name: data.name,
          type: data.type,
          phone: Number(data.phone),
          purpose: data.purpose,
          flatId: data.flatId,
          userId: loggedInUserId
        },
        { withCredentials: true }
      );

      toast.success(res.data.message);
      resetWalkin();
      loadVisitorLogs();

      // Open approval overlay
      setPendingVisitor(res.data.data);
      setPendingStatus('pending');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPasscode = () => {
    if (generatedPasscode) {
      navigator.clipboard.writeText(generatedPasscode);
      setCopied(true);
      toast.success('Passcode copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter logs for today
  const filteredVisitors = visitors.filter(v => {
    // If resident: only show their flat's visitors
    if (!isGuard && !isAdmin) {
      const residentFlatId = Cookies.get('flatId') || (flats.find(f => f.isOccupied)?.id); // backend automatically filters anyway
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 🛡️ Resident Portal View */}
      {!isGuard && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Pre-Auth Invite */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="text-[#005c2b]" size={20} />
              <h2 className="text-lg font-bold text-slate-800">Pre-Authorize Guest</h2>
            </div>
            
            <form onSubmit={handleSubmitInvite(onPublishInvite)} className="space-y-4">
              <Input 
                label="Guest Full Name" 
                placeholder="e.g. Ramesh Kumar"
                error={inviteErrors.name?.message}
                {...registerInvite('name', { required: 'Name is required' })}
              />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 ml-0.5">Select Flat</label>
                <select 
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  {...registerInvite('flatId', { required: 'Flat is required' })}
                >
                  <option value="">Choose Flat</option>
                  {flats.map(flat => (
                    <option key={flat._id} value={flat._id}>
                      {flat.flatNumber} (Block {flat.block})
                    </option>
                  ))}
                </select>
                {inviteErrors.flatId && (
                  <p className="text-[11px] text-rose-500 font-medium ml-0.5">{inviteErrors.flatId.message}</p>
                )}
              </div>

              <Input 
                label="Purpose of Visit" 
                placeholder="e.g. Dinner Invite"
                {...registerInvite('purpose')}
              />

              <Input 
                label="Invite Date" 
                type="date"
                error={inviteErrors.date?.message}
                {...registerInvite('date', { required: 'Date is required' })}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="From (Start Time)" 
                  type="time"
                  error={inviteErrors.timeFrom?.message}
                  {...registerInvite('timeFrom', { required: 'Start time is required' })}
                />
                <Input 
                  label="To (End Time)" 
                  type="time"
                  error={inviteErrors.timeTo?.message}
                  {...registerInvite('timeTo', { required: 'End time is required' })}
                />
              </div>

              <Button type="submit" className="w-full flex justify-center py-2.5 mt-2" loading={loading}>
                Generate Invite Link
              </Button>
            </form>

            {/* Render generated passcode badge */}
            {generatedPasscode && (
              <div className="bg-[#ecfdf5] border border-emerald-200 rounded-xl p-4 mt-6 text-center space-y-2 animate-fade-in">
                <p className="text-emerald-800 text-xs font-semibold uppercase tracking-wider">Passcode Generated</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-3xl font-bold tracking-widest text-[#047857]">{generatedPasscode}</span>
                  <button 
                    onClick={handleCopyPasscode}
                    className="p-2 bg-emerald-100 hover:bg-emerald-200 text-[#047857] rounded-lg transition-colors"
                    title="Copy Passcode"
                  >
                    {copied ? <CheckCircle size={18} /> : <Copy size={18} />}
                  </button>
                </div>
                <p className="text-slate-500 text-[10px] mt-1 leading-relaxed">
                  Share this 6-digit code with your guest. The guard will verify this at the gate.
                </p>
              </div>
            )}
          </div>

          {/* Visitor Log (Resident side) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Invite Logs & Check-ins</h2>
                <p className="text-slate-500 text-xs mt-0.5">Logs and check-in times for your guests.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              {loading ? (
                <Spinner size="md" />
              ) : (
                <Table>
                  <Thead>
                    <Tr hover={false}>
                      <Th>Visitor</Th>
                      <Th>Flat</Th>
                      <Th>Check-In Date/Time</Th>
                      <Th>Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredVisitors.length > 0 ? (
                      filteredVisitors.map(v => (
                        <Tr key={v._id}>
                          <Td>
                            <div>
                              <p className="font-semibold text-slate-800 text-xs">{v.name || 'Anonymous Invite'}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{v.type}</p>
                            </div>
                          </Td>
                          <Td className="text-xs">
                            {v.flat ? `Flat ${v.flat.flatNumber} (${v.flat.block})` : 'N/A'}
                          </Td>
                          <Td className="text-xs text-slate-600">
                            {v.checkIn ? new Date(v.checkIn).toLocaleString() : <span className="text-slate-400 italic">Waiting...</span>}
                          </Td>
                          <Td>
                            <Badge variant={v.status === 'accepted' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning'}>
                              {v.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr hover={false}>
                        <Td colSpan={4} className="text-center py-12 text-slate-400">
                          No invitations or visitors recorded yet.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 👮 Guard Station Portal View */}
      {isGuard && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-[#005c2b]" size={26} />
                Guard Station
              </h1>
              <p className="text-slate-500 text-sm">Gatekeeper verification and walk-in registry dashboard.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setActiveTab('verify')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'verify' ? 'bg-[#005c2b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Verify Passcode
              </button>
              <button 
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'register' ? 'bg-[#005c2b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Register Walk-in
              </button>
              <button 
                onClick={() => setActiveTab('logs')}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${activeTab === 'logs' ? 'bg-[#005c2b] text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                Visitor Logs
              </button>
            </div>
          </div>

          {/* Tab 1: Verify Invite Passcode */}
          {activeTab === 'verify' && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center">
              <div className="h-14 w-14 bg-emerald-50 text-[#005c2b] rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-sm">
                <KeyRound size={26} />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800">Passcode Gate Entry</h2>
                <p className="text-slate-500 text-xs">Verify guest pre-authorized 6-digit invitation code.</p>
              </div>

              <form onSubmit={handleSubmitVerify(onVerifyPasscode)} className="space-y-4 pt-2">
                <Input 
                  type="text" 
                  placeholder="Enter 6-digit code..." 
                  className="text-center font-mono text-xl tracking-widest py-3 border border-slate-200"
                  {...registerVerify('passcode', { required: true, minLength: 6, maxLength: 6 })}
                />
                <Button type="submit" className="w-full py-3 font-semibold text-sm flex justify-center gap-2" loading={loading}>
                  Verify & Approve Entry
                  <ArrowRight size={16} />
                </Button>
              </form>
            </div>
          )}

          {/* Tab 2: Register Walk-in */}
          {activeTab === 'register' && (
            <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <UserCheck className="text-[#005c2b]" size={20} />
                <h2 className="text-lg font-bold text-slate-800">Register Walk-in Guest</h2>
              </div>

              <form onSubmit={handleSubmitWalkin(onRegisterWalkin)} className="space-y-4">
                <Input 
                  label="Visitor Full Name" 
                  placeholder="e.g. John Miller" 
                  error={walkinErrors.name?.message}
                  {...registerWalkin('name', { required: 'Name is required' })}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 ml-0.5">Visitor Type</label>
                    <select 
                      className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                      {...registerWalkin('type', { required: 'Type is required' })}
                    >
                      <option value="guest">Guest</option>
                      <option value="delivery">Delivery Person</option>
                      <option value="electrician">Electrician</option>
                      <option value="plumber">Plumber</option>
                      <option value="other">Other Service</option>
                    </select>
                  </div>
                  <Input 
                    label="Phone Number" 
                    placeholder="e.g. 9876543210" 
                    type="number"
                    error={walkinErrors.phone?.message}
                    {...registerWalkin('phone', { required: 'Phone is required' })}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 ml-0.5">Destination Flat</label>
                  <select 
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                    {...registerWalkin('flatId', { required: 'Flat assignment is required' })}
                  >
                    <option value="">Select Flat</option>
                    {flats.map(flat => (
                      <option key={flat._id} value={flat._id}>
                        Flat {flat.flatNumber} (Block {flat.block})
                      </option>
                    ))}
                  </select>
                  {walkinErrors.flatId && (
                    <p className="text-[11px] text-rose-500 font-medium ml-0.5">{walkinErrors.flatId.message}</p>
                  )}
                </div>

                <Input 
                  label="Purpose of Visit" 
                  placeholder="e.g. Parcel delivery / Repair works" 
                  {...registerWalkin('purpose')}
                />

                <Button type="submit" className="w-full py-2.5 flex justify-center" loading={loading}>
                  Submit Approval Request
                </Button>
              </form>
            </div>
          )}

          {/* Tab 3: Today's Visitor Logs */}
          {activeTab === 'logs' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {loading ? (
                <Spinner size="md" />
              ) : (
                <Table>
                  <Thead>
                    <Tr hover={false}>
                      <Th>Visitor Details</Th>
                      <Th>Flat Destination</Th>
                      <Th>Type</Th>
                      <Th>Registered By</Th>
                      <Th>Status</Th>
                      <Th>Time Logged</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {visitors.length > 0 ? (
                      visitors.map(v => (
                        <Tr key={v._id}>
                          <Td>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-800 text-xs">{v.name || <span className="italic text-slate-400">Anonymized PII</span>}</span>
                              <span className="text-[10px] text-slate-400">{v.phone || 'PII Purged'}</span>
                            </div>
                          </Td>
                          <Td className="text-xs">
                            {v.flat ? `Flat ${v.flat.flatNumber} (${v.flat.block})` : 'N/A'}
                          </Td>
                          <Td className="capitalize text-xs font-semibold text-slate-600">{v.type}</Td>
                          <Td className="text-xs text-slate-500">{v.registeredBy?.name || 'Gatekeeper'}</Td>
                          <Td>
                            <Badge variant={v.status === 'accepted' ? 'success' : v.status === 'rejected' ? 'danger' : 'warning'}>
                              {v.status}
                            </Badge>
                          </Td>
                          <Td className="text-[11px] text-slate-500 font-medium">
                            {v.checkIn ? new Date(v.checkIn).toLocaleString() : <span className="text-slate-400 italic">Pending Entry</span>}
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr hover={false}>
                        <Td colSpan={6} className="text-center py-12 text-slate-400">
                          No visitor logs loaded.
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              )}
            </div>
          )}

          {/* ⏳ Real-Time Approval Waiting Overlay Modal for Guards */}
          {pendingVisitor && (
            <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
              <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-2xl max-w-md w-full text-center space-y-6 transform scale-100 transition-all duration-300">
                {pendingStatus === 'pending' && (
                  <>
                    <Loader2 size={48} className="animate-spin text-amber-500 mx-auto" />
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold text-slate-800">Waiting for Approval</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Sent walk-in request for <strong>{pendingVisitor.name}</strong> to Flat {flats.find(f => f._id === pendingVisitor.flat)?.flatNumber}.
                      </p>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 font-semibold max-w-xs mx-auto flex items-center justify-center gap-2">
                      <Smartphone size={16} className="animate-bounce" />
                      Fallback Email Trigger Active (60s timer)
                    </div>
                  </>
                )}

                {pendingStatus === 'accepted' && (
                  <>
                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300 animate-scale-up">
                      <CheckCircle size={36} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-emerald-800">ACCESS APPROVED</h3>
                      <p className="text-slate-500 text-sm">
                        Resident approved entry for guest <strong>{pendingVisitor.name}</strong>.
                      </p>
                    </div>
                    <p className="text-[#047857] text-xs font-semibold uppercase tracking-widest bg-emerald-50 py-2 rounded-lg border border-emerald-100">
                      Open Gate Now
                    </p>
                  </>
                )}

                {pendingStatus === 'rejected' && (
                  <>
                    <div className="h-16 w-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-rose-300 animate-scale-up">
                      <ShieldAlert size={36} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-rose-800">ACCESS DENIED</h3>
                      <p className="text-slate-500 text-sm">
                        Resident rejected entry for guest <strong>{pendingVisitor.name}</strong>.
                      </p>
                    </div>
                    <p className="text-rose-700 text-xs font-semibold uppercase tracking-widest bg-rose-50 py-2 rounded-lg border border-rose-100">
                      Do Not Allow Entry
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Visitors;
