const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const {
  uploadFiles, fetchFiles, getPost,
  upvotePost, downvotePost, addComment, getComments
} = require('../controllers/filesController');

module.exports = (upload) => {

  router.post('/files', authenticateToken, upload.fields([{ name: "files", maxCount: 12 }, { name: 'cover_photo', maxCount: 1 }]), uploadFiles);
  router.get('/files-fetch', fetchFiles);
  router.get('/post/:id', getPost);
  router.post('/post/:id/upvote', authenticateToken, upvotePost);
  router.post('/post/:id/downvote', authenticateToken, downvotePost);
  router.post('/post/:postId/comments', authenticateToken, addComment);
  router.get('/post/:postId/comments', authenticateToken, getComments);

  return router;
};