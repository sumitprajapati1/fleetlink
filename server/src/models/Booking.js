import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: [true, 'Vehicle ID is required']
      },
      customerId: {
        type: String,
        required: [true, 'Customer ID is required'],
        trim: true,
        minlength: [1, 'Customer ID cannot be empty']
      },
      fromPincode: {
        type: String,
        required: [true, 'From pincode is required'],
        match: [/^\d{6}$/, 'From pincode must be a 6-digit number']
      },
      toPincode: {
        type: String,
        required: [true, 'To pincode is required'],
        match: [/^\d{6}$/, 'To pincode must be a 6-digit number']
      },
      startTime: {
        type: Date,
        required: [true, 'Start time is required']
      },
      endTime: {
        type: Date,
        required: [true, 'End time is required']
      },
      estimatedRideDurationHours: {
        type: Number,
        required: [true, 'Estimated ride duration is required'],
        min: [0, 'Ride duration cannot be negative']
      },
      status: {
        type: String,
        enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'],
        default: 'CONFIRMED'
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
})


bookingSchema.pre('save',async function(next){
    this.updatedAt = Date.now();
    next();
})

bookingSchema.index({ customerId: 1, status: 1 },{unique:true});

const Booking = mongoose.model('Booking',bookingSchema);
export default Booking;