const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// GET /api/assignments
router.get("/", async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate("classId", "name")
      .populate("subjectId", "name")
      .populate("teacherId", "displayName email")
      .sort({ createdAt: -1 });
    return res.json(assignments);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// POST /api/assignments
router.post("/", async (req, res) => {
  try {
    const { classId, subjectId, teacherId } = req.body;
    if (!classId || !subjectId || !teacherId) {
      return res.status(400).json({ error: "classId, subjectId, and teacherId are required." });
    }

    const assignment = await Assignment.create({ classId, subjectId, teacherId });
    const populated = await Assignment.findById(assignment._id)
      .populate("classId", "name")
      .populate("subjectId", "name")
      .populate("teacherId", "displayName email");

    return res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "This exact assignment already exists." });
    }
    return res.status(500).json({ error: error.message });
  }
});

// DELETE /api/assignments/:id
router.delete("/:id", async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ error: "Assignment not found." });
    
    return res.json({ message: "Assignment deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
