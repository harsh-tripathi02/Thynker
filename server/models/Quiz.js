const mongoose = require("mongoose")

const QuizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please provide a title"],
    trim: true,
    maxlength: [100, "Title cannot be more than 100 characters"],
  },
  description: {
    type: String,
    trim: true,
  },
  subject: {
    type: String,
    trim: true,
  },
  timeLimit: {
    type: Number,
    default: 30, // minutes
    min: [1, "Time limit must be at least 1 minute"],
    max: [180, "Time limit cannot exceed 180 minutes"],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Quiz", QuizSchema)
