# 🎓 GITAM MCA Hub — Setup Guide
**Visakhapatnam Campus | MCA Department | 2024-25**

---

## What's in this ZIP?

```
📁 gitam-mca-hub/
├── 📁 frontend/          ← React app (the website)
│   ├── src/App.jsx       ← Main app code
│   ├── package.json
│   └── vite.config.js
├── 📁 backend/           ← Node.js server
│   ├── server.js
│   ├── seed.js           ← Adds 55 students to database
│   ├── supabase.js
│   ├── .env.example      ← Copy this to .env
│   └── routes/           ← API routes
├── 📁 database/
│   └── schema.sql        ← Run this in Supabase
└── README.md             ← This file
```

---

## STEP 1 — Create Supabase Project (Free)

1. Go to **https://supabase.com** → Sign up (use Google)
2. Click **"New Project"**
3. Name: `mca-hub`
4. Database Password: set something simple like `Gitam@2024`
5. Region: **Southeast Asia (Singapore)**
6. Click **"Create new project"** → Wait 2 minutes

---

## STEP 2 — Run the Database Schema

1. In Supabase, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**
3. Open the file `database/schema.sql` from this ZIP
4. Copy ALL the content
5. Paste it in Supabase SQL Editor
6. Click **"Run"** (green button)
7. You should see **"Success. No rows returned"** ✅

---

## STEP 3 — Create Storage Bucket for Notes Files

1. In Supabase, click **"Storage"** in left sidebar
2. Click **"New bucket"**
3. Name: `notes`
4. Turn ON **"Public bucket"** toggle
5. Click **"Save"**

---

## STEP 4 — Get Your Supabase Keys

1. In Supabase, click **"Settings"** (gear icon) → **"API"**
2. Copy these two things:
   - **Project URL** → looks like `https://vgacurhuhzbblpbwcqot.supabase.co`
   - **service_role key** → under "Project API keys" → click eye icon to reveal

---

## STEP 5 — Set Up Backend

Open VS Code terminal and run:

```bash
cd "C:\Users\pavan\mca-hub"
```

Create backend folder and go into it:
```bash
cd backend
```

Copy `.env.example` to `.env`:
```bash
copy .env.example .env
```

Open `.env` and fill in your details:
```
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
JWT_SECRET=gitam_mca_vizag_2024_secret
PORT=5000
```

Install packages:
```bash
npm install
```

---

## STEP 6 — Add All 55 Students to Database

In the backend folder, run:
```bash
node seed.js
```

You should see all 55 students being added ✅

---

## STEP 7 — Start the Backend

```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
```

Test it: Open browser → go to `http://localhost:5000`
You should see: `{"message":"🎓 GITAM MCA Hub API is running!"}`

---

## STEP 8 — Set Up Frontend

Open a **new terminal** in VS Code and run:

```bash
cd "C:\Users\pavan\mca-hub\frontend"
```

Copy .env.example:
```bash
copy .env.example .env
```

The `.env` should have:
```
VITE_API_URL=http://localhost:5000/api
```

Install packages:
```bash
npm install
```

Start frontend:
```bash
npm run dev
```

Open browser → go to `http://localhost:5173` 🎉

---

## Login Details

| Role | Username | Password |
|------|----------|----------|
| 👑 Admin | `admin` | `admin@123` |
| 🎓 CR | `cr_ravi` | `cr@123` |
| 👨‍🏫 Teacher | `sharma` | `teach@123` |
| 🧑‍💻 Student | `MCA001` | `MCA001` |

> Students can change their password after first login from "Account" page.
> Teachers must change password on first login.

---

## Features

| Feature | Who Can Use It |
|---------|---------------|
| 📋 Post Tasks | Admin, CR, Teacher |
| ✅ Mark Tasks Done | Students (own record only) |
| 📚 Upload Notes/Files | Admin, CR, Teacher |
| 📥 Download Notes | Everyone |
| 📅 Edit Timetable | Admin, CR |
| 🔔 Send Notifications | Admin, CR, Teacher |
| 👥 View Student Roster | Admin, CR, Teacher |
| 🔑 Reset Student Password | Admin, CR |
| 👨‍🏫 Manage Staff | Admin only |

---

## File Upload Limits
- Max file size: **20 MB**
- Supported formats: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG

---

## Troubleshooting

**"Cannot connect to server"** → Make sure backend is running (`npm run dev` in backend folder)

**"Login failed"** → Make sure you ran `node seed.js` first

**"File upload failed"** → Make sure Supabase Storage bucket `notes` is created and set to Public

**Port already in use** → Change `PORT=5001` in backend `.env`

---

## Need Help?
Check that both terminals are running:
- Terminal 1 (backend): `npm run dev` → shows port 5000
- Terminal 2 (frontend): `npm run dev` → shows port 5173
