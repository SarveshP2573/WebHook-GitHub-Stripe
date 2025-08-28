const User = require('../db/User.model')
const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator')

// Generate JWT Token
const generateToken = userId => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key', {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  })
}

// Send Token Response (both cookie + JSON)
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id)

  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })
}

// @desc Register user
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { name, email, password } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    const user = await User.create({
      name,
      email,
      passwordHash: password // pre-save middleware hashes it
    })

    sendTokenResponse(user, 201, res)
  } catch (error) {
    console.error('Register error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error during registration' })
  }
}

// @desc Login user
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email }).select('+passwordHash')

    if (!user || !(await user.comparePassword(password))) {
      return res
        .status(401)
        .json({ success: false, message: 'Invalid credentials' })
    }

    sendTokenResponse(user, 200, res)
  } catch (error) {
    console.error('Login error:', error)
    res
      .status(500)
      .json({ success: false, message: 'Server error during login' })
  }
}

// @desc Logout user
exports.logout = (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  })

  res
    .status(200)
    .json({ success: true, message: 'User logged out successfully' })
}

// @desc Get current user (requires protect middleware)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Get me error:', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}
