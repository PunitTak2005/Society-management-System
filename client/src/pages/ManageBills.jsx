import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  fetchBills, 
  createBill, 
  payBill, 
  fetchBillStats,
  clearBillError,
  clearBillMessage
} from '../redux/slice/billSlice';
import { fetchFlats } from '../redux/slice/flatSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { 
  CreditCard, Search, PlusCircle, CheckCircle2, 
  Clock, AlertTriangle, TrendingUp, DollarSign, Award, ArrowUpRight 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

function ManageBills() {
  const dispatch = useDispatch();
  const userRole = useSelector((state) => state.auth.role) || Cookies.get('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const { 
    bills, 
    stats, 
    loading, 
    error, 
    message,
    totalResults,
    totalPages,
    page
  } = useSelector((state) => state.bill);

  const { flats } = useSelector((state) => state.flat);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPayDialogOpen, setIsPayDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      flatId: '',
      title: '',
      amount: '',
      dueDate: ''
    }
  });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchFlats({ limit: 100 }));
      dispatch(fetchBillStats());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchBills({
        page: pageNumber,
        search: searchTerm,
        status: selectedStatus || undefined
      }));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNumber, searchTerm, selectedStatus]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearBillError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearBillMessage());
      if (isAdmin) {
        dispatch(fetchBillStats());
      }
    }
  }, [error, message, dispatch, isAdmin]);

  const handleOpenCreateDialog = () => {
    reset({ flatId: '', title: '', amount: '', dueDate: '' });
    setIsDialogOpen(true);
  };

  const handleOpenPayDialog = (bill) => {
    setSelectedBill(bill);
    setPaymentMethod('card');
    setIsPayDialogOpen(true);
  };

  const onSubmitCreateBill = (data) => {
    dispatch(createBill(data)).then((res) => {
      if (!res.error) {
        setIsDialogOpen(false);
        dispatch(fetchBills({ page: 1 }));
      }
    });
  };

  const onSubmitPayment = () => {
    if (!selectedBill) return;
    dispatch(payBill({ id: selectedBill._id, paymentMethod })).then((res) => {
      if (!res.error) {
        setIsPayDialogOpen(false);
        dispatch(fetchBills({ page: pageNumber }));
      }
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="text-emerald-500 mr-1" size={14} />;
      case 'overdue':
        return <AlertTriangle className="text-rose-500 mr-1" size={14} />;
      default:
        return <Clock className="text-amber-500 mr-1" size={14} />;
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const unpaidBills = bills.filter(b => b.status !== 'paid');
  const paidBills = bills.filter(b => b.status === 'paid');
  const totalDuesAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const lastPaidBill = paidBills.length > 0 ? paidBills[0] : null;

  const collectionPercentage = stats && stats.totalBilled > 0 
    ? Math.round((stats.totalCollected / stats.totalBilled) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="text-[#005c2b]" size={24} />
            {isAdmin ? 'Society Billing & Maintenance' : 'My Maintenance & Bills'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin 
              ? 'Issue maintenance bills, track unpaid balances, and review collections.' 
              : 'Review due amounts, transaction histories, and make instant secure payments.'}
          </p>
        </div>
        {isAdmin && (
          <Button 
            leftIcon={<PlusCircle size={18} />} 
            onClick={handleOpenCreateDialog}
          >
            Issue New Bill
          </Button>
        )}
      </div>

      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 premium-card-hover">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">₹{stats.totalCollected.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{stats.paidCount} cleared invoices</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 premium-card-hover">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">₹{stats.totalOutstanding.toLocaleString()}</h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{stats.unpaidCount} outstanding</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 premium-card-hover">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Generated</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">₹{stats.totalBilled.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{stats.paidCount + stats.unpaidCount} total statements</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-[#005c2b]/20 bg-emerald-50/5 shadow-sm flex flex-col justify-center gap-2.5 premium-card-hover">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection Ratio</span>
              <span className="text-xs font-black text-[#005c2b] bg-emerald-100/50 px-2 py-0.5 rounded-full">{collectionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-[#005c2b] h-full rounded-full transition-all duration-500" 
                style={{ width: `${collectionPercentage}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 leading-none">High Collection Performance Rate</p>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 premium-card-hover transition-colors ${totalDuesAmount > 0 ? 'bg-amber-50/20 border-amber-200' : 'bg-white border-slate-200'}`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${totalDuesAmount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {totalDuesAmount > 0 ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding Dues</p>
              <h3 className={`text-xl font-bold mt-1 ${totalDuesAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{totalDuesAmount.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {unpaidBills.length} billing statements pending
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 premium-card-hover">
            <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0">
              <Award size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Statements</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{paidBills.length}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Transactions cleared successfully</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 premium-card-hover">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Payment Cleared</p>
              {lastPaidBill ? (
                <>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">₹{lastPaidBill.amount.toLocaleString()}</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{lastPaidBill.title}</p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold text-slate-400 mt-1">No receipts yet</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pending first payment setup</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search bills by title..."
            className="w-full has-icon pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm animate-scale-in"
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
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <Spinner size="md" />
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Invoice / Details</Th>
                <Th>Flat Number</Th>
                {isAdmin && <Th>Resident</Th>}
                <Th>Due Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bills.length > 0 ? (
                bills.map((b) => (
                  <Tr key={b._id} className="animate-scale-in">
                    <Td className="max-w-xs">
                      <div>
                        <p className="font-semibold text-slate-900 text-[14px]">{b.title}</p>
                        {b.transactionId ? (
                          <span className="text-[10px] text-slate-400 mt-1 block">Txn: {b.transactionId}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 mt-1 block">Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-semibold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded">
                        Flat {b.flat?.flatNumber} ({b.flat?.block})
                      </span>
                    </Td>
                    {isAdmin && (
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">{b.resident?.name}</span>
                          <span className="text-[10px] text-slate-400">{b.resident?.email}</span>
                        </div>
                      </Td>
                    )}
                    <Td className="text-slate-500 text-xs">
                      {new Date(b.dueDate).toLocaleDateString()}
                    </Td>
                    <Td>
                      <span className="font-extrabold text-slate-900">₹{b.amount.toLocaleString()}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center">
                        {getStatusIcon(b.status)}
                        <Badge variant={getStatusVariant(b.status)} className="capitalize">
                          {b.status}
                        </Badge>
                      </div>
                    </Td>
                    <Td className="text-right">
                      {!isAdmin && b.status !== 'paid' ? (
                        <Button 
                          size="xs" 
                          variant="primary" 
                          leftIcon={<CreditCard size={14} />}
                          onClick={() => handleOpenPayDialog(b)}
                          className="premium-btn-hover"
                        >
                          Pay Now
                        </Button>
                      ) : b.status === 'paid' ? (
                        <span className="text-emerald-600 text-[11px] font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">Receipt Clear</span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/50">Awaiting Payment</span>
                      )}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-slate-500">
                    No billing statements found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{bills.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalResults}</span> statements
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

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Issue Maintenance Statement"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmitCreateBill)}>Issue Statement</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmitCreateBill)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Select Target Flat</label>
            <select 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
              {...register('flatId', { required: 'Target flat selection is required' })}
            >
              <option value="">Choose Flat</option>
              {flats.map((flat) => (
                <option key={flat._id} value={flat._id}>
                  Flat {flat.flatNumber} (Block {flat.block})
                </option>
              ))}
            </select>
            {errors.flatId && (
              <p className="text-[11px] text-rose-500 font-medium ml-0.5">{errors.flatId.message}</p>
            )}
          </div>

          <Input 
            label="Statement Description / Title" 
            placeholder="e.g. Monthly Maintenance - June 2026" 
            error={errors.title?.message}
            {...register('title', { required: 'Title is required' })}
          />

          <Input 
            label="Amount (INR)" 
            type="number" 
            placeholder="e.g. 2500" 
            error={errors.amount?.message}
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 1, message: 'Amount must be greater than zero' }
            })}
          />

          <Input 
            label="Due Date" 
            type="date" 
            error={errors.dueDate?.message}
            {...register('dueDate', { required: 'Due date is required' })}
          />
        </form>
      </Dialog>

      <Dialog
        isOpen={isPayDialogOpen}
        onClose={() => setIsPayDialogOpen(false)}
        title="Secure Bill Payment"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsPayDialogOpen(false)}>Cancel</Button>
            <Button onClick={onSubmitPayment}>Confirm Payment</Button>
          </div>
        }
      >
        {selectedBill && (
          <div className="space-y-4 py-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center">
              <div>
                <p className="text-xs font-semibold text-slate-500">Paying Statement</p>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{selectedBill.title}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-500">Amount Due</p>
                <p className="text-base font-extrabold text-[#005c2b] mt-0.5">₹{selectedBill.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700 ml-0.5">Choose Payment Gateway</label>
              <div className="grid grid-cols-2 gap-3">
                <div 
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 
                    ${paymentMethod === 'card' 
                      ? 'border-[#005c2b] bg-emerald-50/30 ring-2 ring-[#005c2b]/15' 
                      : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <span className="text-xs font-bold text-slate-700">Credit / Debit Card</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? 'border-[#005c2b]' : 'border-slate-300'}`}>
                    {paymentMethod === 'card' && <div className="h-2 w-2 rounded-full bg-[#005c2b]" />}
                  </div>
                </div>

                <div 
                  className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all duration-200 
                    ${paymentMethod === 'upi' 
                      ? 'border-[#005c2b] bg-emerald-50/30 ring-2 ring-[#005c2b]/15' 
                      : 'border-slate-200 hover:bg-slate-50'}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  <span className="text-xs font-bold text-slate-700">UPI (GPay / PhonePe)</span>
                  <div className={`h-4 w-4 rounded-full border flex items-center justify-center ${paymentMethod === 'upi' ? 'border-[#005c2b]' : 'border-slate-300'}`}>
                    {paymentMethod === 'upi' && <div className="h-2 w-2 rounded-full bg-[#005c2b]" />}
                  </div>
                </div>
              </div>
            </div>

            {paymentMethod === 'card' ? (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <Input label="Cardholder Name" placeholder="e.g. Ramesh Kumar" />
                <Input label="Card Number" placeholder="e.g. 4321 •••• •••• 9876" maxLength={19} />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry Date" placeholder="MM/YY" />
                  <Input label="CVV" placeholder="•••" type="password" maxLength={3} />
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <Input label="UPI Address" placeholder="e.g. ramesh@okaxis" />
                <p className="text-[10px] text-slate-400 italic text-center">A collect request will be sent to your UPI app for processing.</p>
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default ManageBills;
