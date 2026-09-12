import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { CalendarCheck, Search, Save, Check, X, Clock } from "lucide-react";

interface Student {
  id: string;
  name: string;
  rollNo: string;
  courseName: string;
}

interface Batch {
  id: string;
  name: string;
  courseName: string;
}

interface AttendanceRecord {
  id?: string;
  studentId: string;
  status: "Present" | "Absent" | "Late";
}

export function AdminAttendance() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const [attendanceData, setAttendanceData] = useState<Record<string, "Present" | "Absent" | "Late">>({});
  const [existingRecordId, setExistingRecordId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const batchesSnap = await getDocs(collection(db, "batches"));
        const batchesList = batchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[];
        setBatches(batchesList);
        if (batchesList.length > 0) {
          setSelectedBatch(batchesList[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch batches:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchStudentsAndAttendance = async () => {
      if (!selectedBatch || !selectedDate) return;
      
      setLoading(true);
      try {
        const batch = batches.find(b => b.id === selectedBatch);
        if (!batch) return;

        // Fetch students in the course of the selected batch
        const studentsQuery = query(collection(db, "students"), where("courseName", "==", batch.courseName));
        const studentsSnap = await getDocs(studentsQuery);
        const studentsList = studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[];
        setStudents(studentsList);

        // Fetch existing attendance for this batch and date
        const attendanceQuery = query(
          collection(db, "attendance"), 
          where("batchId", "==", selectedBatch),
          where("date", "==", selectedDate)
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        
        if (!attendanceSnap.empty) {
          const record = attendanceSnap.docs[0];
          setExistingRecordId(record.id);
          
          const records = record.data().records as AttendanceRecord[];
          const newAttendanceData: Record<string, "Present" | "Absent" | "Late"> = {};
          records.forEach(r => {
            newAttendanceData[r.studentId] = r.status;
          });
          
          // Fill in missing students with 'Present' default
          studentsList.forEach(s => {
            if (!newAttendanceData[s.id]) {
              newAttendanceData[s.id] = "Present";
            }
          });
          
          setAttendanceData(newAttendanceData);
        } else {
          setExistingRecordId(null);
          // Default all to Present
          const newAttendanceData: Record<string, "Present" | "Absent" | "Late"> = {};
          studentsList.forEach(s => {
            newAttendanceData[s.id] = "Present";
          });
          setAttendanceData(newAttendanceData);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [selectedBatch, selectedDate, batches]);

  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Late") => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const records: AttendanceRecord[] = Object.entries(attendanceData).map(([studentId, status]) => ({
        studentId,
        status: status as "Present" | "Absent" | "Late"
      }));

      const dataToSave = {
        batchId: selectedBatch,
        date: selectedDate,
        records,
        updatedAt: new Date().toISOString()
      };

      if (existingRecordId) {
        await updateDoc(doc(db, "attendance", existingRecordId), dataToSave);
      } else {
        const docRef = await addDoc(collection(db, "attendance"), dataToSave);
        setExistingRecordId(docRef.id);
      }
      
      alert("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      alert("Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
        <button 
          onClick={handleSave}
          disabled={isSaving || students.length === 0}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          <Save size={20} />
          {isSaving ? "Saving..." : "Save Attendance"}
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            {batches.map(batch => (
              <option key={batch.id} value={batch.id}>{batch.name} ({batch.courseName})</option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CalendarCheck size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No students found for this batch's course.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600">Roll No</th>
                  <th className="p-4 font-semibold text-gray-600">Student Name</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm font-medium text-gray-900">{student.rollNo || "N/A"}</td>
                    <td className="p-4 text-sm text-gray-600">{student.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(student.id, "Present")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            attendanceData[student.id] === "Present" 
                              ? "bg-green-100 text-green-700 border border-green-200" 
                              : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Check size={14} /> Present
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "Absent")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            attendanceData[student.id] === "Absent" 
                              ? "bg-red-100 text-red-700 border border-red-200" 
                              : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <X size={14} /> Absent
                        </button>
                        <button
                          onClick={() => handleStatusChange(student.id, "Late")}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                            attendanceData[student.id] === "Late" 
                              ? "bg-amber-100 text-amber-700 border border-amber-200" 
                              : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          <Clock size={14} /> Late
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
