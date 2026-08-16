import mongoose from 'mongoose';

const flatSchema = new mongoose.Schema({
  flatNumber: {
    type: Number,
  },
  block: {
    type: String,
  },
  floor: {
    type: Number,
  },
  isOccupied : {
    type : Boolean,
    default : false
  }
  
});

const Flat = mongoose.model('Flat' , flatSchema)

export default Flat;
