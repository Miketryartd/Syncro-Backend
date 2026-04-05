import express, { Router } from 'express';
import multer from 'multer';
import authenticateToken from '../middleware/auth.js';
import {
    uploadFiles, fetchFiles, getPost,
    upvotePost, downvotePost, addComment, getComments
} from '../controllers/filesController.js';

const fileRoutes = (upload: multer.Multer): Router => {
    const router = express.Router();

    router.post('/files', authenticateToken, upload.fields([{ name: "files", maxCount: 12 }, { name: 'cover_photo', maxCount: 1 }]), uploadFiles);
    router.get('/files-fetch', fetchFiles);
    router.get('/post/:id', getPost);
    router.post('/post/:id/upvote', authenticateToken, upvotePost);
    router.post('/post/:id/downvote', authenticateToken, downvotePost);
    router.post('/post/:postId/comments', authenticateToken, addComment);
    router.get('/post/:postId/comments', authenticateToken, getComments);

    return router;
};

export default fileRoutes;