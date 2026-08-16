import React from 'react'
import { 
    LayoutDashboard, Users, Home, 
    ShieldAlert, Megaphone, CreditCard, 
    ClipboardList, UserCheck, ShieldCheck,
    Activity, TrendingUp, Package, Car,
    Outdent
  } from 'lucide-react';

  
function Stats() {
 
  return (
    
     <div>
        <div className="space-y-8 animate-in fade-in duration-700">
          <header>
            <h1 className="text-2xl font-bold text-slate-900">Administrator Console</h1>
            <p className="text-slate-500 text-sm mt-1">Manage society operations and user access control.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard title="Total Residents" value="1,240" icon={Users} color="bg-blue-500" trend="+12% from last month" />
            <StatsCard title="Occupancy Rate" value="94%" icon={Home} color="bg-emerald-500" trend="Stable" />
            <StatsCard title="Active Guards" value="18" icon={ShieldCheck} color="bg-indigo-500" trend="Full Strength" />
            <StatsCard title="Pending Issues" value="24" icon={ShieldAlert} color="bg-orange-500" trend="-5 since yesterday" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 ds-panel p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Society Overview</h3>
                  <Activity className="text-slate-400" size={20} />
                </div>
                <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                   <p className="text-slate-400 text-sm">Society Activity Graph Placeholder</p>
                </div>
             </div>
             <div className="ds-panel p-6">
                <h3 className="text-lg font-bold mb-6">Recent Alerts</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">New complaint registered in Block B</p>
                        <p className="text-[11px] text-slate-500">10 minutes ago</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>  
    </div>
  )
}


// Helper Component for Stats Cards
const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="ds-panel p-6 flex flex-col justify-between group hover:border-primary-500/30 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-inherit/20`}>
        <Icon size={22} />
      </div>
      <div className="text-right">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
    <div className="pt-4 border-t border-slate-50">
      <div className="flex items-center gap-1.5">
        <TrendingUp size={14} className="text-emerald-500" />
        <span className="text-[11px] font-medium text-slate-600">{trend}</span>
      </div>
    </div>
  </div>
);


export default Stats
