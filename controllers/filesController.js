const User_files = require('../models/User_files');
const User = require('../models/User');

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';

const uploadFiles = async (req, res) => {
  try {
    const uploadedFiles = req.files?.['files'] || [];
    const cover = req.files?.['cover_photo']?.[0] || null;
    const { subject, description } = req.body;

    if (!uploadedFiles || uploadedFiles.length === 0)
      return res.status(400).json({ error: "No files uploaded" });

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found." });

    let fileUrls;
    if (STORAGE_MODE === 'local') {
      fileUrls = uploadedFiles.map(f => f.path?.replace(/\\/g, "/"));
    } else {
      fileUrls = uploadedFiles.map(f => f.path);
    }

    const coverUrl = cover
      ? STORAGE_MODE === 'local'
        ? cover.path.replace(/\\/g, "/")
        : cover.path
      : null;

    const newNote = new User_files({
      username: user.username,
      subject,
      description,
      filePaths: fileUrls,
      coverPhoto: coverUrl,
      userId: req.user.id
    });

    await newNote.save();
    res.status(201).json({ message: "Notes saved to db and files saved to disk.", note: newNote });
  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

const fetchFiles = async (req, res) => {
  try {
    const files = await User_files.find().populate('userId', 'username').sort({ uploadedAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await User_files.findById(id).populate('userId', 'username');
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Invalid id format or server error" });
  }
};

const upvotePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const post = await User_files.findById(postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const existingVote = post.voters?.find(v => v.user.equals(userId));

  if (existingVote?.type === "upvote") {
    post.voters = post.voters.filter(v => !v.user.equals(userId));
  } else if (existingVote?.type === "downvote") {
    existingVote.type = "upvote";
  } else {
    post.voters = post.voters || [];
    post.voters.push({ user: userId, type: "upvote" });
  }

  post.upVotes = post.voters.filter(v => v.type === "upvote").length;
  post.downVotes = post.voters.filter(v => v.type === "downvote").length;
  await post.save();

  const userVote = post.voters.find(v => v.user.equals(userId))?.type || null;
  res.json({ upVotes: post.upVotes, downVotes: post.downVotes, userVote });
};

const downvotePost = async (req, res) => {
  const postId = req.params.id;
  const userId = req.user.id;

  const post = await User_files.findById(postId);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const existingVote = post.voters?.find(v => v.user.equals(userId));

  if (existingVote?.type === "downvote") {
    post.voters = post.voters.filter(v => !v.user.equals(userId));
  } else if (existingVote?.type === "upvote") {
    existingVote.type = "downvote";
  } else {
    post.voters = post.voters || [];
    post.voters.push({ user: userId, type: "downvote" });
  }

  post.upVotes = post.voters.filter(v => v.type === "upvote").length;
  post.downVotes = post.voters.filter(v => v.type === "downvote").length;
  await post.save();

  const userVote = post.voters.find(v => v.user.equals(userId))?.type || null;
  res.json({ upVotes: post.upVotes, downVotes: post.downVotes, userVote });
};

const addComment = async (req, res) => {
  const { comment } = req.body;
  const userId = req.user.id;
  const user = await User.findById(userId).select("username");
  const postId = req.params.postId;
  const post = await User_files.findById(postId);

  if (!postId) return res.status(401).json({ error: "Error no postId found!" });
  if (!userId) return res.status(401).json({ error: "Error no user found!" });
  if (!user || !user.username) return res.status(400).json({ error: "User not found or missing username" });
  if (!post) return res.status(401).json({ error: "error: no post found!" });

  const newComment = { comment, user: userId, username: user.username };
  post.comments.push(newComment);
  await post.save();
  res.status(201).json(newComment);
};

const getComments = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await User_files.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.status(200).json(post.comments);
  } catch (error) {
    console.error('Error fetching comments', error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { uploadFiles, fetchFiles, getPost, upvotePost, downvotePost, addComment, getComments };