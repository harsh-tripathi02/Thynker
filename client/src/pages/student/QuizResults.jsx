"use client"

import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import { quizAPI, attemptAPI } from "../../api"
import Navbar from "../../components/Navbar"
import "../../styles/QuizResults.css"

const QuizResults = () => {
  const { quizId, attemptId } = useParams()

  const [attempt, setAttempt] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Fetch attempt details
        const attemptResponse = await attemptAPI.getAttempt(attemptId)
        setAttempt(attemptResponse.data)

        // Fetch quiz details
        const quizResponse = await quizAPI.getQuiz(quizId)
        setQuiz(quizResponse.data)

        // Fetch questions with answers
        const questionsResponse = await attemptAPI.getAttemptQuestions(attemptId)
        setQuestions(questionsResponse.data)
      } catch (err) {
        setError("Failed to load quiz results")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [quizId, attemptId])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!attempt || !quiz) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || "Could not find the quiz results"}</p>
        <Link to="/student/dashboard" className="back-button">
          Back to Dashboard
        </Link>
      </div>
    )
  }

  const scorePercentage = Math.round((attempt.score / attempt.totalMarks) * 100)
  const isPassing = scorePercentage >= 60

  return (
    <div className="results-page-container">
      <Navbar />

      <div className="results-container">
        <div className="results-header">
          <h1>Quiz Results</h1>
          <h2>{quiz.title}</h2>
        </div>

        <div className="results-summary">
          <div className="score-card">
            <div
              className={`score-circle ${
                scorePercentage >= 80 ? "excellent" : scorePercentage >= 60 ? "good" : "needs-improvement"
              }`}
            >
              <div className="score-percentage">{scorePercentage}%</div>
              <div className="score-text">
                {attempt.score} / {attempt.totalMarks}
              </div>
            </div>

            <div className="score-details">
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value ${isPassing ? "passing" : "failing"}`}>
                  {isPassing ? "Passed" : "Failed"}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Time Taken:</span>
                <span className="detail-value">
                  {Math.floor(attempt.timeTaken / 60)} min {attempt.timeTaken % 60} sec
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Completed:</span>
                <span className="detail-value">{new Date(attempt.completedAt).toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Correct Answers:</span>
                <span className="detail-value">
                  {attempt.correctAnswers} of {questions.length}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="questions-review">
          <h3>Question Review</h3>

          {questions.map((question, index) => {
            const userAnswer = attempt.answers.find((a) => a.questionId === question._id)
            const isCorrect = userAnswer?.isCorrect
            const userSelectedOption = userAnswer?.selectedOption

            return (
              <div key={question._id} className={`review-question ${isCorrect ? "correct" : "incorrect"}`}>
                <div className="review-question-header">
                  <h4>Question {index + 1}</h4>
                  <span className="question-marks">[{question.marks} marks]</span>
                  <span className={`question-result ${isCorrect ? "correct" : "incorrect"}`}>
                    {isCorrect ? "Correct" : "Incorrect"}
                  </span>
                </div>

                <p className="review-question-text">{question.text}</p>

                <div className="review-options">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`review-option ${optIndex === question.correctOption ? "correct-option" : ""} ${
                        optIndex === userSelectedOption ? "user-selected" : ""
                      }`}
                    >
                      <span className="option-marker">{String.fromCharCode(65 + optIndex)}</span>
                      <span className="option-text">{option}</span>

                      {optIndex === question.correctOption && (
                        <span className="option-badge correct">Correct Answer</span>
                      )}

                      {optIndex === userSelectedOption && optIndex !== question.correctOption && (
                        <span className="option-badge incorrect">Your Answer</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="results-actions">
          <Link to="/student/dashboard" className="action-button secondary">
            Back to Dashboard
          </Link>
          <Link to={`/student/quiz/${quizId}`} className="action-button primary">
            Retake Quiz
          </Link>
        </div>
      </div>
    </div>
  )
}

export default QuizResults
