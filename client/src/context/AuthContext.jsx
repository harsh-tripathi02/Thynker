"use client"

import { createContext, useState, useContext, useEffect } from "react"
import { authAPI } from "../api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check if user is already logged in
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("token")

        if (token) {
          const response = await authAPI.getCurrentUser()
          setUser(response.data)
        }
      } catch (err) {
        localStorage.removeItem("token")
      } finally {
        setLoading(false)
      }
    }

    checkLoggedIn()
  }, [])

  // Register user
  const register = async (userData) => {
    try {
      setError(null)
      const response = await authAPI.register(userData)
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      setError(null)
      const response = await authAPI.login(credentials)
      localStorage.setItem("token", response.data.token)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Logout user
  const logout = () => {
    localStorage.removeItem("token")
    setUser(null)
  }

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
