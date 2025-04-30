const Attempt = require("../models/Attempt")
const Quiz = require("../models/Quiz")
const Question = require("../models/Question")


exports.createAttempt = async (req, res, next) => {
  try {
    const { quizId, answers, timeTaken } = req.body

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Get all questions for this quiz
    const questions = await Question.find({ quizId })

    if (questions.length === 0) {
      return res.status(400).json({ message: "This quiz has no questions" })
    }

    // Calculate score
    let score = 0
    let correctAnswers = 0
    const totalMarks = questions.reduce((total, q) => total + q.marks, 0)

    // Process answers
    const processedAnswers = answers.map((answer) => {
      const question = questions.find((q) => q._id.toString() === answer.questionId)

      if (!question) {
        return {
          ...answer,
          isCorrect: false,
        }
      }

      const isCorrect = answer.selectedOption === question.correctOption

      if (isCorrect) {
        score += question.marks
        correctAnswers++
      }

      return {
        ...answer,
        isCorrect,
      }
    })

    // Create attempt
    const attempt = await Attempt.create({
      student: req.user.id,
      quiz: quizId,
      answers: processedAnswers,
      score,
      totalMarks,
      correctAnswers,
      timeTaken,
      completedAt: Date.now(),
    })

    res.status(201).json(attempt)
  } catch (err) {
    next(err)
  }
}


exports.getAttempt = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id).populate("quiz", "title description subject timeLimit")

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" })
    }

    // Check if user is the student who made the attempt or the teacher who created the quiz
    if (attempt.student.toString() !== req.user.id && req.user.role !== "teacher") {
      return res.status(403).json({ message: "Not authorized to view this attempt" })
    }

    res.status(200).json(attempt)
  } catch (err) {
    next(err)
  }
}


exports.getStudentAttempts = async (req, res, next) => {
  try {
    const attempts = await Attempt.find({ student: req.user.id })
      .populate("quiz", "title description subject timeLimit")
      .sort({ completedAt: -1 })

    res.status(200).json(attempts)
  } catch (err) {
    next(err)
  }
}


exports.getAttemptQuestions = async (req, res, next) => {
  try {
    const attempt = await Attempt.findById(req.params.id)

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" })
    }

    // Check if user is the student who made the attempt or the teacher who created the quiz
    if (attempt.student.toString() !== req.user.id && req.user.role !== "teacher") {
      return res.status(403).json({ message: "Not authorized to view this attempt" })
    }

    // Get all questions for this quiz
    const questions = await Question.find({ quizId: attempt.quiz })

    res.status(200).json(questions)
  } catch (err) {
    next(err)
  }
}
