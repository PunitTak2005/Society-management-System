import mongoose from 'mongoose';

const BillSchema = new mongoose.Schema(
  {
    flat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flat',
      required: true,
    },
    resident: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['unpaid', 'paid', 'overdue'],
      default: 'unpaid',
    },
    paymentDate: {
      type: Date,
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking', 'cash'],
    },
  },
  { timestamps: true }
);

const Bill = mongoose.model('Bill', BillSchema);

export default Bill;
