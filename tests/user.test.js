const { send } = require('@sendgrid/mail')
const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/user')
const { testUser, testUserId, setupDB } = require('./fixtures/db')

// TODO: invalid name issue

beforeEach(setupDB)

test('should signup a new user', async () => {
  const response = await request(app)
    .post('/users')
    .send({
      name: 'ferdi',
      email: 'ferdi@example.com',
      password: 'ferdi666',
    })
    .expect(201)

  // assert that the db was changed correctly
  // console.log(response.body)
  const user = await User.findById(response.body.user._id)
  expect(user).not.toBeNull()

  // assertions about the response
  expect(response.body).toMatchObject({
    user: {
      name: 'ferdi',
      email: 'ferdi@example.com',
    },
    token: user.tokens[0].token,
  })

  // password checking
  expect(user.password).not.toBe('ferdi666')
})

test('Should not signup user with invalid email', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'User Name',
      email: 'test.com',
      password: 'test1234',
    })
    .expect(400)
})

test('should not signup user with invalid password', async () => {
  await request(app)
    .post('/users')
    .send({
      name: 'User Name',
      email: 'example@test.com',
      password: 'test12',
    })
    .expect(400)
})

test('should login existing user', async () => {
  const response = await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: testUser.password,
    })
    .expect(200)

  const user = await User.findById(testUserId)
  expect(response.body.token).toBe(user.tokens[1].token)
})

test('should not login with non existing user', async () => {
  await request(app)
    .post('/users/login')
    .send({
      email: testUser.email,
      password: 'test111666',
    })
    .expect(400)
})

test('should get user profile', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)
})

test('should not get user profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', ``)
    .send()
    .expect(401)
})

test('should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send()
    .expect(200)

  const user = await User.findById(testUserId)
  expect(user).toBeNull()
})

test('should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', ``)
    .send()
    .expect(401)
})

test('should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    .expect(200)

  const user = await User.findById(testUserId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})

test('should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      name: 'Jane Doe',
    })
    .expect(200)

  const user = await User.findById(testUserId)
  expect(user.name).toBe('Jane Doe')
})

test('should not update user if unauthenticated', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', ``)
    .send({
      name: 'Jane Doe',
    })
    .expect(401)
})

test('should not update user with invalid email', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      email: 'test.com',
    })
    .expect(400)
})

test('should not update user with invalid password', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      password: 'test12',
    })
    .expect(400)
})

test('should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${testUser.tokens[0].token}`)
    .send({
      location: 'London',
    })
    .expect(400)
})
