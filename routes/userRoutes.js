const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  togglePostBookmark,
  toggleQuizBookmark,
  getBookmarks,
  getBookmarkIds,
  getNotifications,
  markNotificationsRead,
  searchUsers
} = require('../controllers/userController');


router.post('/bookmark/:postId', authenticateToken, togglePostBookmark);
router.post('/bookmark/quiz/:quizId', authenticateToken, toggleQuizBookmark);
router.get('/bookmarks', authenticateToken, getBookmarks);
router.get('/bookmarks/ids', authenticateToken, getBookmarkIds);


router.get('/notifications', authenticateToken, getNotifications);
router.patch('/notifications/read', authenticateToken, markNotificationsRead);


router.get('/search', authenticateToken, searchUsers);

module.exports = router;