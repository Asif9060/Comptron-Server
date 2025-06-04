import express from 'express';
import { 
    createArticle,
    getArticles,
    getArticle,
    updateArticle,
    deleteArticle
} from '../controllers/newsController.js';
import { authenticateToken } from '../auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Public routes
router.get('/', getArticles);
router.get('/:id', getArticle);

// Protected routes - require authentication
router.post('/', 
    authenticateToken,
    upload.single('image'),
    createArticle
);

router.put('/:id',
    authenticateToken,
    upload.single('image'),
    updateArticle
);

router.delete('/:id',
    authenticateToken,
    deleteArticle
);

export default router;
