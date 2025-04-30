const Quiz = require("../models/Quiz")
const Question = require("../models/Question")


exports.createQuiz = async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.createdBy = req.user.id

    const quiz = await Quiz.create(req.body)

    res.status(201).json(quiz)
  } catch (err) {
    next(err)
  }
}


exports.getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find()

    res.status(200).json(quizzes)
  } catch (err) {
    next(err)
  }
}


exports.getTeacherQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({ createdBy: req.user.id })

    // Get question count for each quiz
    const quizzesWithCount = await Promise.all(
      quizzes.map(async (quiz) => {
        const count = await Question.countDocuments({ quizId: quiz._id })
        return {
          ...quiz.toObject(),
          questionCount: count,
        }
      }),
    )

    res.status(200).json(quizzesWithCount)
  } catch (err) {
    next(err)
  }
}


exports.getAvailableQuizzes = async (req, res, next) => {
  try {
    // Get all quizzes that have at least one question
    const quizzes = await Quiz.find().populate("createdBy", "name")

    // Filter quizzes that have questions
    const availableQuizzes = await Promise.all(
      quizzes.map(async (quiz) => {
        const count = await Question.countDocuments({ quizId: quiz._id })
        if (count > 0) {
          return {
            ...quiz.toObject(),
            questionCount: count,
          }
        }
        return null
      }),
    )

    // Remove null values (quizzes with no questions)
    const filteredQuizzes = availableQuizzes.filter((quiz) => quiz !== null)

    res.status(200).json(filteredQuizzes)
  } catch (err) {
    next(err)
  }
}


exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    res.status(200).json(quiz)
  } catch (err) {
    next(err)
  }
}


exports.updateQuiz = async (req, res, next) => {
  try {
    let quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check if user is quiz owner
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this quiz" })
    }

    quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json(quiz)
  } catch (err) {
    next(err)
  }
}


exports.deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.id)

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check if user is quiz owner
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this quiz" })
    }

    // Delete all questions associated with this quiz
    await Question.deleteMany({ quizId: req.params.id })

    // Delete the quiz
    await quiz.deleteOne()

    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}


exports.getQuizQuestions = async (req, res, next) => {
  try {
    const questions = await Question.find({ quizId: req.params.id })

    res.status(200).json(questions)
  } catch (err) {
    next(err)
  }
}


// @route   GET /api/quizzes/:id/with-questions
// @desc    Get quiz and its questions together
// @access  Private (student or teacher)
exports.getQuizWithQuestions = async (req, res, next) => {
  try {
    // Fetch quiz and questions in parallel, only select needed fields, use lean for speed
    const [quiz, questions] = await Promise.all([
      Quiz.findById(req.params.id).select("title description subject timeLimit createdBy").lean(),
      Question.find({ quizId: req.params.id }).select("text options correctOption marks timeLimit").lean()
    ])
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }
    res.status(200).json({ quiz, questions })
  } catch (err) {
    next(err)
  }
}
