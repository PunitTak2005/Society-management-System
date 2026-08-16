import React from 'react';
import { useSelector } from 'react-redux';
import LayoutWrapper from './LayoutWrapper';
import {
  LayoutDashboard,
  Users,
  Home,
  ShieldAlert,
  Megaphone,
  CreditCard,
  ClipboardList,
  UserCheck,
  ShieldCheck,
  Activity,
  TrendingUp,
  Package,
  Car,
  Outdent,
  Users2,
  User,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const { role } = useSelector((state) => state.auth);

  
  const getNavItems = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/dashboard/stats', icon: LayoutDashboard },
          { label: 'Manage Users', path: '/dashboard/users', icon: Users },
          { label: 'Society Flats', path: '/dashboard/flats', icon: Home },
          { label: 'Guard Management', path: '/dashboard/staff', icon: UserCheck },
          { label: 'Payments', path: '/dashboard/payments', icon: CreditCard },
          { label: 'Complaints', path: '/dashboard/complaints', icon: ShieldAlert },
          { label: 'Announcements', path: '/dashboard/notices', icon: Megaphone },
          { label: 'My Settings', path: '/dashboard/profile', icon: User },
        ];
      case 'resident':
        return [
          { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Flat', path: '/dashboard/my-flat', icon: Home },
          { label: 'Payments', path: '/dashboard/payments', icon: CreditCard },
          { label: 'My Complaints', path: '/dashboard/my-complaints', icon: ShieldAlert },
          { label: 'Announcements', path: '/dashboard/notices', icon: Megaphone },
          { label: 'Visitors', path: '/dashboard/visitors', icon: Users2 },
          { label: 'My Settings', path: '/dashboard/profile', icon: User },
        ];
      case 'security_guard':
      case 'staff':
        return [
          { label: 'Guard Station', path: '/dashboard', icon: ShieldCheck },
          { label: 'Visitor Logs', path: '/dashboard/visitors', icon: Users },
          { label: 'Deliveries', path: '/dashboard/deliveries', icon: Package },
          { label: 'Parking Map', path: '/dashboard/parking', icon: Car },
          { label: 'Panic Alerts', path: '/dashboard/emergency', icon: ShieldAlert },
          { label: 'My Settings', path: '/dashboard/profile', icon: User },
        ];
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ];
    }
  };

  return (
    <LayoutWrapper navItems={getNavItems()}>
      <Outlet />
    </LayoutWrapper>
  );
};

const StatsCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="ds-panel p-6 flex flex-col justify-between group hover:border-primary-500/30 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-inherit/20`}
      >
        <Icon size={22} />
      </div>
      <div className="text-right">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
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

export default Dashboard;
