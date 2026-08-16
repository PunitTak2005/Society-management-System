import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  expiryDate: {
    type: Date,
  },
});

const Notice = mongoose.model('Notice', noticeSchema);

export default Notice;
