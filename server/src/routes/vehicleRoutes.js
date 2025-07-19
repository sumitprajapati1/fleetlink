import express from "express";
import { body, query, param, validationResult } from "express-validator";
import Vehicle from "../models/Vehicle.js"
import Booking from "../models/Booking.js"
import {AppError} from "../middleware/errorHandler.js";
import { calculateRideDuration } from "../utils/rideCalculator.js";

const router = express.Router();

const validateVehicle = [
    body('name').notEmpty().withMessage('Vehicle name is required'),
    body('capacityKg').notEmpty().isFloat({ min: 1 }).withMessage('Capacity is required'),
    body('tyres').notEmpty().isInt({ min: 1 }).withMessage('Number of tyres is required'),
]

const validateAvailabilityQuery = [
    query('capacityRequired').isNumeric().notEmpty().withMessage('Capacity is required'),
    query('fromPincode').matches(/^\d{6}$/).notEmpty().withMessage('From pincode is required'),
    query('toPincode').matches(/^\d{6}$/).notEmpty().withMessage('To pincode is required'),
    query('startTime').isISO8601().withMessage('Start time must be in ISO 8601 format'),
    // query('endTime').isISO8601().withMessage('End time must be in ISO 8601 format'),
]


router.post('/', validateVehicle, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError('Validation error', 400, errors.array()));
        }
        const { name, capacityKg, tyres } = req.body;
        const existingVehicle = await Vehicle.findOne({ name });
        if (existingVehicle) {
            return next(new AppError('Vehicle already exists', 400));
        }
        const vehicle = new Vehicle({
            name: name,
            capacityKg: Number(capacityKg),
            tyres: Number(tyres),
        });
        await vehicle.save();
        res.status(201).json({
            success: true,
            message: "Vehicle created successfully",
            data: vehicle
        });
    }
    catch (err) {
        next(err);
    }
})

router.get('/available', validateAvailabilityQuery, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError('Validation error', 400, errors.array()));
        }
        const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

        const capacity = Number(capacityRequired);
        const startDateTime = new Date(startTime);
        if (startDateTime < new Date()) {
            return next(new AppError('Start time must be in the future', 400));
        }

        const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
        const endDateTime = new Date(startDateTime.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

        const eligibleVehicles = await Vehicle.find({
            capacityKg: { $gte: capacity },
            isActive: true,
        })

        if (eligibleVehicles.length === 0) {
            return res.status(200).json({
                success: true,
                message: "No eligible vehicles found",
                data: [],
                estimatedRideDurationHours
            })
        }

        const vehicleIds = eligibleVehicles.map((v) => v._id);

        const conflictBookings = await Booking.find({
            vehicleId: { $in: vehicleIds },
            status: { $ne: 'CANCELLED' },
            $or: [
                // Existing booking starts before our end time AND ends after our start time
                {
                    startTime: { $lt: endDateTime },
                    endTime: { $gt: startDateTime }
                }
            ]
        })

        const conflictedVehiclesIds = conflictBookings.map(b=> b.vehicleId.toString()); 

        const availableVehicles = eligibleVehicles.filter(
            vehicle=> !conflictedVehiclesIds.includes(vehicle._id.toString())
        )

        const response = availableVehicles.map(vehicle => ({
            ...vehicle.toObject(),
            estimatedRideDurationHours
          }));
      
          res.status(200).json({
            success: true,
            message: `Found ${response.length} available vehicles`,
            data: response,
            estimatedRideDurationHours
          });
    }
    catch (err) {
        next(err);
    }
})

router.get('/',async(req,res,next)=>{
    try{
        const {page=1,limit=10,isActive} = req.query;
        const filter = {};
        if(isActive){
            filter.isActive = isActive === 'true';
        }
        const vehicles = await Vehicle.find(filter).skip((page-1)*limit).limit(limit*1);
        const total = await Vehicle.countDocuments(filter);
        
        
        res.status(200).json({
            success:true,
            message:"Vehicles fetched successfully",
            data:vehicles,
            pagination:{
                total,
                page:Number(page),
                limit:Number(limit),
                pages:Math.ceil(total/limit)
            }
        })
    }catch(err){
        next(err);
    }
})

export default router;

