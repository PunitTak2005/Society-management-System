import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResidentFlat } from '../redux/slice/flatSlice';
import { Spinner, Badge, Button } from '../component/ui';
import { Home, ShieldCheck, Zap, Droplet, Wifi, AlertTriangle, CreditCard, ShieldAlert, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function MyFlat() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { flat, loading } = useSelector((state) => state.flat);

  useEffect(() => {
    dispatch(getResidentFlat());
  }, [dispatch]);

  if (loading) {
    return <Spinner size="lg" />;
  }

  if (!flat) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center max-w-lg mx-auto shadow-sm animate-scale-in mt-12">
        <Home size={48} className="mx-auto text-slate-400 mb-4" />
        <h2 className="text-lg font-bold text-slate-800">No Assigned Flat Found</h2>
        <p className="text-slate-500 text-sm mt-2">
          It looks like you are not currently assigned to any flat in the society records. Please contact the society admin desk to get registered.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Home className="text-[#005c2b]" size={24} />
          My Residence Details
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          View assigned flat details, verified society utilities, and quick control panel pathways.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 premium-card-hover">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-[#005c2b]" />
            <div className="space-y-3 pl-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Flat Registry</span>
                <Badge variant="success" className="text-[9px] font-bold py-0.5 px-2">Active</Badge>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950">
                Flat {flat.flatNumber}
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 mt-2">
                <span className="flex items-center gap-1.5"><Zap size={14} className="text-[#005c2b]" /> Block {flat.block}</span>
                <span className="flex items-center gap-1.5"><Droplet size={14} className="text-[#005c2b]" /> Floor {flat.floor}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#005c2b]" /> Occupancy Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-emerald-50 text-[#005c2b] flex-shrink-0">
              <Sparkles size={36} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Included Premium Utilities & Amenities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-50 text-[#005c2b]"><Droplet size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">Continuous Water Supply</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">24/7 reverse osmosis filtration pipeline enabled.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-50 text-[#005c2b]"><Zap size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">100% Power Backup</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Dual-grid connection with automated generator backup.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-50 text-[#005c2b]"><Wifi size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">Fiber Internet Gateway</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pre-routed optical distribution box configured.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-50 text-[#005c2b]"><ShieldCheck size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">24/7 Security Guard Desk</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Automated visitor passes and regular area sweeps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-850 shadow-md text-white space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl" />
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <ShieldCheck size={18} />
              Residence Command
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Instantly review maintenance statements, register active flat complaints, or request security logs.
            </p>
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => navigate('/dashboard/payments')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2"><CreditCard size={16} className="text-emerald-400" /> Pay Dues / Invoices</span>
                <ArrowRight size={14} />
              </button>
              <button 
                onClick={() => navigate('/dashboard/my-complaints')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold"
              >
                <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-rose-400" /> Lodge a Complaint</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-amber-200/60 bg-amber-50/10 shadow-sm flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-800">Security Gatekeeper Alert</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-semibold">
                Please make sure to approve all visitor logs inside the Visitor Panel to allow guards to clear incoming guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyFlat;
