const express = require("express");
const cors    = require("cors");
const path    = require("path");
require("dotenv").config();
const cors = require("cors");

app.use(cors({
  origin: "https://gitam-mca-hub.vercel.app",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: true
}));

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

// Routes
app.use("/api/auth",          require("./routes/auth"));
app.use("/api/tasks",         require("./routes/tasks"));
app.use("/api/notes",         require("./routes/notes"));
app.use("/api/timetable",     require("./routes/timetable"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/users",         require("./routes/users"));

// Health check
app.get("/", (req, res) => res.json({ message: "🎓 GITAM MCA Hub API is running!" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
