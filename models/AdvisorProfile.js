import mongoose from 'mongoose';

const advisorProfileSchema = new mongoose.Schema({    customId: {
        type: String,
        required: true,
        unique: true,
        match: /^(CAP|CAH)-\d{4}$/  // Allows both CAP-XXXX and CAH-XXXX formats
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    skill: {
        type: String,
        required: true
    },
    image: {
        type: String,  // Cloudinary URL
        required: true
    },
    github: {
        type: String,
        required: false
    },
    linkedin: {
        type: String,
        required: false
    },
    portfolio: {
        type: String,
        required: false
    },
    cv: {
        type: String,  // Cloudinary URL for CV
        required: false
    }
}, {
    timestamps: true
});

// Auto-generate customId before saving
advisorProfileSchema.pre('save', async function(next) {
    if (!this.customId) {
        const lastProfile = await this.constructor.findOne({}, {}, { sort: { 'customId': -1 } });
        const lastNumber = lastProfile ? parseInt(lastProfile.customId.split('-')[1]) : 0;
        this.customId = `CMAP-${String(lastNumber + 1).padStart(4, '0')}`;
    }
    next();
});

const AdvisorProfile = mongoose.model('AdvisorProfile', advisorProfileSchema);
export default AdvisorProfile;
