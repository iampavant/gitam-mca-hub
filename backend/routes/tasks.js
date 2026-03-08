const router   = require("express").Router();
const supabase = require("../supabase");
const { auth } = require("./auth");

// GET all tasks
router.get("/", auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("tasks").select("*").order("created_at", { ascending: false });
    if (error) throw error;

    // Attach completion map for each task
    const taskIds = data.map(t => t.id);
    let completions = [];
    if (taskIds.length > 0) {
      const { data: c } = await supabase.from("task_completions").select("*").in("task_id", taskIds);
      completions = c || [];
    }

    const tasks = data.map(t => ({
      ...t,
      completed_by: Object.fromEntries(completions.filter(c => c.task_id === t.id).map(c => [c.student_roll, true]))
    }));

    res.json(tasks);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST create task
router.post("/", auth, async (req, res) => {
  try {
    if (!["admin","cr","teacher"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });
    const { data, error } = await supabase.from("tasks").insert([req.body]).select().single();
    if (error) throw error;
    res.json({ ...data, completed_by: {} });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE task
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!["admin","cr","teacher"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });
    await supabase.from("tasks").delete().eq("id", req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH mark done/undone
router.patch("/:id/complete", auth, async (req, res) => {
  try {
    const { roll, done } = req.body;
    if (done) {
      await supabase.from("task_completions").upsert([{ task_id: req.params.id, student_roll: roll }]);
    } else {
      await supabase.from("task_completions").delete().eq("task_id", req.params.id).eq("student_roll", roll);
    }
    res.json({ message: "Updated" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
