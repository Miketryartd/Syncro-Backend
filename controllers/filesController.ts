import { Request, Response } from 'express';
import User_files from '../models/User_files.js';
import User from '../models/User.js';

const STORAGE_MODE = process.env.STORAGE_MODE || 'local';

export const uploadFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const uploadedFiles = (req.files as any)?.['files'] || [];
    const cover = (req.files as any)?.['cover_photo']?.[0] || null;
    const { subject, description } = req.body;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const user = await User.findById(req.user?.id) as any;
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    let fileUrls;
    if (STORAGE_MODE === 'local') {
      fileUrls = uploadedFiles.map((f: any) => f.path?.replace(/\\/g, "/"));
    } else {
      fileUrls = uploadedFiles.map((f: any) => f.path);
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
      userId: req.user?.id
    });

    await newNote.save();
    res.status(201).json({ message: "Notes saved to db and files saved to disk.", note: newNote });
  } catch (err) {
    console.error("Internal Server Error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

export const fetchFiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const files = await User_files.find().populate('userId', 'username').sort({ uploadedAt: -1 });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch files" });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await User_files.findById(id).populate('userId', 'username');
    if (!post) {
      res.status(404).json({ error: 'Post not found' });
      return;
    }
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Invalid id format or server error" });
  }
};

export const upvotePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    const post = await User_files.findById(postId) as any;
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const existingVote = post.voters?.find((v: any) => v.user.equals(userId));

    if (existingVote?.type === "upvote") {
      post.voters = post.voters.filter((v: any) => !v.user.equals(userId));
    } else if (existingVote?.type === "downvote") {
      existingVote.type = "upvote";
    } else {
      post.voters = post.voters || [];
      post.voters.push({ user: userId, type: "upvote" });
    }

    post.upVotes = post.voters.filter((v: any) => v.type === "upvote").length;
    post.downVotes = post.voters.filter((v: any) => v.type === "downvote").length;
    await post.save();

    const userVote = post.voters.find((v: any) => v.user.equals(userId))?.type || null;
    res.json({ upVotes: post.upVotes, downVotes: post.downVotes, userVote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const downvotePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    const post = await User_files.findById(postId) as any;
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }

    const existingVote = post.voters?.find((v: any) => v.user.equals(userId));

    if (existingVote?.type === "downvote") {
      post.voters = post.voters.filter((v: any) => !v.user.equals(userId));
    } else if (existingVote?.type === "upvote") {
      existingVote.type = "downvote";
    } else {
      post.voters = post.voters || [];
      post.voters.push({ user: userId, type: "downvote" });
    }

    post.upVotes = post.voters.filter((v: any) => v.type === "upvote").length;
    post.downVotes = post.voters.filter((v: any) => v.type === "downvote").length;
    await post.save();

    const userVote = post.voters.find((v: any) => v.user.equals(userId))?.type || null;
    res.json({ upVotes: post.upVotes, downVotes: post.downVotes, userVote });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const addComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { comment } = req.body;
    const userId = req.user?.id;
    const postId = req.params.postId;

    if (!postId) {
      res.status(401).json({ error: "Error no postId found!" });
      return;
    }
    if (!userId) {
      res.status(401).json({ error: "Error no user found!" });
      return;
    }

    const user = await User.findById(userId).select("username") as any;
    if (!user || !user.username) {
      res.status(400).json({ error: "User not found or missing username" });
      return;
    }

    const post = await User_files.findById(postId) as any;
    if (!post) {
      res.status(404).json({ error: "Post not found!" });
      return;
    }

    const newComment = { comment, user: userId, username: user.username };
    post.comments.push(newComment);
    await post.save();
    res.status(201).json(newComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getComments = async (req: Request, res: Response): Promise<void> => {
  try {
    const postId = req.params.postId;
    const post = await User_files.findById(postId) as any;
    if (!post) {
      res.status(404).json({ error: "Post not found" });
      return;
    }
    res.status(200).json(post.comments);
  } catch (error) {
    console.error('Error fetching comments', error);
    res.status(500).json({ error: "Server error" });
  }
};