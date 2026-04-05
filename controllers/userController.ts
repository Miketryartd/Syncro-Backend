import { Request, Response } from 'express';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const togglePostBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const user = await User.findById(userId) as any;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const exists = user.bookmarks.find((b: any) => b.postId?.toString() === postId);
    if (exists) {
      user.bookmarks = user.bookmarks.filter((b: any) => b.postId?.toString() !== postId);
      await user.save();
      res.json({ bookmarked: false });
      return;
    }

    user.bookmarks.push({ postId, createdAt: new Date() });
    await user.save();
    res.json({ bookmarked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bookmark post" });
  }
};

const toggleQuizBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { quizId } = req.params;

    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
      return;
    }

    const user = await User.findById(userId) as any;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const exists = user.bookmarks.find((b: any) => b.quizId?.toString() === quizId);
    if (exists) {
      user.bookmarks = user.bookmarks.filter((b: any) => b.quizId?.toString() !== quizId);
      await user.save();
      res.json({ bookmarked: false });
      return;
    }

    user.bookmarks.push({ quizId, createdAt: new Date() });
    await user.save();
    res.json({ bookmarked: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bookmark quiz" });
  }
};

const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id).populate("bookmarks.postId") as any;
    if (!user || !user.bookmarks) {
      res.json({ bookmarks: [] });
      return;
    }
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getBookmarkIds = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id) as any;
    if (!user || !user.bookmarks) {
      res.json({ bookmarks: [] });
      return;
    }
    const ids = user.bookmarks.map((b: any) => b.postId?.toString());
    res.json({ bookmarks: ids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({ userId: req.user?.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markNotificationsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      { userId: req.user?.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
};

const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;
    if (!search) {
      res.status(400).json({ error: 'No search query provided' });
      return;
    }
    const users = await User.find({ username: { $regex: search as string, $options: 'i' } }).sort({ _id: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error posting search:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export {
  togglePostBookmark,
  toggleQuizBookmark,
  getBookmarks,
  getBookmarkIds,
  getNotifications,
  markNotificationsRead,
  searchUsers
};