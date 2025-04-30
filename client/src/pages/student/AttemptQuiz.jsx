"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import { quizAPI } from "../../api"
import "../../styles/AttemptQuiz.css"

const AttemptQuiz = () => {
  const { quizId } = useParams()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const timerRef = useRef(null)
  const questionTimerRef = useRef(null)

  // Fetch quiz and questions
  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const response = await quizAPI.getQuizWithQuestions(quizId)
        setQuiz(response.data.quiz)
        setQuestions(response.data.questions)
        // Initialize answers object
        const initialAnswers = {}
        response.data.questions.forEach((question) => {
          initialAnswers[question._id] = null
        })
        setAnswers(initialAnswers)
        setTimeLeft(response.data.quiz.timeLimit * 60)
      } catch (err) {
        setError("Failed to load quiz")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchQuizData()

    // Cleanup timers on unmount
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [quizId])

  // Start quiz timer
  useEffect(() => {
    if (quizStarted && timeLeft !== null && !quizCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current)
            handleSubmitQuiz()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [quizStarted, quizCompleted])

  // Start question timer
  useEffect(() => {
    if (quizStarted && !quizCompleted && questions.length > 0) {
      // Reset question timer when changing questions
      const currentQuestion = questions[currentQuestionIndex]
      setQuestionTimeLeft(currentQuestion.timeLimit)

      if (questionTimerRef.current) clearInterval(questionTimerRef.current)

      questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current)
            // Auto-move to next question if time expires
            if (currentQuestionIndex < questions.length - 1) {
              setCurrentQuestionIndex((prev) => prev + 1)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (questionTimerRef.current) clearInterval(questionTimerRef.current)
    }
  }, [currentQuestionIndex, quizStarted, quizCompleted, questions])

  const startQuiz = () => {
    setQuizStarted(true)
    // Set the first question's time limit
    if (questions.length > 0) {
      setQuestionTimeLeft(questions[0].timeLimit)
    }
  }

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    })
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    // Stop timers
    if (timerRef.current) clearInterval(timerRef.current)
    if (questionTimerRef.current) clearInterval(questionTimerRef.current)

    setQuizCompleted(true)

    try {
      const response = await axios.post("/api/attempts", {
        quizId,
        answers: Object.entries(answers).map(([questionId, answer]) => ({
          questionId,
          selectedOption: answer !== null ? answer : -1, // -1 for unanswered
        })),
        timeTaken: quiz.timeLimit * 60 - timeLeft, // Time taken in seconds
      })

      navigate(`/student/quiz/${quizId}/results/${response.data._id}`)
    } catch (err) {
      setError("Failed to submit quiz")
      console.error(err)
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  if (loading || !quiz || questions.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!quizStarted) {
    return (
      <div className="quiz-intro-container">
        <div className="quiz-intro-card">
          <h1>{quiz.title}</h1>
          <p className="quiz-description">{quiz.description}</p>

          <div className="quiz-details">
            <div className="detail-item">
              <span className="detail-label">Subject:</span>
              <span className="detail-value">{quiz.subject}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Questions:</span>
              <span className="detail-value">{questions.length}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Time Limit:</span>
              <span className="detail-value">{quiz.timeLimit} minutes</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Total Marks:</span>
              <span className="detail-value">{questions.reduce((total, q) => total + q.marks, 0)}</span>
            </div>
          </div>

          <div className="quiz-instructions">
            <h3>Instructions:</h3>
            <ul>
              <li>Each question has a specific time limit.</li>
              <li>You can navigate between questions using the Next and Previous buttons.</li>
              <li>The quiz will automatically submit when the time is up.</li>
              <li>You can review your answers before final submission.</li>
            </ul>
          </div>

          <button className="start-quiz-button" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const answeredCount = Object.values(answers).filter((a) => a !== null).length

  return (
    <div className="attempt-quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="timer-container">
          <div className="quiz-timer">
            <span className="timer-label">Quiz Time:</span>
            <span className={`timer-value ${timeLeft < 60 ? "warning" : ""}`}>{formatTime(timeLeft)}</span>
          </div>
          <div className="question-timer">
            <span className="timer-label">Question Time:</span>
            <span className={`timer-value ${questionTimeLeft < 10 ? "warning" : ""}`}>{questionTimeLeft}s</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="question-progress">
        <div className="progress-text">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="question-container">
        <div className="question-header">
          <h2>
            <span className="question-number">Q{currentQuestionIndex + 1}.</span>
            <span className="question-marks">[{currentQuestion.marks} marks]</span>
          </h2>
        </div>

        <p className="question-text">{currentQuestion.text}</p>

        <div className="options-container">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`option-item ${answers[currentQuestion._id] === index ? "selected" : ""}`}
              onClick={() => handleAnswerSelect(currentQuestion._id, index)}
            >
              <span className="option-marker">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="navigation-container">
        <button className="nav-button prev" onClick={handlePrevQuestion} disabled={currentQuestionIndex === 0}>
          Previous
        </button>

        {isLastQuestion ? (
          <button className="nav-button submit" onClick={handleSubmitQuiz}>
            Submit Quiz
          </button>
        ) : (
          <button className="nav-button next" onClick={handleNextQuestion}>
            Next
          </button>
        )}
      </div>

      <div className="quiz-summary">
        <div className="answered-count">
          Answered: {answeredCount} of {questions.length}
        </div>

        <div className="question-navigator">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`question-dot ${index === currentQuestionIndex ? "current" : ""} ${
                answers[questions[index]._id] !== null ? "answered" : ""
              }`}
              onClick={() => setCurrentQuestionIndex(index)}
            >
              {index + 1}
            </button>
          ))}
        </div>

        <button className="submit-quiz-button" onClick={handleSubmitQuiz}>
          Finish & Submit
        </button>
      </div>
    </div>
  )
}

export default AttemptQuiz
