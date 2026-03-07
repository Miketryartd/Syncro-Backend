const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  togglePostBookmark, toggleQuizBookmark,
  getBookmarks, getBookmarkIds,
  getNotifications, markNotificationsRead,
  searchUsers
} = require('../controllers/userController');


router.post('/api/bookmark/:postId', authenticateToken, togglePostBookmark);
router.post('/api/bookmark/quiz/:quizId', authenticateToken, toggleQuizBookmark);
router.get('/api/bookmarks', authenticateToken, getBookmarks);
router.get('/api/bookmarks/ids', authenticateToken, getBookmarkIds);
router.get('/api/notifications', authenticateToken, getNotifications);
router.patch('/api/notifications/read', authenticateToken, markNotificationsRead);
router.get('/api/search', authenticateToken, searchUsers);

module.exports = router;