import mongoose from 'mongoose';

const NewsSchema = new mongoose.Schema({
    text: { type: String, required: true },
    link: { type: String, required: true }
});

export default mongoose.model('News', NewsSchema);
