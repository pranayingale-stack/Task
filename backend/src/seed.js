// seed.js
// Populates the database with demo accounts (one Tech Head, two Co-Committee
// Members) and a handful of sample tasks so the app can be evaluated
// immediately after clone + install, without manual data entry.
//
// Run with: npm run seed

require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./db');

function upsertUser({ username, password, name, role }) {
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) return existing.id;
  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)')
    .run(username, hash, name, role);
  return info.lastInsertRowid;
}

function seed() {
  console.log('Seeding database...');

  const techHeadId = upsertUser({
    username: 'techhead',
    password: 'TechHead@123',
    name: 'Aditi Sharma',
    role: 'tech_head',
  });

  const member1Id = upsertUser({
    username: 'member1',
    password: 'Member1@123',
    name: 'Rohan Mehta',
    role: 'co_committee',
  });

  const member2Id = upsertUser({
    username: 'member2',
    password: 'Member2@123',
    name: 'Sara Iyer',
    role: 'co_committee',
  });

  const existingTasks = db.prepare('SELECT COUNT(*) AS c FROM tasks').get().c;
  if (existingTasks === 0) {
    const insert = db.prepare(`
      INSERT INTO tasks (title, description, assignee_id, created_by, status, priority, deadline)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      'Design event poster',
      'Create a poster for the annual tech fest using the new branding guidelines.',
      member1Id,
      techHeadId,
      'In Progress',
      'High',
      '2026-09-05'
    );
    insert.run(
      'Book auditorium',
      'Confirm auditorium booking with the admin office for the opening ceremony.',
      member2Id,
      techHeadId,
      'Pending',
      'Medium',
      '2026-08-30'
    );
    insert.run(
      'Prepare sponsor deck',
      'Draft a sponsorship pitch deck covering tiers and benefits.',
      member1Id,
      techHeadId,
      'Completed',
      'Low',
      '2026-08-15'
    );
    insert.run(
      'Coordinate volunteer list',
      'Finalize the list of volunteers and assign shift timings.',
      member2Id,
      techHeadId,
      'Pending',
      'High',
      '2026-09-10'
    );

    console.log('Sample tasks inserted.');
  } else {
    console.log('Tasks already exist, skipping sample task insertion.');
  }

  console.log('\nDemo credentials:');
  console.log('  Tech Head      -> username: techhead  | password: TechHead@123');
  console.log('  Co-Committee 1 -> username: member1    | password: Member1@123');
  console.log('  Co-Committee 2 -> username: member2    | password: Member2@123');
  console.log('\nSeeding complete.');
}

seed();
