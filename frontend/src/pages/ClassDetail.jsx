import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { ArrowLeft, User, GraduationCap } from "lucide-react";

export default function ClassDetail() {
  const { id } = useParams();
  const [cls, setCls] = useState(null);
  const [unassigned, setUnassigned] = useState([]);
  const [roster, setRoster] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clsRes, usersRes, assignRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}`),
        fetch(`${import.meta.env.VITE_API_URL}/api/users?role=student`),
        fetch(`${import.meta.env.VITE_API_URL}/api/assignments`)
      ]);
      
      const classData = await clsRes.json();
      const allStudents = await usersRes.json();
      const allAssignments = await assignRes.json();

      setCls(classData);
      
      const enrolledStudentIds = classData.students.map(s => s._id);
      setRoster(classData.students);
      setUnassigned(allStudents.filter(s => !enrolledStudentIds.includes(s._id)));
      
      setAssignments(allAssignments.filter(a => a.classId?._id === id));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateRosterOnBackend = async (studentId, listName) => {
    try {
      if (listName === "roster") {
        await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}/students`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentIds: [studentId] })
        });
      } else {
        await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${id}/students/${studentId}`, {
          method: "DELETE"
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId) return; // Order formatting ignored for simplicity

    const sourceList = source.droppableId === "unassigned" ? unassigned : roster;
    const destList = destination.droppableId === "unassigned" ? unassigned : roster;
    const [movedStudent] = sourceList.splice(source.index, 1);
    
    destList.splice(destination.index, 0, movedStudent);

    if (source.droppableId === "unassigned") {
      setUnassigned([...sourceList]);
      setRoster([...destList]);
      updateRosterOnBackend(movedStudent._id, "roster");
    } else {
      setRoster([...sourceList]);
      setUnassigned([...destList]);
      updateRosterOnBackend(movedStudent._id, "unassigned");
    }
  };

  if (loading || !cls) return <div>Loading class details...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <Link to="/admin/classes" style={{ display: "flex", alignItems: "center", color: "#64748b", textDecoration: "none" }}>
          <ArrowLeft size={20} /> <span style={{ marginLeft: "4px" }}>Back to Classes</span>
        </Link>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#1e293b" }}>{cls.name}</h1>
      </div>

      <div style={{ padding: "20px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 16px 0", fontSize: "18px", display: "flex", alignItems: "center", gap: "8px" }}>
          <GraduationCap size={20} /> Assigned Teachers
        </h2>
        {assignments.length === 0 ? (
          <div style={{ color: "#64748b", fontSize: "14px" }}>No teachers assigned to this class yet. Assign them in the Appointments tab.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: "20px", color: "#334155" }}>
            {assignments.map(a => (
              <li key={a._id} style={{ marginBottom: "8px" }}>
                <strong>{a.teacherId?.displayName || a.teacherId?.email}</strong> &mdash; <em>{a.subjectId?.name}</em>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, display: "flex", gap: "32px", minHeight: "400px" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {/* Left: Unassigned Students */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
            <div style={{ padding: "16px", backgroundColor: "#fff", borderBottom: "1px solid #e2e8f0", fontWeight: "600", color: "#475569" }}>
              Unassigned Students ({unassigned.length})
            </div>
            <Droppable droppableId="unassigned">
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  style={{ flex: 1, padding: "16px", overflowY: "auto", minHeight: "200px" }}
                >
                  {unassigned.map((student, index) => (
                    <Draggable key={student._id} draggableId={student._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: "none",
                            padding: "12px 16px",
                            margin: "0 0 8px 0",
                            backgroundColor: snapshot.isDragging ? "#bae6fd" : "#fff",
                            color: snapshot.isDragging ? "#0c4a6e" : "#334155",
                            borderRadius: "8px",
                            boxShadow: snapshot.isDragging ? "0 4px 6px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
                            border: "1px solid",
                            borderColor: snapshot.isDragging ? "#7dd3fc" : "#e2e8f0",
                            ...provided.draggableProps.style,
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                          }}
                        >
                          <User size={16} /> {student.displayName || student.email}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Right: Class Roster */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0", overflow: "hidden" }}>
            <div style={{ padding: "16px", backgroundColor: "#fff", borderBottom: "1px solid #bbf7d0", fontWeight: "600", color: "#166534" }}>
              Class Roster ({roster.length})
            </div>
            <Droppable droppableId="roster">
              {(provided) => (
                <div 
                  ref={provided.innerRef} 
                  {...provided.droppableProps}
                  style={{ flex: 1, padding: "16px", overflowY: "auto", minHeight: "200px" }}
                >
                  {roster.map((student, index) => (
                    <Draggable key={student._id} draggableId={student._id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            userSelect: "none",
                            padding: "12px 16px",
                            margin: "0 0 8px 0",
                            backgroundColor: snapshot.isDragging ? "#86efac" : "#fff",
                            color: snapshot.isDragging ? "#14532d" : "#166534",
                            borderRadius: "8px",
                            boxShadow: snapshot.isDragging ? "0 4px 6px rgba(0,0,0,0.1)" : "0 1px 2px rgba(0,0,0,0.05)",
                            border: "1px solid",
                            borderColor: snapshot.isDragging ? "#4ade80" : "#bbf7d0",
                            ...provided.draggableProps.style,
                            display: "flex",
                            alignItems: "center",
                            gap: "12px"
                          }}
                        >
                          <User size={16} /> {student.displayName || student.email}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {roster.length === 0 && !provided.placeholder && (
                    <div style={{ textAlign: "center", color: "#15803d", marginTop: "20px", fontSize: "14px" }}>
                      Drag students here to add them to the class.
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}
