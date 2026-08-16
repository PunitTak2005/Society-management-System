import mongoose, { Mongoose } from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    trim: true,
    required: [true, 'Email is required'],
  },
  phone : {
    type : Number
  },
  password: {
    type: String,
    trim: true,
    required: [true, 'Password is required'],
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  profilePhoto: {
    type: String,
  },
  flat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Flat',
  },
  otp : {
    type : String ,
  },
  otpExpiresIn : {
    type : Date
  }
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);

export default User;
// client validate => req validate  => mongoose validate;
