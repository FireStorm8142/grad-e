const express = require("express");
const router = express.Router();
const Assignment = require("../models/Assignment");

// Context routes for teacher: fetches classes and subjects the teacher has assignments for
// GET /api/teacher/assignments/:teacherId
router.get("/assignments/:teacherId", async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.params.teacherId })
      .populate("classId", "name")
      .populate("subjectId", "name");
      
    // Transform into unique classes and subjects maps for frontend dropdowns
    const classesMap = new Map();
    const subjectsMap = new Map();

    assignments.forEach(a => {
      if (a.classId) classesMap.set(a.classId._id.toString(), { _id: a.classId._id, name: a.classId.name });
      if (a.subjectId) subjectsMap.set(a.subjectId._id.toString(), { _id: a.subjectId._id, name: a.subjectId.name });
    });

    return res.json({
      classes: Array.from(classesMap.values()),
      subjects: Array.from(subjectsMap.values()),
      raw: assignments
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
