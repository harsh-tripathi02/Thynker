"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import "../styles/Navbar.css"

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Thynker</span>
        </Link>

        <div className="navbar-toggle" onClick={toggleMenu}>
          <span className="toggle-icon"></span>
          <span className="toggle-icon"></span>
          <span className="toggle-icon"></span>
        </div>

        <ul className={`navbar-menu ${menuOpen ? "active" : ""}`}>
          {user && (
            <>
              <li className="navbar-item">
                <Link
                  to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"}
                  className="navbar-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </li>

              {user.role === "teacher" && (
                <li className="navbar-item">
                  <Link to="/teacher/create-quiz" className="navbar-link" onClick={() => setMenuOpen(false)}>
                    Create Quiz
                  </Link>
                </li>
              )}

              <li className="navbar-item user-info">
                <div className="user-avatar">{user.name.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  <span className="user-name">{user.name}</span>
                  <span className="user-role">{user.role}</span>
                </div>
              </li>

              <li className="navbar-item">
                <button
                  onClick={() => {
                    handleLogout()
                    setMenuOpen(false)
                  }}
                  className="logout-button"
                >
                  Logout
                </button>
              </li>
            </>
          )}

          {!user && (
            <>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/register" className="navbar-link" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
