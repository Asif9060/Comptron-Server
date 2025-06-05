import express from 'express';
import {
    getAllNewsArticles,
    getNewsArticleById,
    createNewsArticle,
    updateNewsArticle,
    deleteNewsArticle
} from '../controllers/newsArticleController.js';

const router = express.Router();

// Get all news articles and create a new one
router.route('/')
    .get(getAllNewsArticles)
    .post(createNewsArticle);

// Get, update, and delete a specific news article
router.route('/:id')
    .get(getNewsArticleById)
    .put(updateNewsArticle)
    .delete(deleteNewsArticle);

export default router;