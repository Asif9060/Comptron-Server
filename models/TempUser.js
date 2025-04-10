import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 } // Expires in 10 minutes
});

export default mongoose.model('TempUser', tempUserSchema);