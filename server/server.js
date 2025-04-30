const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const cookieParser = require("cookie-parser")

// Load environment variables
dotenv.config()

// Import routes
const authRoutes = require("./routes/auth")
const quizRoutes = require("./routes/quizzes")
const questionRoutes = require("./routes/questions")
const attemptRoutes = require("./routes/attempts")

// Initialize express app
const app = express()

// Middleware
app.use(cors({
  origin: true, 
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/quizzes", quizRoutes)
app.use("/api/questions", questionRoutes)
app.use("/api/attempts", attemptRoutes)


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: "Something went wrong!" })
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
