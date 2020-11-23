const express = require('express')
const morgan = require('morgan')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(express.json())
app.use(morgan('dev'))

app.use(userRouter)
app.use(taskRouter)

module.exports = app
