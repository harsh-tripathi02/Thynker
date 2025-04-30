const express = require("express")
const router = express.Router()
const { createQuiz, getQuizzes, getQuiz, updateQuiz, deleteQuiz, getTeacherQuizzes, getAvailableQuizzes, getQuizQuestions, getQuizWithQuestions } = require("../controllers/quizzes")
const { protect, authorize } = require("../middleware/auth")

router.route("/").post(protect, authorize("teacher"), createQuiz).get(protect, getQuizzes)

router.route("/teacher").get(protect, authorize("teacher"), getTeacherQuizzes)

router.route("/available").get(protect, authorize("student"), getAvailableQuizzes)

router
  .route("/:id")
  .get(protect, getQuiz)
  .put(protect, authorize("teacher"), updateQuiz)
  .delete(protect, authorize("teacher"), deleteQuiz)

router.route("/:id/questions").get(protect, getQuizQuestions)
router.route("/:id/with-questions").get(protect, getQuizWithQuestions)

module.exports = router
