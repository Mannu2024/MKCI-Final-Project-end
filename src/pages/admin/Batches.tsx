import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit, Trash2, X, Search, Layers } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface Batch {
  id: string;
  name: string;
  courseName: string;
  startDate: string;
  endDate: string;
  status: "Upcoming" | "Ongoing" | "Completed";
}

export function AdminBatches() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [batchToDelete, setBatchToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    courseName: "",
    startDate: "",
    endDate: "",
    status: "Upcoming" as "Upcoming" | "Ongoing" | "Completed",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [batchesSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, "batches")),
        getDocs(collection(db, "courses"))
      ]);
      
      setBatches(batchesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Batch[]);
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

  const handleOpenModal = (batch?: Batch) => {
    if (batch) {
      setEditingBatch(batch);
      setFormData({
        name: batch.name,
        courseName: batch.courseName,
        startDate: batch.startDate,
        endDate: batch.endDate,
        status: batch.status,
      });
    } else {
      setEditingBatch(null);
      setFormData({
        name: "",
        courseName: courses.length > 0 ? courses[0].name : "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        status: "Upcoming",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBatch(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBatch) {
        await updateDoc(doc(db, "batches", editingBatch.id), formData);
      } else {
        await addDoc(collection(db, "batches"), formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving batch:", error);
      alert("Failed to save batch.");
    }
  };

  const handleDelete = async (id: string) => {
    setBatchToDelete(id);
  };

  const confirmDelete = async () => {
    if (!batchToDelete) return;
    try {
      await deleteDoc(doc(db, "batches", batchToDelete));
      fetchData();
    } catch (error) {
      console.error("Error deleting batch:", error);
      alert("Failed to delete batch.");
    } finally {
      setBatchToDelete(null);
    }
  };

  const filteredBatches = batches.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Batch Management</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search batches..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus size={16} /> Add Batch
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No batches found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium whitespace-nowrap">Batch Name</th>
                  <th className="p-4 font-medium whitespace-nowrap">Course</th>
                  <th className="p-4 font-medium whitespace-nowrap">Start Date</th>
                  <th className="p-4 font-medium whitespace-nowrap">End Date</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBatches.map((batch) => (
                  <tr key={batch.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-900 font-medium flex items-center gap-2">
                      <Layers size={16} className="text-indigo-500" />
                      {batch.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600">{batch.courseName}</td>
                    <td className="p-4 text-sm text-gray-600">{new Date(batch.startDate).toLocaleDateString()}</td>
                    <td className="p-4 text-sm text-gray-600">{batch.endDate ? new Date(batch.endDate).toLocaleDateString() : '-'}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium lowercase ${
                        batch.status === 'Ongoing' ? 'bg-green-100 text-green-700' :
                        batch.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {batch.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button 
                          onClick={() => handleOpenModal(batch)}
                          className="hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(batch.id)}
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
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 font-serif">
                {editingBatch ? "Edit Batch" : "Add New Batch"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="batchForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Batch Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. Morning Batch 2024"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <select 
                    name="courseName" 
                    value={formData.courseName} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" disabled>Select a course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                    <input 
                      type="date" 
                      name="startDate" 
                      value={formData.startDate} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">End Date</label>
                    <input 
                      type="date" 
                      name="endDate" 
                      value={formData.endDate} 
                      onChange={handleChange} 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
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
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
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
                form="batchForm"
                className="px-4 py-2 bg-[#4f46e5] text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingBatch ? "Update Batch" : "Save Batch"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!batchToDelete}
        title="Delete Batch"
        message="Are you sure you want to delete this batch? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setBatchToDelete(null)}
      />
    </div>
  );
}
