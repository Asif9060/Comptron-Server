import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    summary: {
        type: String,
        required: [true, 'Summary is required'],
        trim: true
    },
    body: {
        type: String,
        required: [true, 'Article body is required']
    },
    image: {
        url: {
            type: String,
            required: [true, 'Image URL is required']
        },
        alt: {
            type: String,
            default: ''
        }
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    status: {
        type: String,
        enum: ['draft', 'published'],
        default: 'published'
    },
    slug: {
        type: String,
        unique: true
    },
    viewCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create URL-friendly slug from title before saving
newsArticleSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

export default mongoose.model('NewsArticle', newsArticleSchema);