import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  fetchComplaints, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint,
  clearComplaintError,
  clearComplaintMessage
} from '../redux/slice/complaintSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { ShieldAlert, Search, PlusCircle, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

function ManageComplaints() {
  const dispatch = useDispatch();
  const { 
    complaints, 
    loading, 
    error, 
    message,
    totalResults,
    totalPages,
    page,
    limit 
  } = useSelector((state) => state.complaint);
  const userRole = useSelector((state) => state.auth.role) || Cookies.get('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  // React Hook Form for Create/Edit Complaint
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  // React Hook Form for Status Updates (Admin only)
  const { 
    register: registerStatus, 
    handleSubmit: handleSubmitStatus, 
    setValue: setStatusValue 
  } = useForm();

  // Dynamic real-time backend filtering and pagination
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchComplaints({
        page: pageNumber,
        search: searchTerm,
        status: selectedStatus || undefined
      }));
    }, 300); // 300ms debounce to prevent layout thrashing

    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNumber, searchTerm, selectedStatus]);

  // Handle toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearComplaintError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearComplaintMessage());
    }
  }, [error, message, dispatch]);

  const handleOpenCreateDialog = () => {
    reset({ title: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleOpenStatusDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setStatusValue('status', complaint.status);
    setIsStatusDialogOpen(true);
  };

  const onSubmitComplaint = (data) => {
    dispatch(createComplaint(data)).then(() => {
      dispatch(fetchComplaints());
      setIsDialogOpen(false);
    });
  };

  const onSubmitStatus = (data) => {
    if (!selectedComplaint) return;
    dispatch(updateComplaint({ 
      id: selectedComplaint._id, 
      complaintData: { status: data.status } 
    })).then(() => {
      dispatch(fetchComplaints());
      setIsStatusDialogOpen(false);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      dispatch(deleteComplaint(id)).then(() => {
        dispatch(fetchComplaints());
      });
    }
  };

  // The complaints are already filtered and paginated on the backend
  const filteredComplaints = complaints || [];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle2 className="text-emerald-500 mr-1" size={14} />;
      case 'in-progress':
        return <Clock className="text-amber-500 mr-1" size={14} />;
      default:
        return <AlertCircle className="text-rose-500 mr-1" size={14} />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'danger';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={24} />
            {isAdmin ? 'Manage Society Complaints' : 'My Complaints'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin 
              ? 'View, track, and update resident filed complaints.' 
              : 'File new complaints or view the status of your reported issues.'}
          </p>
        </div>
        {!isAdmin && (
          <Button 
            leftIcon={<PlusCircle size={18} />} 
            onClick={handleOpenCreateDialog}
          >
            File a Complaint
          </Button>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search complaints by title, details..."
            className="w-full has-icon pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Complaint Details</Th>
                {isAdmin && <Th>Filed By</Th>}
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c) => (
                  <Tr key={c._id}>
                    <Td className="max-w-md">
                      <div>
                        <p className="font-semibold text-slate-900 text-[14px]">{c.title}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{c.description}</p>
                      </div>
                    </Td>
                    {isAdmin && (
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-xs">{c.resident?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-slate-400">{c.resident?.email}</span>
                        </div>
                      </Td>
                    )}
                    <Td>
                      <div className="flex items-center">
                        {getStatusIcon(c.status)}
                        <Badge variant={getStatusVariant(c.status)} className="capitalize">
                          {c.status}
                        </Badge>
                      </div>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end gap-2">
                        {isAdmin ? (
                          <button 
                            onClick={() => handleOpenStatusDialog(c)}
                            className="p-1.5 text-slate-400 hover:text-primary-600 transition-colors"
                            title="Update Status"
                          >
                            <Edit2 size={16} />
                          </button>
                        ) : null}
                        {(isAdmin || c.status === 'pending') && (
                          <button 
                            onClick={() => handleDelete(c._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Complaint"
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
                  <Td colSpan={isAdmin ? 4 : 3} className="text-center py-12 text-slate-500">
                    No complaints found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
        
        {/* Dynamic Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filteredComplaints.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalResults}</span> complaints
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <div className="flex items-center justify-center px-3 text-xs font-semibold text-slate-700">
                Page {pageNumber} of {totalPages}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* File Complaint Dialog (Residents Only) */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="File a New Complaint"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmitComplaint)}>Submit Complaint</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmitComplaint)} className="space-y-4 py-2">
          <Input 
            label="Complaint Title" 
            placeholder="e.g. Water Leakage in Block A" 
            error={errors.title?.message}
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 5, message: 'Minimum 5 characters required' }
            })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Details / Description</label>
            <textarea 
              rows={4}
              placeholder="Provide complete details about the issue..."
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-all duration-200 
                ${errors.description 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                  : 'border-slate-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10'}`}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Minimum 10 characters required' }
              })}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 font-medium ml-0.5">{errors.description.message}</p>
            )}
          </div>
        </form>
      </Dialog>

      {/* Update Status Dialog (Admins Only) */}
      <Dialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Update Complaint Status"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitStatus(onSubmitStatus)}>Update Status</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitStatus(onSubmitStatus)} className="space-y-4 py-2">
          {selectedComplaint && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
              <p className="text-xs font-semibold text-slate-500">Complaint Title</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedComplaint.title}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Status</label>
            <select 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              {...registerStatus('status', { required: true })}
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default ManageComplaints;
