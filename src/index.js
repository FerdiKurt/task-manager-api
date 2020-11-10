const express = require('express')
const morgan = require('morgan')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()

app.use(morgan('dev'))
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

const port = process.env.PORT
app.listen(port, () => {
  console.log('Server is up on port ' + port)
})
