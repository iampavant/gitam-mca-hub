const router   = require("express").Router();
const supabase = require("../supabase");
const { auth } = require("./auth");

// GET notifications (with read status for current user)
router.get("/", auth, async (req, res) => {
  try {
    const { data: notifs, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const { data: reads } = await supabase
      .from("notification_reads")
      .select("notification_id")
      .eq("user_id", req.user.id);

    const readIds = new Set((reads || []).map(r => r.notification_id));

    const result = notifs
      .filter(n => n.target_role === "all" || n.target_role === req.user.role)
      .map(n => ({ ...n, read: readIds.has(n.id) }));

    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create notification
router.post("/", auth, async (req, res) => {
  try {
    if (!["admin","cr","teacher"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });
    const { data, error } = await supabase.from("notifications").insert([req.body]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH mark notification as read
router.patch("/:id/read", auth, async (req, res) => {
  try {
    await supabase.from("notification_reads").upsert([{ notification_id: req.params.id, user_id: req.user.id }]);
    res.json({ message: "Marked read" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
