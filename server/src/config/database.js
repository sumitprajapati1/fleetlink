import mongoose from "mongoose";

const connectDB = async()=>{
    try{
        const connection = await mongoose.connect(process.env.MONGODB_URI); 
        console.log(`MongoDB connected successfully: ${connection.connection.host}`);
    }
    catch(err){
        console.error('MongoDB connection failed',err);
        throw err;
    }
}

const disconnectDB = async()=>{
    try{
        await mongoose.connection.close();
        console.log('MongoDB disconnected');
    }
    catch(err){
        console.error('MongoDB disconnection failed',err);
        throw err;
    }
}

export {connectDB,disconnectDB};