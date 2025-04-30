const express = require("express")
const router = express.Router()
const { createQuestion, getQuestion, updateQuestion, deleteQuestion } = require("../controllers/questions")
const { protect, authorize } = require("../middleware/auth")

router.route("/").post(protect, authorize("teacher"), createQuestion)

router
  .route("/:id")
  .get(protect, getQuestion)
  .put(protect, authorize("teacher"), updateQuestion)
  .delete(protect, authorize("teacher"), deleteQuestion)

module.exports = router
