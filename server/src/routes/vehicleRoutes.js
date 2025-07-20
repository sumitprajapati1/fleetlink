import express from "express";
import { validateVehicle, validateAvailabilityQuery, createVehicle, getAvailableVehicles, getVehicles } from "../controller/vehcile.contoller.js";

const router = express.Router();

router.post('/', validateVehicle, createVehicle);
router.get('/available', validateAvailabilityQuery, getAvailableVehicles);
router.get('/', getVehicles);

export default router;

