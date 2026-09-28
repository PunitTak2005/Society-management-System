import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Dashboard from '../component/Dashboard';
import ProtectedRoutes from '../component/ProtectedRoutes';
import OpenRoutes from '../component/OpenRoutes';
import ManageUsers from '../component/ManageUsers';
import Stats from '../component/Stats';
import { useSelector } from 'react-redux';
import ManageFlat from '../pages/ManageFlat';
import ManageComplaints from '../pages/ManageComplaints';
import ManageNotices from '../pages/ManageNotices';
import MyFlat from '../pages/MyFlat';
import Visitors from '../pages/Visitors';
import Home from '../pages/Home';
import ManageBills from '../pages/ManageBills';
import Profile from '../pages/Profile';

import Cookies from 'js-cookie';

const RoleBasedIndex = () => {
  const { role } = useSelector((state) => state.auth);
  const currentRole = (role || Cookies.get('role') || '').toLowerCase();

  if (currentRole === 'admin') return <Stats />;
  if (currentRole === 'resident') return <MyFlat />;
  if (currentRole === 'security_guard' || currentRole === 'staff') return <Visitors />;
  return <Stats />;
};

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<OpenRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<RoleBasedIndex />} />
            
            {/* Admin Routes */}
            <Route path="stats" element={<Stats />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="flats" element={<ManageFlat />} />
            <Route path="staff" element={<ManageUsers />} />
            <Route path="complaints" element={<ManageComplaints />} />
            <Route path="notices" element={<ManageNotices />} />

            {/* Resident & Common Routes */}
            <Route path="my-flat" element={<MyFlat />} />
            <Route path="payments" element={<ManageBills />} />
            <Route path="my-complaints" element={<ManageComplaints />} />
            <Route path="profile" element={<Profile />} />
            <Route path="visitors" element={<Visitors />} />
            <Route path="deliveries" element={<Visitors />} />
            <Route path="parking" element={<Stats />} />
            <Route path="emergency" element={<Stats />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
