const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const { uploadFiles, fetchFiles, getPost, upvotePost, downvotePost, addComment, getComments } = require('../controllers/filesController');


module.exports = (upload) => {
  router.post('/', authenticateToken, upload.fields([{ name: "files", maxCount: 12 }, { name: 'cover_photo', maxCount: 1 }]), uploadFiles);
  router.get('/', fetchFiles);
  router.get('/:id', getPost);
  router.post('/:id/upvote', authenticateToken, upvotePost);
  router.post('/:id/downvote', authenticateToken, downvotePost);
  router.post('/:postId/comments', authenticateToken, addComment);
  router.get('/:postId/comments', authenticateToken, getComments);

  return router;
};