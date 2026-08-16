import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'in-progress'],
    default: 'pending',
  },
  resident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

export default Complaint;



//create you own custom theme component
//use these compoents you have created across your project
//implement react hook form 
//create the crud operations for complaint and notices
//implement both slices in the client
//create a strcutre for all the pages like notice , complain , flat and user 
//structure inclue a table with a header 