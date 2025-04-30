const mongoose = require("mongoose")

const AnswerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
    min: -1, // -1 for unanswered
    max: 3,
  },
  isCorrect: {
    type: Boolean,
    default: false,
  },
})

const AttemptSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  answers: [AnswerSchema],
  score: {
    type: Number,
    default: 0,
  },
  totalMarks: {
    type: Number,
    required: true,
  },
  correctAnswers: {
    type: Number,
    default: 0,
  },
  timeTaken: {
    type: Number, // in seconds
    required: true,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Attempt", AttemptSchema)
