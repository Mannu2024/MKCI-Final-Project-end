import React, { useState, useEffect, useRef } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit, Trash2, X, Search, Upload, Filter, ArrowUpDown, Eye, CheckCircle, XCircle, Award } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface Student {
  id: string;
  rollNo?: string;
  name?: string;
  fatherName?: string;
  motherName?: string;
  email?: string;
  phone?: string;
  courseName?: string;
  enrollmentDate?: string;
  status: "Active" | "Completed" | "Dropped";
}

export function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters and Sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"name" | "enrollmentDate">("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    rollNo: "",
    name: "",
    fatherName: "",
    motherName: "",
    email: "",
    phone: "",
    courseName: "",
    enrollmentDate: new Date().toISOString().split('T')[0],
    status: "Active" as "Active" | "Completed" | "Dropped",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, "students")),
        getDocs(collection(db, "courses"))
      ]);
      
      setStudents(studentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Student[]);
      setCourses(coursesSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (student?: Student) => {
    if (student) {
      setEditingStudent(student);
      setFormData({
        rollNo: student.rollNo || "",
        name: student.name || "",
        fatherName: student.fatherName || "",
        motherName: student.motherName || "",
        email: student.email || "",
        phone: student.phone || "",
        courseName: student.courseName || "",
        enrollmentDate: student.enrollmentDate || "",
        status: student.status,
      });
    } else {
      setEditingStudent(null);
      setFormData({
        rollNo: "",
        name: "",
        fatherName: "",
        motherName: "",
        email: "",
        phone: "",
        courseName: courses.length > 0 ? courses[0].name : "",
        enrollmentDate: new Date().toISOString().split('T')[0],
        status: "Active",
      });
    }
    setIsModalOpen(true);
  };

  const handleView = (student: Student) => {
    setViewingStudent(student);
    setIsViewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsViewModalOpen(false);
    setEditingStudent(null);
    setViewingStudent(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await updateDoc(doc(db, "students", editingStudent.id), formData);
      } else {
        await addDoc(collection(db, "students"), formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving student:", error);
      alert("Failed to save student.");
    }
  };

  const handleDelete = async (id: string) => {
    setStudentToDelete(id);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;
    try {
      await deleteDoc(doc(db, "students", studentToDelete));
      fetchData();
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student.");
    } finally {
      setStudentToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "students", id), { status: newStatus });
      setStudents(students.map(s => s.id === id ? { ...s, status: newStatus as any } : s));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      // Skip header row
      const dataRows = rows.slice(1).filter(row => row.length >= 2);

      setLoading(true);
      try {
        for (const row of dataRows) {
          const [rollNo, name, fatherName, email, phone, courseName, enrollmentDate, status] = row;
          await addDoc(collection(db, "students"), {
            rollNo: rollNo?.trim() || "",
            name: name?.trim() || "",
            fatherName: fatherName?.trim() || "",
            email: email?.trim() || "",
            phone: phone?.trim() || "",
            courseName: courseName?.trim() || "",
            enrollmentDate: enrollmentDate?.trim() || new Date().toISOString().split('T')[0],
            status: (status?.trim() || "Active") as any,
          });
        }
        fetchData();
        alert("CSV Imported Successfully!");
      } catch (error) {
        console.error("Error importing CSV:", error);
        alert("Failed to import CSV.");
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter and Sort Logic
  let processedStudents = students.filter(s => 
    (statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase()) &&
    (s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     s.fatherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.rollNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     s.phone.includes(searchTerm))
  );

  processedStudents.sort((a, b) => {
    if (sortBy === "name") {
      return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    } else {
      return sortOrder === "asc" 
        ? new Date(a.enrollmentDate).getTime() - new Date(b.enrollmentDate).getTime()
        : new Date(b.enrollmentDate).getTime() - new Date(a.enrollmentDate).getTime();
    }
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header Row */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Students</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Upload size={16} /> Import CSV
          </button>
          
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Filters and Sorting Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 flex items-center gap-1 text-sm"><Filter size={14}/> Status:</span>
          {['All', 'Active', 'Completed', 'Dropped'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-[#4f46e5] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-gray-400 flex items-center gap-1 text-sm"><ArrowUpDown size={14}/> Sort:</span>
          <button
            onClick={() => { setSortBy('name'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              sortBy === 'name' ? 'bg-[#4f46e5] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
          <button
            onClick={() => { setSortBy('enrollmentDate'); setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
              sortBy === 'enrollmentDate' ? 'bg-[#4f46e5] text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            Enrollment {sortBy === 'enrollmentDate' && (sortOrder === 'asc' ? '↑' : '↓')}
          </button>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : processedStudents.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No students found matching your criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium whitespace-nowrap">Roll No.</th>
                  <th className="p-4 font-medium whitespace-nowrap">Name</th>
                  <th className="p-4 font-medium whitespace-nowrap">Father's Name</th>
                  <th className="p-4 font-medium whitespace-nowrap">Course</th>
                  <th className="p-4 font-medium whitespace-nowrap">Mobile</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processedStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-900 font-medium">{student.rollNo || '-'}</td>
                    <td className="p-4 text-sm text-gray-900">{student.name}</td>
                    <td className="p-4 text-sm text-gray-600">{student.fatherName || '-'}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-[200px] truncate" title={student.courseName}>
                      {student.courseName || '-'}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{student.phone}</td>
                    <td className="p-4">
                      <div className="relative inline-flex items-center">
                        {student.status === 'Active' && <CheckCircle size={14} className="absolute left-3 text-green-600 pointer-events-none" />}
                        {student.status === 'Completed' && <Award size={14} className="absolute left-3 text-blue-600 pointer-events-none" />}
                        {student.status === 'Dropped' && <XCircle size={14} className="absolute left-3 text-red-600 pointer-events-none" />}
                        <select
                          value={student.status}
                          onChange={(e) => handleStatusChange(student.id, e.target.value)}
                          className={`pl-8 pr-8 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border-0 cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none appearance-none transition-colors ${
                            student.status === 'Active' ? 'bg-green-100 text-green-800 hover:bg-green-200' :
                            student.status === 'Completed' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' :
                            'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                        >
                          <option value="Active" className="bg-white text-gray-900 font-medium">ACTIVE</option>
                          <option value="Completed" className="bg-white text-gray-900 font-medium">COMPLETED</option>
                          <option value="Dropped" className="bg-white text-gray-900 font-medium">DROPPED</option>
                        </select>
                        <div className="absolute right-3 pointer-events-none">
                          <svg className={`w-3 h-3 ${
                            student.status === 'Active' ? 'text-green-600' :
                            student.status === 'Completed' ? 'text-blue-600' :
                            'text-red-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button 
                          onClick={() => handleView(student)}
                          className="hover:text-gray-900 transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button 
                          onClick={() => handleOpenModal(student)}
                          className="hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="hover:text-red-600 transition-colors text-red-400"
                          title="Delete"
                        >
                          <Trash2 size={18} />
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-serif">
                {editingStudent ? "Edit Student" : "Add New Student"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="studentForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Roll No.</label>
                    <input 
                      type="text" 
                      name="rollNo" 
                      value={formData.rollNo} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Father's Name</label>
                    <input 
                      type="text" 
                      name="fatherName" 
                      value={formData.fatherName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Mother's Name</label>
                    <input 
                      type="text" 
                      name="motherName" 
                      value={formData.motherName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Course</label>
                    <select 
                      name="courseName" 
                      value={formData.courseName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="" disabled>Select a course</option>
                      {courses.map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select 
                      name="status" 
                      value={formData.status} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Completed">Completed</option>
                      <option value="Dropped">Dropped</option>
                    </select>
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Enrollment Date</label>
                    <input 
                      type="date" 
                      name="enrollmentDate" 
                      value={formData.enrollmentDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={handleCloseModal}
                className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                form="studentForm"
                className="px-4 py-2 bg-[#4f46e5] text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingStudent ? "Update Student" : "Save Student"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewingStudent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-serif">Student Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Roll No.</p>
                <p className="font-medium text-gray-900">{viewingStudent.rollNo || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium text-gray-900">{viewingStudent.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Father's Name</p>
                <p className="font-medium text-gray-900">{viewingStudent.fatherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Mother's Name</p>
                <p className="font-medium text-gray-900">{viewingStudent.motherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{viewingStudent.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{viewingStudent.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Course</p>
                <p className="font-medium text-gray-900">{viewingStudent.courseName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrollment Date</p>
                <p className="font-medium text-gray-900">{new Date(viewingStudent.enrollmentDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-2">Status</p>
                <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  viewingStudent.status === 'Active' ? 'bg-green-100 text-green-800' :
                  viewingStudent.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {viewingStudent.status === 'Active' && <CheckCircle size={14} className="text-green-600" />}
                  {viewingStudent.status === 'Completed' && <Award size={14} className="text-blue-600" />}
                  {viewingStudent.status === 'Dropped' && <XCircle size={14} className="text-red-600" />}
                  {viewingStudent.status}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 flex justify-end">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!studentToDelete}
        title="Delete Student"
        message="Are you sure you want to delete this student? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setStudentToDelete(null)}
      />
    </div>
  );
}
