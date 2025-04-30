"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import Navbar from "../../components/Navbar"
import "../../styles/Forms.css"
import "../../styles/Questions.css"
import { quizAPI, questionAPI } from "../../api"

const AddQuestions = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [currentQuestion, setCurrentQuestion] = useState({
    text: "",
    options: ["", "", "", ""],
    correctOption: 0,
    marks: 1,
    timeLimit: 30, // seconds
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editIndex, setEditIndex] = useState(null)

  useEffect(() => {
    const fetchQuizAndQuestions = async () => {
      try {
        const quizResponse = await quizAPI.getQuiz(quizId)
        setQuiz(quizResponse.data)

        const questionsResponse = await quizAPI.getQuizQuestions(quizId)
        setQuestions(questionsResponse.data)
      } catch (err) {
        setError("Failed to fetch quiz data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizAndQuestions()
  }, [quizId])

  const handleQuestionChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      text: e.target.value,
    })
  }

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...currentQuestion.options]
    updatedOptions[index] = value

    setCurrentQuestion({
      ...currentQuestion,
      options: updatedOptions,
    })
  }

  const handleCorrectOptionChange = (index) => {
    setCurrentQuestion({
      ...currentQuestion,
      correctOption: index,
    })
  }

  const handleMarksChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      marks: Number.parseInt(e.target.value) || 1,
    })
  }

  const handleTimeLimitChange = (e) => {
    setCurrentQuestion({
      ...currentQuestion,
      timeLimit: Number.parseInt(e.target.value) || 30,
    })
  }

  const resetForm = () => {
    setCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctOption: 0,
      marks: 1,
      timeLimit: 30,
    })
    setIsEditing(false)
    setEditIndex(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate form
    if (!currentQuestion.text.trim()) {
      setError("Question text is required")
      return
    }

    if (currentQuestion.options.some((option) => !option.trim())) {
      setError("All options must be filled")
      return
    }

    try {
      if (isEditing && editIndex !== null) {
        // Update existing question
        const questionId = questions[editIndex]._id
        await questionAPI.updateQuestion(questionId, {
          ...currentQuestion,
          quizId,
        })

        const updatedQuestions = [...questions]
        updatedQuestions[editIndex] = {
          ...questions[editIndex],
          ...currentQuestion,
        }

        setQuestions(updatedQuestions)
      } else {
        // Add new question
        const response = await questionAPI.createQuestion({
          ...currentQuestion,
          quizId,
        })

        setQuestions([...questions, response.data])
      }

      resetForm()
      setError("")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save question")
    }
  }

  const handleEditQuestion = (index) => {
    const questionToEdit = questions[index]
    setCurrentQuestion({
      text: questionToEdit.text,
      options: questionToEdit.options,
      correctOption: questionToEdit.correctOption,
      marks: questionToEdit.marks,
      timeLimit: questionToEdit.timeLimit,
    })
    setIsEditing(true)
    setEditIndex(index)
  }

  const handleDeleteQuestion = async (index) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        const questionId = questions[index]._id
        await questionAPI.deleteQuestion(questionId)

        const updatedQuestions = [...questions]
        updatedQuestions.splice(index, 1)
        setQuestions(updatedQuestions)
      } catch (err) {
        setError("Failed to delete question")
      }
    }
  }

  const handleFinish = () => {
    navigate("/teacher/dashboard")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="form-page-container">
      <Navbar />

      <div className="form-container questions-container">
        <div className="form-header">
          <h1>{quiz?.title}: Add Questions</h1>
          <p>Create questions for your quiz</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="questions-section">
          <h2>Current Questions ({questions.length})</h2>

          {questions.length === 0 ? (
            <div className="empty-questions">
              <p>No questions added yet. Use the form below to add questions.</p>
            </div>
          ) : (
            <div className="questions-list">
              {questions.map((question, index) => (
                <div key={index} className="question-item">
                  <div className="question-header">
                    <h3>Question {index + 1}</h3>
                    <div className="question-actions">
                      <button onClick={() => handleEditQuestion(index)} className="edit-button">
                        Edit
                      </button>
                      <button onClick={() => handleDeleteQuestion(index)} className="delete-button">
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="question-text">{question.text}</p>

                  <div className="options-list">
                    {question.options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`option-item ${optIndex === question.correctOption ? "correct" : ""}`}
                      >
                        <span className="option-marker">{String.fromCharCode(65 + optIndex)}</span>
                        <span className="option-text">{option}</span>
                        {optIndex === question.correctOption && <span className="correct-badge">Correct</span>}
                      </div>
                    ))}
                  </div>

                  <div className="question-meta">
                    <span>Marks: {question.marks}</span>
                    <span>Time Limit: {question.timeLimit} seconds</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="add-question-form">
          <h2>{isEditing ? "Edit Question" : "Add New Question"}</h2>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="questionText">Question Text</label>
              <textarea
                id="questionText"
                value={currentQuestion.text}
                onChange={handleQuestionChange}
                rows="3"
                placeholder="Enter your question here"
                required
              ></textarea>
            </div>

            <div className="options-form-group">
              <label>Options</label>
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="option-input-group">
                  <div className="option-label">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={currentQuestion.correctOption === index}
                      onChange={() => handleCorrectOptionChange(index)}
                    />
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  </div>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    required
                  />
                </div>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label htmlFor="marks">Marks</label>
                <input
                  type="number"
                  id="marks"
                  value={currentQuestion.marks}
                  onChange={handleMarksChange}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group half">
                <label htmlFor="timeLimit">Time Limit (seconds)</label>
                <input
                  type="number"
                  id="timeLimit"
                  value={currentQuestion.timeLimit}
                  onChange={handleTimeLimitChange}
                  min="10"
                  max="300"
                  required
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-button" onClick={resetForm}>
                {isEditing ? "Cancel Edit" : "Clear Form"}
              </button>
              <button type="submit" className="submit-button">
                {isEditing ? "Update Question" : "Add Question"}
              </button>
            </div>
          </form>
        </div>

        <div className="finish-section">
          <button onClick={handleFinish} className="finish-button" disabled={questions.length === 0}>
            {questions.length === 0 ? "Add at least one question" : "Finish & Return to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddQuestions
