import express from "express";
import { validateBooking, createBooking, getBookings, getBookingById, cancelBooking } from "../controller/booking.controller.js";

const router = express.Router();

router.post('/', validateBooking, createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.delete('/:id', cancelBooking);

export default router;
