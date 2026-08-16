import React, { useState, useRef } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Bell,
  User,
  LayoutDashboard,
  Users,
  Home,
  ShieldAlert,
  Megaphone,
  CreditCard,
  ClipboardList,
  UserCheck,
  Shield,
  Outdent,
  Camera,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Signout, updateProfilePhotoSuccess } from '../redux/slice/authSlice';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const LayoutWrapper = ({ children, navItems }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const { name, role, email, profilePhoto } = useSelector((state) => state.auth);
  const [uploading, setUploading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    dispatch(Signout())
      .unwrap()
      .then(() => {
        navigate('/login');
      });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setUploading(true);
    const userId = Cookies.get('id');

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/profile-photo`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      dispatch(updateProfilePhotoSuccess(response.data.profilePhoto));
      toast.success('Profile photo updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar */}
      <aside
        className={`bg-[#005c2b] text-white transition-all duration-300 ease-in-out flex-shrink-0 z-30 shadow-xl ${
          isSidebarOpen ? 'w-64' : 'w-20'
        } flex flex-col h-screen sticky top-0`}
      >
        {/* Logo Section */}
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
          <div className="min-w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="text-[#005c2b]" size={20} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-lg whitespace-nowrap overflow-hidden">
              SMS Portal
            </span>
          )}
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? 'bg-white/20 text-white shadow-sm'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div
                  className={`flex-shrink-0 ${
                    isActive ? 'scale-110' : 'group-hover:scale-110'
                  } transition-transform`}
                >
                  <Icon size={22} />
                </div>
                {isSidebarOpen && (
                  <span className="font-medium text-[14px] whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Section / Bottom */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 text-white/70 hover:bg-red-500/20 hover:text-red-100 rounded-xl transition-all group"
          >
            <LogOut
              size={22}
              className="group-hover:translate-x-1 transition-transform"
            />
            {isSidebarOpen && (
              <span className="font-medium text-[14px]">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-slate-900 font-semibold text-sm capitalize">
                Welcome back, {name || 'User'}
              </h1>
              <p className="text-slate-500 text-[11px] leading-tight">
                Role: {role?.replace('_', ' ') || 'Guest'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 pl-2">
              <div className="text-right hidden md:block">
                <p className="text-xs font-semibold text-slate-900 leading-none">
                  {name}
                </p>
                <p className="text-[10px] text-slate-500 leading-none mt-1">
                  {email}
                </p>
              </div>

              {/* Hidden file input */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />

              {/* Interactive Profile Photo / Initial Avatar with Hover Edit State */}
              <div 
                onClick={handleAvatarClick}
                className="relative w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-sm cursor-pointer group flex items-center justify-center bg-primary-100 text-primary-700 transition-all duration-200 hover:border-primary-500"
                title="Click to change profile picture"
              >
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/40 z-10 flex items-center justify-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt={name || 'Profile'} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <span className="font-bold text-sm select-none">
                    {name?.charAt(0).toUpperCase() || <User size={16} />}
                  </span>
                )}
                
                {/* Dark transparent camera hover overlay */}
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={14} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default LayoutWrapper;
