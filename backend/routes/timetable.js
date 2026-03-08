const router   = require("express").Router();
const supabase = require("../supabase");
const { auth } = require("./auth");

// GET full timetable
router.get("/", auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("timetable").select("*");
    if (error) throw error;
    const tt = {};
    data.forEach(row => { tt[row.day] = row.slots; });
    res.json(tt);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT update one day
router.put("/:day", auth, async (req, res) => {
  try {
    if (!["admin","cr"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });
    const { slots } = req.body;
    const { data, error } = await supabase
      .from("timetable")
      .upsert([{ day: req.params.day, slots }], { onConflict: "day" })
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
