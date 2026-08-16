import mongoose from "mongoose";
import dotenv from 'dotenv' ;

dotenv.config();
console.log(process.env.MONGODB_URI);

const connectDb = async() => {
    try {
    const connection =   await  mongoose.connect(process.env.MONGODB_URI) 
    console.log('MONGODB IS UP')
    } catch (error) {
        console.log(error)
    }


}

export default connectDb