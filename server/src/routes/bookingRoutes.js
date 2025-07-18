import express from "express";
import { body, validationResult } from "express-validator";
import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import { calculateRideDuration } from "../utils/rideCalculator.js";
import { AppError, errorHandler } from "../middlewares/errorHandler.js";

const router = express.Router();

const validateBooking = [
    body('vehicleId').isMongoId().withMessage('Invalid vehicle ID'),
    body('customerId').notEmpty().withMessage('Customer Id is required'),
    body('fromPincode').matches(/^\d{6}$/).withMessage('From pincode is required'),
    body('toPincode').matches(/^\d{6}$/).withMessage('To pincode is required'),
    body('startTime').isISO8601().withMessage('Start time must be in ISO 8601 format'),
]

router.post('/', validateBooking, async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return next(new AppError('Validation error', 400, errors.array()));
        }
        const { vehicleId, customerId, fromPincode, toPincode, startTime } = req.body;
        const startDateTime = new Date(startTime);
        if (startDateTime < new Date()) {
            return next(new AppError('Start time must be in the future', 400));
        }
        const estimatedRideDurationHours = calculateRideDuration(fromPincode, toPincode);
        const endDateTime = new Date(startDateTime.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);
        await session.withTransaction(async () => {
            const vehicle = await Vehicle.findOne({ _id: vehicleId, isActive: true }).session(session);
            if (!vehicle) {
                throw new AppError('Vehicle not found', 404);
            }
            const conflictBooking = await Booking.findOne({
                vehicleId: vehicleId,
                status: { $ne: 'CANCELLED' },
                $or: [
                    { startTime: { $lt: endDateTime }, endTime: { $gt: startTime } }
                ]
            }).session(session);
            if (conflictBooking) {
                throw new AppError('Vehicle is already booked', 400);
            }
            const booking = new Booking({
                vehicleId,
                customerId: customerId.trim(),
                fromPincode,
                toPincode,
                startTime: startDateTime,
                endTime: endDateTime,
                estimatedRideDurationHours,
                status: 'BOOKED'
            })
            await booking.save({ session });
            await booking.populate('vehicleId', 'name capacityKg tyres');
        })
        res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking
        })
    } catch (err) {
        next(err);
    }
})

router.get('/', async (req, res, next) => {
    try {
        const { page = 1, limit = 10, customerId, vehicleId, status, startDate, endDate } = req.query;
        const filter = {};
        if (customerId) {
            filter.customerId = customerId;
        }
        if (vehicleId) {
            filter.vehicleId = vehicleId;
        }
        if (status) {
            filter.status = status;
        }
        if (startDate || endDate) {
            filter.startTime = {};
            if (startDate) {
                filter.startTime.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.startTime.$lte = new Date(endDate);
            }
        }
        const bookings = await Booking.find(filter).skip((page - 1) * limit).limit(limit * 1).populate('vehicleId', 'name capacityKg tyres')
            .sort({ createdAt: -1 });
        const total = await Booking.countDocuments(filter);
        res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / limit)
            }
        })
    } catch (err) {
        next(err);
    }
})

router.get('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id).populate('vehicleId', 'name capacityKg tyres');

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError('Invalid booking ID', 400));
        }

        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }
        res.status(200).json({
            success: true,
            message: "Booking fetched successfully",
            data: booking
        })
    } catch (err) {
        next(err);
    }
})

router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return next(new AppError('Invalid booking ID', 400));
        }
        const booking = await Booking.findById(id);
        if (!booking) {
            return next(new AppError('Booking not found', 404));
        }

        if (booking.status === 'CANCELLED') {
            return next(new AppError('Booking is already cancelled', 400));
        }

        if (booking.status === 'COMPLETED') {
            return next(new AppError('Booking is already completed', 400));
        }

        const now = new Date();
        const bookingStartTime = new Date(booking.startTime);
        const hoursDifference = (bookingStartTime - now) / (1000 * 60 * 60);

        if (hoursDifference < 1) {
            return next(new AppError('Cannot cancel booking less than 1 hour before start time', 400));
        }

        booking.status = 'CANCELLED';
        await booking.save();

        res.status(200).json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        next(error);
    }
})

export default router;
