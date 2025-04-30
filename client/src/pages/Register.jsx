"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Auth.css"

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student", // Default role
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register, user } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard")
    }
  }, [user, navigate])

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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    setIsLoading(true)

    try {
      const { confirmPassword, ...registerData } = formData
      const response = await register(registerData)
      navigate(response.user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>QuizMaster</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label>I am a:</label>
            <div className="role-selector">
              <label className={`role-option ${formData.role === "student" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === "student"}
                  onChange={handleChange}
                />
                <span>Student</span>
              </label>
              <label className={`role-option ${formData.role === "teacher" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === "teacher"}
                  onChange={handleChange}
                />
                <span>Teacher</span>
              </label>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
