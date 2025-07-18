import mongoose from "mongoose";

const vehicleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Vehicle name is required'],
        trim: true,
        minlength: [2, 'Vehicle name must be at least 2 characters long'],
      },
      capacityKg: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1 kg'],
      },
      tyres: {
        type: Number,
        required: [true, 'Number of tyres is required'],
        min: [2, 'Vehicle must have at least 2 tyres'],
      },
      isActive: {
        type: Boolean,
        default: true
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

//this will update the updatedAt field with the current date and time
vehicleSchema.pre('save',async function(next){
    this.updatedAt = Date.now();
    next();
})  

//this will create a unique index on the name field
vehicleSchema.index({name:1},{unique:true});

const Vehicle = mongoose.model('Vehicle',vehicleSchema);

export default Vehicle;