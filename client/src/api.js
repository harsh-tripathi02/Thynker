import axios from "axios"

// Create axios instance with default config
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add a request interceptor to add auth token to all requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Add a response interceptor to handle token expiration
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid, logout user
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

// Auth API
const authAPI = {
  register: (userData) => API.post("/api/auth/register", userData),
  login: (credentials) => API.post("/api/auth/login", credentials),
  getCurrentUser: () => API.get("/api/auth/me"),
}

// Quiz API
const quizAPI = {
  createQuiz: (quizData) => API.post("/api/quizzes", quizData),
  getTeacherQuizzes: () => API.get("/api/quizzes/teacher"),
  getAvailableQuizzes: () => API.get("/api/quizzes/available"),
  getQuiz: (quizId) => API.get(`/api/quizzes/${quizId}`),
  updateQuiz: (quizId, quizData) => API.put(`/api/quizzes/${quizId}`, quizData),
  deleteQuiz: (quizId) => API.delete(`/api/quizzes/${quizId}`),
  getQuizQuestions: (quizId) => API.get(`/api/quizzes/${quizId}/questions`),
  getQuizWithQuestions: (quizId) => API.get(`/api/quizzes/${quizId}/with-questions`), // <-- Added this line
}

// Question API
const questionAPI = {
  createQuestion: (questionData) => API.post("/api/questions", questionData),
  getQuestion: (questionId) => API.get(`/api/questions/${questionId}`),
  updateQuestion: (questionId, questionData) => API.put(`/api/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => API.delete(`/api/questions/${questionId}`),
}

// Attempt API
const attemptAPI = {
  createAttempt: (attemptData) => API.post("/api/attempts", attemptData),
  getStudentAttempts: () => API.get("/api/attempts/student"),
  getAttempt: (attemptId) => API.get(`/api/attempts/${attemptId}`),
  getAttemptQuestions: (attemptId) => API.get(`/api/attempts/${attemptId}/questions`),
}

export { authAPI, quizAPI, questionAPI, attemptAPI }
