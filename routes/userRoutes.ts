import express from 'express';
import authenticateToken from '../middleware/auth.js';
import {
    togglePostBookmark, toggleQuizBookmark,
    getBookmarks, getBookmarkIds,
    getNotifications, markNotificationsRead,
    searchUsers
} from '../controllers/userController.js';

const router = express.Router();

router.post('/api/bookmark/:postId', authenticateToken, togglePostBookmark);
router.post('/api/bookmark/quiz/:quizId', authenticateToken, toggleQuizBookmark);
router.get('/api/bookmarks', authenticateToken, getBookmarks);
router.get('/api/bookmarks/ids', authenticateToken, getBookmarkIds);
router.get('/api/notifications', authenticateToken, getNotifications);
router.patch('/api/notifications/read', authenticateToken, markNotificationsRead);
router.get('/api/search', authenticateToken, searchUsers);

export default router;