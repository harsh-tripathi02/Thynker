"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../context/AuthContext"
import { quizAPI } from "../../api"
import Navbar from "../../components/Navbar"
import "../../styles/Dashboard.css"

const TeacherDashboard = () => {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await quizAPI.getTeacherQuizzes()
        setQuizzes(response.data)
      } catch (err) {
        setError("Failed to fetch quizzes")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchQuizzes()
  }, [])

  const handleDeleteQuiz = async (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      try {
        await quizAPI.deleteQuiz(quizId)
        setQuizzes(quizzes.filter((quiz) => quiz._id !== quizId))
      } catch (err) {
        setError("Failed to delete quiz")
        console.error(err)
      }
    }
  }

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
          <h1>Teacher Dashboard</h1>
          <Link to="/teacher/create-quiz" className="create-button">
            Create New Quiz
          </Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="quizzes-container">
          <h2>Your Quizzes</h2>

          {quizzes.length === 0 ? (
            <div className="empty-state">
              <p>You haven't created any quizzes yet.</p>
              <Link to="/teacher/create-quiz" className="create-button">
                Create Your First Quiz
              </Link>
            </div>
          ) : (
            <div className="quiz-grid">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="quiz-card">
                  <div className="quiz-card-header">
                    <h3>{quiz.title}</h3>
                    <span className="question-count">{quiz.questionCount || 0} Questions</span>
                  </div>

                  <p className="quiz-description">{quiz.description}</p>

                  <div className="quiz-meta">
                    <span>Created: {new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="quiz-actions">
                    <Link to={`/teacher/quiz/${quiz._id}/questions`} className="action-button edit">
                      Edit Questions
                    </Link>
                    <button onClick={() => handleDeleteQuiz(quiz._id)} className="action-button delete">
                      Delete
                    </button>
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

export default TeacherDashboard
