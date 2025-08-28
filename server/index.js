const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const morgan = require('morgan')

require('dotenv').config()

const authRouter = require('./routes/auth.route')

mongoose.connect('mongodb://localhost:27017/FYP')

const app = express()

const PORT = process.env.PORT

app.use(express.json())
app.use(cors())
app.use(morgan('dev'))

app.use('/auth', authRouter)

app.get('/', (req, res) => {
  console.log('Server is listening')
})

app.listen(PORT, () => {
  console.log(`Server is listening at ${PORT}`)
})
