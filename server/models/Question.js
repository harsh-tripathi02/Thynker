const mongoose = require("mongoose")

const QuestionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Quiz",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Please provide question text"],
    trim: true,
  },
  options: {
    type: [String],
    required: [true, "Please provide options"],
    validate: {
      validator: (v) => {
        return v.length === 4 // Require exactly 4 options
      },
      message: "Question must have exactly 4 options",
    },
  },
  correctOption: {
    type: Number,
    required: [true, "Please specify the correct option"],
    min: 0,
    max: 3,
  },
  marks: {
    type: Number,
    required: [true, "Please specify marks for this question"],
    default: 1,
    min: [1, "Marks must be at least 1"],
    max: [10, "Marks cannot exceed 10"],
  },
  timeLimit: {
    type: Number,
    default: 30, // seconds
    min: [10, "Time limit must be at least 10 seconds"],
    max: [300, "Time limit cannot exceed 300 seconds"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

// Add index for quizId to speed up queries
QuestionSchema.index({ quizId: 1 })

module.exports = mongoose.model("Question", QuestionSchema)
