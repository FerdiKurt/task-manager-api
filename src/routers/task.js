const express = require('express')
const Task = require('../models/task')
const auth = require('../middleware/auth')
const router = new express.Router()

router.post('/tasks', auth, async (req, res) => {
  const user = req.user
  const task = new Task({
    ...req.body,
    owner: user._id,
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.get('/tasks', auth, async (req, res) => {
  const match = {}
  const sort = {}
  const user = req.user

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
  }

  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    console.log(parts)
    sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    console.log(sort)
  }

  try {
    await user
      .populate({
        path: 'userTasks',
        match,
        options: {
          limit: +req.query.limit,
          skip: +req.query.skip,
          sort,
        },
      })
      .execPopulate()
    res.send(user.userTasks)
  } catch (e) {
    res.status(500).send()
  }
})

router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id
  const user = req.user

  try {
    const task = await Task.findOne({ _id, owner: user._id })

    if (!task) {
      return res.status(404).send()
    }

    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

router.patch('/tasks/:id', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  )

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' })
  }

  const user = req.user
  const _id = req.params.id

  try {
    const task = await Task.findOne({ _id, owner: user._id })
    if (!task) {
      return res.status(404).send()
    }

    updates.forEach((update) => (task[update] = req.body[update]))
    await task.save()

    res.send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

router.delete('/tasks/:id', auth, async (req, res) => {
  const user = req.user
  const _id = req.params.id

  try {
    const task = await Task.findOneAndDelete({ _id, owner: user._id })

    if (!task) {
      res.status(404).send()
    }

    res.send(task)
  } catch (e) {
    res.status(500).send()
  }
})

module.exports = router
