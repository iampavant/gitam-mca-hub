const router   = require("express").Router();
const bcrypt   = require("bcryptjs");
const supabase = require("../supabase");
const { auth } = require("./auth");

// GET all users (admin only)
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const { data, error } = await supabase.from("users").select("id,name,username,roll,role,subject,first_login,created_at");
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET students only
router.get("/students", auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("id,name,username,roll,role").eq("role","student").order("roll");
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create user (admin only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const { name, username, password, role, subject, roll } = req.body;

    const { data: existing } = await supabase.from("users").select("id").eq("username", username).single();
    if (existing) return res.status(400).json({ error: "Username already taken" });

    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase.from("users").insert([{
      name, username, password: hashed, role, subject: subject||"", roll: roll||"", first_login: true
    }]).select("id,name,username,roll,role,subject,first_login").single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE user (admin only)
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin only" });
    const { data: user } = await supabase.from("users").select("role").eq("id", req.params.id).single();
    if (user?.role === "admin") return res.status(400).json({ error: "Cannot delete admin" });
    await supabase.from("users").delete().eq("id", req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH reset password (admin/cr)
router.patch("/:id/reset-password", auth, async (req, res) => {
  try {
    if (!["admin","cr"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });
    const hashed = await bcrypt.hash(req.body.newPassword, 10);
    await supabase.from("users").update({ password: hashed, first_login: false }).eq("id", req.params.id);
    res.json({ message: "Password reset!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
