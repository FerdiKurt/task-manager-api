const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const testUserId = new mongoose.Types.ObjectId()
const testUser = {
  _id: testUserId,
  name: 'Jane',
  email: 'Jane@example.com',
  password: 'Jane6666',
  tokens: [
    {
      token: jwt.sign({ _id: testUserId }, process.env.JWT_SECRET),
    },
  ],
}

const _testUserId = new mongoose.Types.ObjectId()
const _testUser = {
  _id: _testUserId,
  name: 'John',
  email: 'John@example.com',
  password: 'John6666',
  tokens: [
    {
      token: jwt.sign({ _id: _testUserId }, process.env.JWT_SECRET),
    },
  ],
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Run 5 Km',
  completed: false,
  owner: testUserId,
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Do Exercises',
  completed: true,
  owner: testUserId,
}

const taskFour = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Run 6 Km',
  completed: false,
  owner: testUserId,
}

const taskFive = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Do Karate',
  completed: true,
  owner: testUserId,
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Do Exercises',
  completed: true,
  owner: _testUserId,
}

const setupDB = async () => {
  await User.deleteMany()
  await Task.deleteMany()

  const user = new User(testUser)
  const _user = new User(_testUser)
  await user.save()
  await _user.save()

  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
  await new Task(taskFour).save()
  await new Task(taskFive).save()
}

module.exports = {
  testUserId,
  _testUserId,
  testUser,
  _testUser,
  setupDB,
  taskOne,
  taskTwo,
  taskThree,
  taskFour,
  taskFive,
}
