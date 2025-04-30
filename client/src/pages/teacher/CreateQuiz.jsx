"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { quizAPI } from "../../api"
import Navbar from "../../components/Navbar"
import "../../styles/Forms.css"

const CreateQuiz = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    timeLimit: 30, // Default time limit in minutes
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await quizAPI.createQuiz(formData)
      navigate(`/teacher/quiz/${response.data._id}/questions`)
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create quiz")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page-container">
      <Navbar />

      <div className="form-container">
        <div className="form-header">
          <h1>Create New Quiz</h1>
          <p>Set up the basic information for your quiz</p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label htmlFor="title">Quiz Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Enter a title for your quiz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Provide a brief description of the quiz"
            ></textarea>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Subject</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="E.g., Mathematics, Science, History"
            />
          </div>

          <div className="form-group">
            <label htmlFor="timeLimit">Time Limit (minutes)</label>
            <input
              type="number"
              id="timeLimit"
              name="timeLimit"
              value={formData.timeLimit}
              onChange={handleChange}
              min="1"
              max="180"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={() => navigate("/teacher/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Creating..." : "Create Quiz"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateQuiz
