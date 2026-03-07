const User = require('../models/User');
const Notification = require('../models/Notification');



const togglePostBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { postId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const exists = user.bookmarks.find(b => b.postId?.toString() === postId);
    if (exists) {
      user.bookmarks = user.bookmarks.filter(b => b.postId?.toString() !== postId);
      await user.save();
      return res.json({ bookmarked: false });
    }

    user.bookmarks.push({ postId, createdAt: new Date() });
    await user.save();
    return res.json({ bookmarked: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to bookmark post" });
  }
};

const toggleQuizBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quizId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const exists = user.bookmarks.find(b => b.quizId?.toString() === quizId);
    if (exists) {
      user.bookmarks = user.bookmarks.filter(b => b.quizId?.toString() !== quizId);
      await user.save();
      return res.json({ bookmarked: false });
    }

    user.bookmarks.push({ quizId, createdAt: new Date() });
    await user.save();
    return res.json({ bookmarked: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to bookmark quiz" });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks.postId");
    if (!user || !user.bookmarks) return res.json({ bookmarks: [] });
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getBookmarkIds = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || !user.bookmarks) return res.json({ bookmarks: [] });
    const ids = user.bookmarks.map(b => b.postId.toString());
    res.json({ bookmarks: ids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};



const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};

const markNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update notifications" });
  }
};



const searchUsers = async (req, res) => {
  try {
    const { search } = req.query;
    if (!search) return res.status(400).json({ error: 'No search query provided' });

    const users = await User.find({ username: { $regex: search, $options: 'i' } }).sort({ _id: -1 });
    res.status(200).json(users);
  } catch (error) {
    console.error('Error posting search:', error);
    if (!res.headersSent) res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { togglePostBookmark, toggleQuizBookmark, getBookmarks, getBookmarkIds, getNotifications, markNotificationsRead, searchUsers };