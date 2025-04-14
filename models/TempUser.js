import mongoose from 'mongoose';

const tempUserSchema = new mongoose.Schema({
    name: { type: String, required: false },
    email: { type: String, required: false, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: false },
    otp: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 600 },
    
});

export default mongoose.model('TempUser', tempUserSchema);