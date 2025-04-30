const Question = require("../models/Question")
const Quiz = require("../models/Quiz")


exports.createQuestion = async (req, res, next) => {
  try {
    const { quizId } = req.body

    // Check if quiz exists
    const quiz = await Quiz.findById(quizId)
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" })
    }

    // Check if user is quiz owner
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to add questions to this quiz" })
    }

    const question = await Question.create(req.body)

    res.status(201).json(question)
  } catch (err) {
    next(err)
  }
}

exports.getQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    res.status(200).json(question)
  } catch (err) {
    next(err)
  }
}


exports.updateQuestion = async (req, res, next) => {
  try {
    let question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Check if user is quiz owner
    const quiz = await Quiz.findById(question.quizId)
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this question" })
    }

    question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    res.status(200).json(question)
  } catch (err) {
    next(err)
  }
}


exports.deleteQuestion = async (req, res, next) => {
  try {
    const question = await Question.findById(req.params.id)

    if (!question) {
      return res.status(404).json({ message: "Question not found" })
    }

    // Check if user is quiz owner
    const quiz = await Quiz.findById(question.quizId)
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this question" })
    }

    await question.deleteOne()

    res.status(200).json({ success: true })
  } catch (err) {
    next(err)
  }
}
