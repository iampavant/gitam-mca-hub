const router   = require("express").Router();
const multer   = require("multer");
const supabase = require("../supabase");
const { auth } = require("./auth");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } }); // 20MB max

// GET all notes
router.get("/", auth, async (req, res) => {
  try {
    const { data, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST upload note (with optional file)
router.post("/", auth, upload.single("file"), async (req, res) => {
  try {
    if (!["admin","cr","teacher"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });

    const { title, subject, description, uploaded_by, uploaded_by_id } = req.body;
    let file_url = null;
    let file_name = null;

    // Upload file to Supabase Storage if provided
    if (req.file) {
      file_name = `${Date.now()}_${req.file.originalname.replace(/\s+/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(file_name, req.file.buffer, { contentType: req.file.mimetype, upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage.from("notes").getPublicUrl(file_name);
      file_url = urlData.publicUrl;
    }

    const { data, error } = await supabase.from("notes").insert([{
      title, subject, description: description || "",
      file_url, file_name: req.file?.originalname || null,
      uploaded_by, uploaded_by_id
    }]).select().single();

    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE note
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!["admin","cr","teacher"].includes(req.user.role)) return res.status(403).json({ error: "Not allowed" });

    // Get note to find file name for storage deletion
    const { data: note } = await supabase.from("notes").select("file_name").eq("id", req.params.id).single();
    
    if (note?.file_name) {
      // Delete file from storage
      const storageName = note.file_name.includes("_") ? note.file_name : note.file_name;
      await supabase.storage.from("notes").remove([storageName]);
    }

    await supabase.from("notes").delete().eq("id", req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
