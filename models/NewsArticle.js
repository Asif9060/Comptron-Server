import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    summary: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    author: {
        type: String,
        default: ''
    },
    publishedAt: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const NewsArticle = mongoose.model('NewsArticle', newsArticleSchema);

export default NewsArticle;