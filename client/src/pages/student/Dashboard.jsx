"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { quizAPI, attemptAPI } from "../../api"
import Navbar from "../../components/Navbar"
import "../../styles/Dashboard.css"

const StudentDashboard = () => {
  const [availableQuizzes, setAvailableQuizzes] = useState([])
  const [attemptedQuizzes, setAttemptedQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        // Fetch available quizzes
        const availableResponse = await quizAPI.getAvailableQuizzes()
        setAvailableQuizzes(availableResponse.data)

        // Fetch attempted quizzes
        const attemptedResponse = await attemptAPI.getStudentAttempts()
        setAttemptedQuizzes(attemptedResponse.data)
      } catch (err) {
        setError("Failed to fetch quizzes")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <Navbar />

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <div className="welcome-message">Welcome back, {user?.name}!</div>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="quizzes-container">
          <h2>Available Quizzes</h2>

          {availableQuizzes.length === 0 ? (
            <div className="empty-state">
              <p>No quizzes are available at the moment.</p>
            </div>
          ) : (
            <div className="quiz-grid">
              {availableQuizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-card-header">
                    <h3>{quiz.title}</h3>
                    <span className="question-count">{quiz.questionCount || 0} Questions</span>
                  </div>

                  <p className="quiz-description">{quiz.description}</p>

                  <div className="quiz-meta">
                    <span>Subject: {quiz.subject}</span>
                    <span>Time: {quiz.timeLimit} min</span>
                  </div>

                  <div className="quiz-actions">
                    <Link to={`/student/quiz/${quiz._id}`} className="action-button primary">
                      Start Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quizzes-container">
          <h2>Your Quiz History</h2>

          {attemptedQuizzes.length === 0 ? (
            <div className="empty-state">
              <p>You haven't attempted any quizzes yet.</p>
            </div>
          ) : (
            <div className="quiz-grid">
              {attemptedQuizzes.map((attempt) => (
                <div key={attempt._id} className="quiz-card history">
                  <div className="quiz-card-header">
                    <h3>{attempt.quiz.title}</h3>
                    <span
                      className={`score-badge ${
                        attempt.score / attempt.totalMarks >= 0.7
                          ? "high"
                          : attempt.score / attempt.totalMarks >= 0.4
                            ? "medium"
                            : "low"
                      }`}
                    >
                      Score: {attempt.score}/{attempt.totalMarks}
                    </span>
                  </div>

                  <div className="quiz-meta">
                    <span>Attempted: {new Date(attempt.completedAt).toLocaleDateString()}</span>
                    <span>Time Taken: {Math.round(attempt.timeTaken / 60)} min</span>
                  </div>

                  <div className="quiz-actions">
                    <Link
                      to={`/student/quiz/${attempt.quiz._id}/results/${attempt._id}`}
                      className="action-button secondary"
                    >
                      View Results
                    </Link>
                    <Link to={`/student/quiz/${attempt.quiz._id}`} className="action-button primary">
                      Retake Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
