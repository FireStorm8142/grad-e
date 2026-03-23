const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Class = require("../models/Class");
const Subject = require("../models/Subject");

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  try {
    const [totalStudents, totalTeachers, totalAdmins, totalClasses, totalSubjects] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
      Class.countDocuments(),
      Subject.countDocuments()
    ]);

    return res.json({
      students: totalStudents,
      teachers: totalTeachers,
      admins: totalAdmins,
      classes: totalClasses,
      subjects: totalSubjects,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
