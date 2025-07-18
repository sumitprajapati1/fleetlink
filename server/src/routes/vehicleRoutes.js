import express from "express";
import { body,query,param,validationResult } from "express-validator";
import Vehicle from "../models/Vehicle.js"
import Booking from "../models/Booking.js"
import {errorHandler} from "../middlewares/errorHandler.js";
import AppError from "../utils/AppError.js";


const validateVehicle = [
    body('name').notEmpty().withMessage('Vehicle name is required'),
    body('capacityKg').notEmpty().isFloat({min:1}).withMessage('Capacity is required'),
    body('tyres').notEmpty().isInt({min:1}).withMessage('Number of tyres is required'),
]

const validateAvailabilityQuery = [
    query('capacityRequired').isNumeric().notEmpty().withMessage('Capacity is required'),
    query('fromPincode').matches(/^\d{6}$/).notEmpty().withMessage('From pincode is required'),
    query('toPincode').matches(/^\d{6}$/).notEmpty().withMessage('To pincode is required'),
    query('startTime').isISO8601().withMessage('Start time must be in ISO 8601 format'),
    query('endTime').isISO8601().withMessage('End time must be in ISO 8601 format'),
]


router.post('/',validateVehicle,async(req,res,next)=>{
    try{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return next(new AppError('Validation error',400,errors.array()));
        }
        const {name,capacityKg,tyres} = req.body;
        const existingVehicle = await Vehicle.findOne({name});
        if(existingVehicle){
            return next(new AppError('Vehicle already exists',400));
        }
        const vehicle = new Vehicle({
            name:name,
            capacityKg:Number(capacityKg),
            tyres:Number(tyres),
        });
        await vehicle.save();
        res.status(201).json({
            success:true,
            message:"Vehicle created successfully",
            data:vehicle
        });
    }
    catch(err){
        next(err);
    }
})

router.get('/available')


