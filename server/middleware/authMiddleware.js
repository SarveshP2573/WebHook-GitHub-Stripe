const jwt = require('jsonwebtoken')
const User = require('../db/User.model')

const protect = async (req, res, next) => {
  let token

  if (req.cookies && req.cookies.token) {
    token = req.cookies.token
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1]
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token missing' })
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key'
    )
    req.userId = decoded.userId
    req.user = await User.findById(decoded.userId).select('-passwordHash')
    next()
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, token invalid' })
  }
}

module.exports = protect
