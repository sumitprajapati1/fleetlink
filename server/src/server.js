import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import {connectDB,disconnectDB} from "./config/database.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL||"http://localhost:3000",
    credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(helmet()); 

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
})
app.use('/api/',limiter);

app.use(express.json({limit: "10mb"}));
app.use(express.urlencoded({extended: true, limit: "10mb"}));


app.use('*',(req,res)=>{
    res.status(404).json({
        error:"Route not found",
        message: `Cannot ${req.method} ${req.originalUrl}`
    })
})

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async()=>{
    try{
        await connectDB();
        app.listen(PORT,()=>{
            console.log(`Server is running on port ${PORT}`);
        })
    }
    catch(err){
        console.log('Failed to start server',err);  
        await disconnectDB();
        process.exit(1);
    }
}

startServer();

export default app;