const router   = require("express").Router();
const bcrypt   = require("bcryptjs");
const jwt      = require("jsonwebtoken");
const supabase = require("../supabase");

// ── Middleware ────────────────────────────────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: "Invalid token" }); }
};
module.exports.auth = auth;

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find by username OR roll number
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .or(`username.eq.${username},roll.eq.${username.toUpperCase()}`);

    const user = users?.[0];
    if (!user) return res.status(401).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({
      token,
      user: { id: user.id, name: user.name, username: user.username, roll: user.roll, role: user.role, subject: user.subject, firstLogin: user.first_login }
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── POST /api/auth/change-password ────────────────────────────────────────────
router.post("/change-password", auth, async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 4) return res.status(400).json({ error: "Password too short" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase.from("users").update({ password: hashed, first_login: false }).eq("id", req.user.id);
    res.json({ message: "Password updated!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
module.exports.auth = auth;
