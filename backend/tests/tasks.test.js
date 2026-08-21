// tests/tasks.test.js
// Integration tests covering login, role-based authorization, and the
// core permission boundary: a Co-Committee Member must never be able to
// read, edit, or delete another member's tasks.

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret';
process.env.DB_PATH = './data/test.db';

const fs = require('fs');
const path = require('path');

const TEST_DB_PATH = path.join(__dirname, '..', 'data', 'test.db');

beforeAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
});

afterAll(() => {
  if (fs.existsSync(TEST_DB_PATH)) fs.unlinkSync(TEST_DB_PATH);
  const wal = `${TEST_DB_PATH}-wal`;
  const shm = `${TEST_DB_PATH}-shm`;
  if (fs.existsSync(wal)) fs.unlinkSync(wal);
  if (fs.existsSync(shm)) fs.unlinkSync(shm);
});

const request = require('supertest');
const bcrypt = require('bcryptjs');
const db = require('../src/db');
const app = require('../src/server');

let techHeadToken, member1Token, member2Token;
let member1Id, member2Id;
let taskAssignedToMember1;

beforeAll(() => {
  const hash = bcrypt.hashSync('Password@123', 10);
  db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'head', hash, 'Head Person', 'tech_head'
  );
  const m1 = db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'memberA', hash, 'Member A', 'co_committee'
  );
  const m2 = db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run(
    'memberB', hash, 'Member B', 'co_committee'
  );
  member1Id = m1.lastInsertRowid;
  member2Id = m2.lastInsertRowid;
});

test('login succeeds with correct credentials and returns a token', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'head', password: 'Password@123' });
  expect(res.status).toBe(200);
  expect(res.body.token).toBeDefined();
  expect(res.body.user.role).toBe('tech_head');
  techHeadToken = res.body.token;
});

test('login fails with wrong password without leaking which field was wrong', async () => {
  const res = await request(app).post('/api/auth/login').send({ username: 'head', password: 'wrong' });
  expect(res.status).toBe(401);
  expect(res.body.error).toMatch(/invalid username or password/i);
});

test('member logins succeed', async () => {
  const res1 = await request(app).post('/api/auth/login').send({ username: 'memberA', password: 'Password@123' });
  const res2 = await request(app).post('/api/auth/login').send({ username: 'memberB', password: 'Password@123' });
  member1Token = res1.body.token;
  member2Token = res2.body.token;
  expect(res1.status).toBe(200);
  expect(res2.status).toBe(200);
});

test('unauthenticated requests are rejected', async () => {
  const res = await request(app).get('/api/tasks');
  expect(res.status).toBe(401);
});

test('a co-committee member cannot create a task', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${member1Token}`)
    .send({ title: 'Sneaky task', assigneeId: member1Id });
  expect(res.status).toBe(403);
});

test('tech head can create a task assigned to member A', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${techHeadToken}`)
    .send({ title: 'Book venue', assigneeId: member1Id, priority: 'High', status: 'Pending' });
  expect(res.status).toBe(201);
  expect(res.body.task.assignee_id).toBe(member1Id);
  taskAssignedToMember1 = res.body.task;
});

test('tech head cannot create a task with missing title', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${techHeadToken}`)
    .send({ assigneeId: member1Id });
  expect(res.status).toBe(400);
  expect(res.body.details.title).toBeDefined();
});

test('tech head cannot assign a task to another tech head', async () => {
  const res = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${techHeadToken}`)
    .send({ title: 'Bad assignment', assigneeId: 1 }); // user id 1 = head
  expect(res.status).toBe(400);
});

test('member A sees only their own task', async () => {
  const res = await request(app).get('/api/tasks').set('Authorization', `Bearer ${member1Token}`);
  expect(res.status).toBe(200);
  expect(res.body.tasks.every((t) => t.assignee_id === member1Id)).toBe(true);
});

test('member B cannot view member A task directly by id (404, not 403)', async () => {
  const res = await request(app)
    .get(`/api/tasks/${taskAssignedToMember1.id}`)
    .set('Authorization', `Bearer ${member2Token}`);
  expect(res.status).toBe(404);
});

test('member B cannot update the status of member A task', async () => {
  const res = await request(app)
    .patch(`/api/tasks/${taskAssignedToMember1.id}/status`)
    .set('Authorization', `Bearer ${member2Token}`)
    .send({ status: 'Completed' });
  expect(res.status).toBe(403);
});

test('member A can update the status of their own task', async () => {
  const res = await request(app)
    .patch(`/api/tasks/${taskAssignedToMember1.id}/status`)
    .set('Authorization', `Bearer ${member1Token}`)
    .send({ status: 'In Progress' });
  expect(res.status).toBe(200);
  expect(res.body.task.status).toBe('In Progress');
});

test('member A cannot delete a task', async () => {
  const res = await request(app)
    .delete(`/api/tasks/${taskAssignedToMember1.id}`)
    .set('Authorization', `Bearer ${member1Token}`);
  expect(res.status).toBe(403);
});

test('tech head can delete a task', async () => {
  const res = await request(app)
    .delete(`/api/tasks/${taskAssignedToMember1.id}`)
    .set('Authorization', `Bearer ${techHeadToken}`);
  expect(res.status).toBe(204);
});
