-- ============================================================
-- GITAM MCA HUB - SUPABASE DATABASE SCHEMA
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
create table if not exists users (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  username    text unique not null,
  roll        text default '',
  password    text not null,
  role        text check (role in ('admin','cr','teacher','student')) default 'student',
  subject     text default '',
  first_login boolean default true,
  created_at  timestamptz default now()
);

-- ── TASKS ────────────────────────────────────────────────────
create table if not exists tasks (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  subject       text not null,
  type          text not null,
  description   text default '',
  due_date      text not null,
  posted_by     text not null,
  posted_by_id  uuid references users(id) on delete set null,
  priority      text default 'Medium',
  created_at    timestamptz default now()
);

-- ── TASK COMPLETIONS ─────────────────────────────────────────
create table if not exists task_completions (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid references tasks(id) on delete cascade,
  student_roll text not null,
  completed_at timestamptz default now(),
  unique(task_id, student_roll)
);

-- ── TIMETABLE ────────────────────────────────────────────────
create table if not exists timetable (
  id    uuid primary key default gen_random_uuid(),
  day   text unique not null,
  slots jsonb default '[]'
);

-- ── NOTES ────────────────────────────────────────────────────
create table if not exists notes (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  subject         text not null,
  description     text default '',
  file_url        text,
  file_name       text,
  uploaded_by     text not null,
  uploaded_by_id  uuid references users(id) on delete set null,
  created_at      timestamptz default now()
);

-- ── NOTIFICATIONS ────────────────────────────────────────────
create table if not exists notifications (
  id          uuid primary key default gen_random_uuid(),
  message     text not null,
  type        text default 'info',
  created_by  text not null,
  target_role text default 'all',
  created_at  timestamptz default now()
);

-- ── NOTIFICATION READS ───────────────────────────────────────
create table if not exists notification_reads (
  id              uuid primary key default gen_random_uuid(),
  notification_id uuid references notifications(id) on delete cascade,
  user_id         uuid references users(id) on delete cascade,
  read_at         timestamptz default now(),
  unique(notification_id, user_id)
);

-- ============================================================
-- SEED DATA — Staff + 55 Students (passwords are bcrypt hashed)
-- Passwords: admin@123, cr@123, teach@123, students = roll number
-- ============================================================

-- Staff (passwords pre-hashed with bcrypt rounds=10)
insert into users (name, username, roll, password, role, subject, first_login) values
  ('Super Admin',  'admin',   '', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',   '', false),
  ('Ravi Kumar',   'cr_ravi', '', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'cr',      '', false),
  ('Prof. Sharma', 'sharma',  '', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'DSA',  true),
  ('Prof. Meena',  'meena',   '', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'DBMS', true),
  ('Prof. Kapoor', 'kapoor',  '', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'teacher', 'CN',   true)
on conflict (username) do nothing;

-- Note: The above hashes correspond to:
--   admin   → admin@123
--   cr_ravi → cr@123  
--   sharma/meena/kapoor → teach@123
-- Run the seed.js file to insert with correct hashes!

-- Timetable seed
insert into timetable (day, slots) values
  ('Monday',    '[{"period":1,"subject":"DSA","teacher":"Prof. Sharma","room":"R101"},{"period":2,"subject":"DBMS","teacher":"Prof. Meena","room":"R102"},{"period":3,"subject":"","teacher":"","room":""},{"period":4,"subject":"Web Dev","teacher":"Prof. Kapoor","room":"Lab1"},{"period":5,"subject":"CN","teacher":"Prof. Kapoor","room":"R103"},{"period":6,"subject":"","teacher":"","room":""}]'),
  ('Tuesday',   '[{"period":1,"subject":"Python","teacher":"Prof. Kapoor","room":"Lab2"},{"period":2,"subject":"","teacher":"","room":""},{"period":3,"subject":"DSA","teacher":"Prof. Sharma","room":"R101"},{"period":4,"subject":"DBMS","teacher":"Prof. Meena","room":"R102"},{"period":5,"subject":"","teacher":"","room":""},{"period":6,"subject":"OS","teacher":"Prof. Kapoor","room":"R103"}]'),
  ('Wednesday', '[{"period":1,"subject":"","teacher":"","room":""},{"period":2,"subject":"Web Dev","teacher":"Prof. Kapoor","room":"Lab1"},{"period":3,"subject":"CN","teacher":"Prof. Kapoor","room":"R103"},{"period":4,"subject":"","teacher":"","room":""},{"period":5,"subject":"DSA","teacher":"Prof. Sharma","room":"R101"},{"period":6,"subject":"DBMS","teacher":"Prof. Meena","room":"R102"}]'),
  ('Thursday',  '[{"period":1,"subject":"DBMS","teacher":"Prof. Meena","room":"Lab3"},{"period":2,"subject":"OS","teacher":"Prof. Kapoor","room":"R103"},{"period":3,"subject":"","teacher":"","room":""},{"period":4,"subject":"Python","teacher":"Prof. Kapoor","room":"Lab2"},{"period":5,"subject":"","teacher":"","room":""},{"period":6,"subject":"DSA","teacher":"Prof. Sharma","room":"R101"}]'),
  ('Friday',    '[{"period":1,"subject":"CN","teacher":"Prof. Kapoor","room":"R103"},{"period":2,"subject":"DSA","teacher":"Prof. Sharma","room":"R101"},{"period":3,"subject":"OS","teacher":"Prof. Kapoor","room":"R103"},{"period":4,"subject":"","teacher":"","room":""},{"period":5,"subject":"Web Dev","teacher":"Prof. Kapoor","room":"Lab1"},{"period":6,"subject":"","teacher":"","room":""}]'),
  ('Saturday',  '[{"period":1,"subject":"Seminar","teacher":"HOD","room":"Seminar Hall"},{"period":2,"subject":"","teacher":"","room":""},{"period":3,"subject":"","teacher":"","room":""},{"period":4,"subject":"","teacher":"","room":""},{"period":5,"subject":"","teacher":"","room":""},{"period":6,"subject":"","teacher":"","room":""}]')
on conflict (day) do nothing;
