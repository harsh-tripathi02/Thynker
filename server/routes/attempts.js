const express = require("express")
const router = express.Router()
const { createAttempt, getAttempt, getStudentAttempts, getAttemptQuestions } = require("../controllers/attempts")
const { protect, authorize } = require("../middleware/auth")

router.route("/").post(protect, authorize("student"), createAttempt)

router.route("/student").get(protect, authorize("student"), getStudentAttempts)

router.route("/:id").get(protect, getAttempt)

router.route("/:id/questions").get(protect, getAttemptQuestions)

module.exports = router
