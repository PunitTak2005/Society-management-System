import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { updateSelfProfileThunk } from '../redux/slice/authSlice';
import { Button, Input, Spinner } from '../component/ui';
import { User, KeyRound, Home, Mail, Phone, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Badge } from '../component/ui';

function Profile() {
  const dispatch = useDispatch();
  const { name, email, profilePhoto, role, loading } = useSelector((state) => state.auth);
  
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch
  } = useForm();

  const fetchProfileDetails = async () => {
    try {
      setLoadingProfile(true);
      const userId = Cookies.get('id');
      if (!userId) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        withCredentials: true
      });
      setProfileData(res.data.data);
      resetProfile({
        name: res.data.data.name || '',
        email: res.data.data.email || '',
        phone: res.data.data.phone || ''
      });
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  const onSubmitProfile = (data) => {
    dispatch(updateSelfProfileThunk(data)).then((res) => {
      if (!res.error) {
        toast.success('Profile details updated successfully');
        fetchProfileDetails();
      }
    });
  };

  const onSubmitPassword = async (data) => {
    try {
      setChangingPassword(true);
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile/change-password`,
        { oldPassword: data.oldPassword, newPassword: data.newPassword },
        { withCredentials: true }
      );
      toast.success(res.data.message || 'Password changed successfully');
      resetPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <Spinner size="md" />
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="text-[#005c2b]" size={24} />
          My Profile & Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your personal details, secure your account, and view flat occupancy specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User size={18} className="text-[#005c2b]" />
              Account Details
            </h2>
            
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  error={profileErrors.name?.message}
                  {...registerProfile('name', { required: 'Name is required' })}
                />
                <Input 
                  label="Email Address" 
                  type="email"
                  error={profileErrors.email?.message}
                  {...registerProfile('email', { required: 'Email is required' })}
                />
              </div>

              <Input 
                label="Phone Number" 
                placeholder="e.g. +91 9876543210"
                error={profileErrors.phone?.message}
                {...registerProfile('phone')}
              />

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={loading}>Save Profile Changes</Button>
              </div>
            </form>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound size={18} className="text-[#005c2b]" />
              Security & Password
            </h2>

            <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
              <Input 
                label="Current Password" 
                type="password"
                placeholder="••••••••"
                error={passwordErrors.oldPassword?.message}
                {...registerPassword('oldPassword', { required: 'Current password is required' })}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="New Password" 
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.newPassword?.message}
                  {...registerPassword('newPassword', { 
                    required: 'New password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                />
                <Input 
                  label="Confirm New Password" 
                  type="password"
                  placeholder="••••••••"
                  error={passwordErrors.confirmPassword?.message}
                  {...registerPassword('confirmPassword', { 
                    required: 'Confirm password is required',
                    validate: (value) => value === watch('newPassword') || 'Passwords do not match'
                  })}
                />
              </div>

              <div className="flex justify-end pt-2">
                <Button type="submit" loading={changingPassword}>Update Password</Button>
              </div>
            </form>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center relative overflow-hidden premium-card-hover">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#005c2b]" />
            
            <div className="flex flex-col items-center pt-2">
              <div className="relative group">
                <img 
                  src={profilePhoto || '/default-avatar.png'} 
                  alt="Profile" 
                  className="h-24 w-24 rounded-2xl object-cover border-2 border-slate-100 shadow-sm"
                />
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-4">{name}</h3>
              <Badge variant="primary" className="mt-1 capitalize px-3 py-1 font-semibold text-xs">
                {role}
              </Badge>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-left text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span>{email}</span>
              </div>
              {profileData?.phone && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>Joined {new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {profileData?.flat && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 premium-card-hover">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Home size={18} className="text-[#005c2b]" />
                Flat Occupancy Details
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Flat Number</span>
                  <span className="font-bold text-slate-700">Flat {profileData.flat.flatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Block Code</span>
                  <span className="font-bold text-slate-700">Block {profileData.flat.block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Floor Level</span>
                  <span className="font-bold text-slate-700">{profileData.flat.floor} Floor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Occupancy Status</span>
                  <Badge variant="success" className="font-bold">
                    Occupied
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
