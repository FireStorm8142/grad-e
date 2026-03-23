const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
  {
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure a teacher cannot be assigned to the exact same class and subject twice
assignmentSchema.index({ classId: 1, subjectId: 1, teacherId: 1 }, { unique: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
