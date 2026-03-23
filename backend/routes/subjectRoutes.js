const express = require("express");
const router = express.Router();
const Subject = require("../models/Subject");

// GET /api/subjects
router.get("/", async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ name: 1 });
    return res.json(subjects);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/subjects
router.post("/", async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Subject name is required." });

    const existing = await Subject.findOne({ name });
    if (existing) return res.status(409).json({ error: "Subject already exists." });

    const subject = await Subject.create({ name });
    return res.status(201).json(subject);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/subjects/:id
router.delete("/:id", async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ error: "Subject not found." });
    
    return res.json({ message: "Subject deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
