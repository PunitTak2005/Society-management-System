import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, clearUserError, clearUserMessage, createUser, updateUser, deactivateUser } from '../redux/slice/userSlice';
import { fetchRoles } from '../redux/slice/roleSlice';
import { fetchAvailableFlats } from '../redux/slice/flatSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input 
} from './ui';
import { UserPlus, Search, MoreVertical, Edit2, Trash2 } from 'lucide-react';

function ManageUsers() {
  const dispatch = useDispatch();
  const { users, loading, error, message } = useSelector((state) => state.user);
  const { roles } = useSelector((state) => state.role);
  const { flats } = useSelector((state) => state.flat);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editUserId, setEditUserId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    roleId: '',
    flatId: '',
  });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchAvailableFlats());
  }, [dispatch]);

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditUserId(user._id);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        roleId: user.role?._id || '',
        flatId: user.flat || '',
      });
    } else {
      setEditUserId(null);
      setFormData({ name: '', email: '', phone: '', roleId: '', flatId: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editUserId) {
      dispatch(updateUser({ id: editUserId, userData: formData })).then(() => dispatch(fetchUsers()));
    } else {
      dispatch(createUser(formData)).then(() => dispatch(fetchUsers()));
    }
    setIsDialogOpen(false);
  };

  const handleDeactivate = (id) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      dispatch(deactivateUser(id)).then(() => dispatch(fetchUsers()));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedRole = roles.find(r => r._id === formData.roleId);
  const isResident = selectedRole?.role?.toLowerCase() === 'resident';

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manage Users</h1>
          <p className="text-slate-500 text-sm">View and manage all society members and staff.</p>
        </div>
        <Button 
          leftIcon={<UserPlus size={18} />} 
          onClick={() => handleOpenDialog()}
        >
          Add New User
        </Button>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name or email..."
            className="w-full has-icon pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Created At</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <Tr key={user._id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant="slate" className="capitalize">
                        {user.role?.role || 'Unknown'}  
                      </Badge>
                    </Td>
                    <Td>
                      <Badge variant={user.isActive !== false ? 'success' : 'danger'}>
                        {user.isActive !== false ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td className="text-slate-500 text-xs">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenDialog(user)}
                          className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        {user.isActive !== false && (
                          <button 
                            onClick={() => handleDeactivate(user._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Deactivate User"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={5} className="text-center py-12 text-slate-500">
                    No users found matching your search.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editUserId ? "Edit User" : "Add New User"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editUserId ? "Update User" : "Create User"}</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          <Input 
            label="Full Name" 
            placeholder="John Doe" 
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="john@example.com" 
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 ml-0.5">Role</label>
              <select 
                name="roleId"
                value={formData.roleId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              >
                <option value="">Select Role</option>
                {roles.map(role => (
                  <option key={role._id} value={role._id} className="capitalize">
                    {role.role}
                  </option>
                ))}
              </select>
            </div>
            <Input 
              label="Phone Number" 
              placeholder="+1 234 567 890" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          {isResident && !editUserId && (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 ml-0.5">Assign Flat</label>
              <select 
                name="flatId"
                value={formData.flatId}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              >
                <option value="">Select a Flat</option>
                {flats.map(flat => (
                  <option key={flat._id} value={flat._id}>
                    {flat.flatNumber} (Block {flat.block})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export default ManageUsers;
