const Quiz = require('../models/User_Quizes');
const QuizAttempt = require('../models/User_Quiz_Attempts');
const User = require('../models/User');
const Notification = require('../models/Notification');

const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    if (!quizzes) return res.status(400).json({ error: "missing quizzes" });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: "Server error" });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: "Server error" });
  }
};

const createQuiz = async (req, res) => {
  try {
    const userId = req.user.id;
    const { questions, title } = req.body;
    const user = await User.findById(userId);

    if (!userId) return res.status(400).json({ error: "No user found" });
    if (!questions || questions.length === 0) return res.status(400).json({ error: "No questions provided" });

    const newQuiz = new Quiz({ title, creator: userId, username: user.username, questions });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error("Quiz creation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, score, title } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).select("username");
    const username = user.username;

    if (!userId) return res.status(404).json({ error: "No user id exists" });

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: "Quiz not found" });

    await Notification.create({
      userId: quiz.creator,
      senderId: userId,
      type: "quiz_answered",
      referenceId: quizId,
      message: `${username} answered your quiz "${quiz.title}"`,
    });

    const newAttempt = new QuizAttempt({ title, quizId, userId, answers, score, username, submittedAt: new Date() });
    await newAttempt.save();
    res.status(201).json({ message: "Quiz submitted", score: newAttempt.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error submitting quiz" });
  }
};

const getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });
    if (quiz.creator.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized" });

    const attempts = await QuizAttempt.find({ quizId }).populate('userId', 'username');
    res.status(200).json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching attempts" });
  }
};

module.exports = { getQuizzes, getQuizById, createQuiz, submitQuiz, getQuizAttempts };