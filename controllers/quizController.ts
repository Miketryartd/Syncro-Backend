import { Request, Response } from 'express';
import Quiz from '../models/User_Quizes.js';
import QuizAttempt from '../models/User_Quiz_Attempts.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const getQuizzes = async (req: Request, res: Response): Promise<void> => {
  try {
    const quizzes = await Quiz.find().sort({ createdAt: -1 });
    if (!quizzes) {
      res.status(400).json({ error: "missing quizzes" });
      return;
    }
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ error: "Server error" });
  }
};

const getQuizById = async (req: Request, res: Response): Promise<void> => {
  try {
    const quiz = await Quiz.findById(req.params.id) as any;
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: "Server error" });
  }
};

const createQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { questions, title } = req.body;

    if (!userId) {
      res.status(400).json({ error: "No user found" });
      return;
    }

    const user = await User.findById(userId) as any;
    if (!user) {
      res.status(400).json({ error: "User not found" });
      return;
    }

    if (!questions || questions.length === 0) {
      res.status(400).json({ error: "No questions provided" });
      return;
    }

    const newQuiz = new Quiz({
      title,
      creator: userId,
      username: user.username,
      questions
    });
    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error("Quiz creation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const submitQuiz = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const { answers, score, title } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      res.status(404).json({ error: "No user id exists" });
      return;
    }

    const user = await User.findById(userId).select("username") as any;
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const username = user.username;

    const quiz = await Quiz.findById(quizId) as any;
    if (!quiz) {
      res.status(404).json({ error: "Quiz not found" });
      return;
    }

    await Notification.create({
      userId: quiz.creator,
      senderId: userId,
      type: "quiz_answered",
      referenceId: quizId,
      message: `${username} answered your quiz "${quiz.title}"`,
    });

    const newAttempt = new QuizAttempt({
      title,
      quizId,
      userId,
      answers,
      score,
      username,
      submittedAt: new Date()
    });
    await newAttempt.save();
    res.status(201).json({ message: "Quiz submitted", score: newAttempt.score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error submitting quiz" });
  }
};

const getQuizAttempts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id;

    const quiz = await Quiz.findById(quizId) as any;
    if (!quiz) {
      res.status(404).json({ message: "Quiz not found" });
      return;
    }

    if (quiz.creator.toString() !== userId) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    const attempts = await QuizAttempt.find({ quizId }).populate('userId', 'username');
    res.status(200).json(attempts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching attempts" });
  }
};

export {
  getQuizzes,
  getQuizById,
  createQuiz,
  submitQuiz,
  getQuizAttempts
};