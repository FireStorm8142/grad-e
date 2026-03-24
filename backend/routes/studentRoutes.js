const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const Exam = require("../models/Exam");
const Submission = require("../models/Submission");

// GET /api/student/dashboard/:studentId
router.get("/dashboard/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    // 1. Find all classes the student is enrolled in
    const classes = await Class.find({ students: studentId });
    const classIds = classes.map(c => c._id);

    // 2. Find all exams that belong to those classes
    const exams = await Exam.find({ classId: { $in: classIds } })
      .populate("subjectId", "name")
      .populate("classId", "name")
      .sort({ createdAt: -1 });

    // 3. Find all submissions for this student corresponding to these exams
    const submissions = await Submission.find({ 
      examId: { $in: exams.map(e => e._id) },
      studentId: studentId 
    });

    // 4. Merge the data: For each exam, attach the student's submission (without the heavy PDF data) if it exists
    const mergedDashboard = exams.map(exam => {
      const examObj = exam.toObject();
      const sub = submissions.find(s => s.examId.toString() === exam._id.toString());
      
      if (sub) {
        // Strip heavy PDF data for dashboard view
        const subData = sub.toObject();
        delete subData.pdfData;
        examObj.mySubmission = subData;
      } else {
        examObj.mySubmission = null;
      }

      return examObj;
    });

    res.json(mergedDashboard);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
