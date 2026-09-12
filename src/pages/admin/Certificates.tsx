import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit, Trash2, X, Search, CheckCircle, XCircle } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface Certificate {
  id: string;
  certNo?: string;
  studentName?: string;
  courseName?: string;
  issueDate?: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
  verified: boolean;
}

export function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string; courseName: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [certToDelete, setCertToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    certNo: "",
    studentName: "",
    courseName: "",
    issueDate: new Date().toISOString().split('T')[0],
    grade: "",
    startDate: "",
    endDate: "",
    verified: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certsSnap, studentsSnap] = await Promise.all([
        getDocs(collection(db, "certificates")),
        getDocs(collection(db, "students"))
      ]);
      
      setCertificates(certsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Certificate[]);
      setStudents(studentsSnap.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        courseName: doc.data().courseName
      })));
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (cert?: Certificate) => {
    if (cert) {
      setEditingCert(cert);
      setFormData({
        certNo: cert.certNo || "",
        studentName: cert.studentName || "",
        courseName: cert.courseName || "",
        issueDate: cert.issueDate || "",
        grade: cert.grade || "",
        startDate: cert.startDate || "",
        endDate: cert.endDate || "",
        verified: cert.verified,
      });
    } else {
      setEditingCert(null);
      setFormData({
        certNo: `MKCI-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        studentName: "",
        courseName: "",
        issueDate: new Date().toISOString().split('T')[0],
        grade: "",
        startDate: "",
        endDate: "",
        verified: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCert(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === "studentName") {
      const selectedStudent = students.find(s => s.name === value);
      setFormData(prev => ({ 
        ...prev, 
        studentName: value,
        courseName: selectedStudent ? selectedStudent.courseName : prev.courseName
      }));
    } else if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCert) {
        await updateDoc(doc(db, "certificates", editingCert.id), formData);
      } else {
        await addDoc(collection(db, "certificates"), formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving certificate:", error);
      alert("Failed to save certificate.");
    }
  };

  const handleDelete = async (id: string) => {
    setCertToDelete(id);
  };

  const confirmDelete = async () => {
    if (!certToDelete) return;
    try {
      await deleteDoc(doc(db, "certificates", certToDelete));
      fetchData();
    } catch (error) {
      console.error("Error deleting certificate:", error);
      alert("Failed to delete certificate.");
    } finally {
      setCertToDelete(null);
    }
  };

  const filteredCerts = certificates.filter(c => 
    (c.certNo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
    (c.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Manage Certificates</h1>
        <div className="flex gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search certificates..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            <Plus size={20} /> Generate
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No certificates found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600">Cert No.</th>
                  <th className="p-4 font-semibold text-gray-600">Student Name</th>
                  <th className="p-4 font-semibold text-gray-600">Course</th>
                  <th className="p-4 font-semibold text-gray-600">Issue Date</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-mono font-medium text-indigo-600">{cert.certNo}</td>
                    <td className="p-4 font-medium text-gray-900">{cert.studentName}</td>
                    <td className="p-4 text-gray-600">{cert.courseName}</td>
                    <td className="p-4 text-gray-600">{cert.issueDate}</td>
                    <td className="p-4">
                      {cert.verified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle size={16} /> Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                          <XCircle size={16} /> Unverified
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(cert)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(cert.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
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
              <h2 className="text-xl font-bold text-gray-900">
                {editingCert ? "Edit Certificate" : "Generate Certificate"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="certForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Certificate Number</label>
                    <input 
                      type="text" 
                      name="certNo" 
                      value={formData.certNo} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Student</label>
                    <select 
                      name="studentName" 
                      value={formData.studentName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value="" disabled>Select a student</option>
                      {students.map(s => (
                        <option key={s.id} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Course</label>
                    <input 
                      type="text" 
                      name="courseName" 
                      value={formData.courseName} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Grade</label>
                    <input 
                      type="text" 
                      name="grade" 
                      value={formData.grade} 
                      onChange={handleChange} 
                      placeholder="e.g. A+"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input 
                      type="text" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      placeholder="e.g. Dec. 2022"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input 
                      type="text" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange} 
                      placeholder="e.g. May 2023"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Issue Date (Exact)</label>
                    <input 
                      type="date" 
                      name="issueDate" 
                      value={formData.issueDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 flex items-center mt-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        name="verified" 
                        checked={formData.verified} 
                        onChange={handleChange} 
                        className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Verified & Active</span>
                    </label>
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
                form="certForm"
                className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingCert ? "Update Certificate" : "Generate Certificate"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!certToDelete}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setCertToDelete(null)}
      />
    </div>
  );
}
