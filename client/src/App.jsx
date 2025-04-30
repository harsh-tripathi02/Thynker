"use client"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider, useAuth } from "./context/AuthContext"
import "./App.css"

// Pages
import Login from "./pages/Login"
import Register from "./pages/Register"
import TeacherDashboard from "./pages/teacher/Dashboard"
import CreateQuiz from "./pages/teacher/CreateQuiz"
import AddQuestions from "./pages/teacher/AddQuestions"
import StudentDashboard from "./pages/student/Dashboard"
import AttemptQuiz from "./pages/student/AttemptQuiz"
import QuizResults from "./pages/student/QuizResults"
import NotFound from "./pages/NotFound"

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} />
  }

  return children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Teacher routes */}
            <Route
              path="/teacher/dashboard"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/create-quiz"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/quiz/:quizId/questions"
              element={
                <ProtectedRoute allowedRoles={["teacher"]}>
                  <AddQuestions />
                </ProtectedRoute>
              }
            />

            {/* Student routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/:quizId"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <AttemptQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/quiz/:quizId/results/:attemptId"
              element={
                <ProtectedRoute allowedRoles={["student"]}>
                  <QuizResults />
                </ProtectedRoute>
              }
            />

            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
