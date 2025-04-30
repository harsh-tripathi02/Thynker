const User = require("../models/User")

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" })
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
    })

    // Generate token
    const token = user.getSignedJwtToken()

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}


exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" })
    }

    // Check for user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = user.getSignedJwtToken()

    // Set token in HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (err) {
    next(err)
  }
}


exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    })
  } catch (err) {
    next(err)
  }
}
