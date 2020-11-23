const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/task')
const {
  testUser,
  _testUser,
  taskOne,
  taskTwo,
  taskThree,
  setupDB,
} = require('./fixtures/db')

beforeEach(setupDB)

test('should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      description: 'Study Jest',
    })
    .expect(201)

  // console.log(response.body)
  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()
  expect(task.completed).toBe(false)
})

test('should get specified user tasks', async () => {
  const response = await request(app)
    .get('/tasks') // filter, sort and any other options will be set in the url
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toBe(4)
})

test('should fail to delete a task related to another user', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set('Authorization', `Bearer ${_testUser.tokens[0].token}`)
    .send()
    .expect(404)

  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})

test('should not create task with invalid description', async () => {
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      description: '',
      completed: true,
    })
    .expect(400)
})

test('should not create task with invalid completed', async () => {
  await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      description: 'Surf 1 hour',
      completed: 1234,
    })
    .expect(400)
})

test('should delete user task', async () => {
  const response = await request(app)
    .delete(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  const task = await Task.findById(response.body._id)
  expect(task).toBeNull()
})

test('should not delete task if unauthenticated', async () => {
  await request(app)
    .delete(`/tasks/${taskTwo._id}`)
    .set('Authorization', ``)
    .send()
    .expect(401)
})

test('should not update other users task', async () => {
  await request(app)
    .patch(`/tasks/${taskThree._id}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      completed: false,
    })
    .expect(404)
})

test('should fetch user task by id', async () => {
  const response = await request(app)
    .get(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .expect(200)

  const task = await Task.findById(response.body._id)
  expect(task.description).toBe('Do Exercises')
})

test('should not fetch user task by id if unauthenticated', async () => {
  await request(app)
    .get(`/tasks/${taskTwo._id}`)
    .set('Authorization', ``)
    .expect(401)
})

test('should not fetch other users task by id', async () => {
  await request(app)
    .get(`/tasks/${taskTwo._id}`)
    .set('Authorization', `Bearer ${_testUser.tokens[0].token}`)
    .expect(404)
})

test('should fetch only completed tasks', async () => {
  const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toBe(2)
})

test('should fetch only incomplete tasks', async () => {
  const response = await request(app)
    .get('/tasks?completed=false')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body.length).toBe(2)
})

test('should sort tasks by description', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=description:desc')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body[0].description).toEqual('Run 6 Km')
})

test('should sort tasks by completed', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=completed:desc')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body[0].description).toEqual('Do Exercises')
})

test('should sort tasks by createdAt', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=createdAt:desc')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body[0].description).toEqual('Do Karate')
})

test('should sort tasks by updatedAt', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=updatedAt:desc')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body[0].description).toEqual('Do Karate')
})

test('should fetch page of tasks', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=createdAt:desc&limit=3')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  expect(response.body[2].description).toEqual('Do Exercises')
})
