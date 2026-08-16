import mongoose from 'mongoose';

const visitorsSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  type: {
    type: String,
    enum: ['delivery', 'electrician', 'guest', 'plumber', 'other'],
    required: true,
  },
  phone: {
    type: Number,
  },
  purpose: {
    type: String,
  },
  flat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat',
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  passcodeHash: {
    type: String,
  },
  passcodeValidFrom: {
    type: Date,
  },
  passcodeValidTo: {
    type: Date,
  },
  isSingleUseUsed: {
    type: Boolean,
    default: false,
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  registeredBy:  {
    type : mongoose.Schema.Types.ObjectId ,
    ref : 'User'
  }
});

const Visitor = mongoose.model('Visitor', visitorsSchema);

export default Visitor