import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface Course {
  id: string;
  name: string;
  category: string;
  duration: string;
  fees: string;
  description: string;
  eligibility: string;
}

export function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    duration: "",
    fees: "",
    description: "",
    eligibility: "",
  });

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "courses"));
      const coursesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Course[];
      setCourses(coursesData);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleOpenModal = (course?: Course) => {
    if (course) {
      setEditingCourse(course);
      setFormData({
        name: course.name,
        category: course.category,
        duration: course.duration,
        fees: course.fees,
        description: course.description,
        eligibility: course.eligibility,
      });
    } else {
      setEditingCourse(null);
      setFormData({
        name: "",
        category: "",
        duration: "",
        fees: "",
        description: "",
        eligibility: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCourse(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), formData);
      } else {
        await addDoc(collection(db, "courses"), formData);
      }
      handleCloseModal();
      fetchCourses();
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course.");
    }
  };

  const handleDelete = async (id: string) => {
    setCourseToDelete(id);
  };

  const confirmDelete = async () => {
    if (!courseToDelete) return;
    try {
      await deleteDoc(doc(db, "courses", courseToDelete));
      fetchCourses();
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course.");
    } finally {
      setCourseToDelete(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Courses</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* Courses Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No courses found. Add one to get started.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium whitespace-nowrap">Name</th>
                  <th className="p-4 font-medium whitespace-nowrap">Category</th>
                  <th className="p-4 font-medium whitespace-nowrap">Duration</th>
                  <th className="p-4 font-medium whitespace-nowrap">Fees</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-900 font-medium max-w-[300px]">{course.name}</td>
                    <td className="p-4 text-sm text-gray-600">{course.category}</td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{course.duration}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-[250px]">{course.fees}</td>
                    <td className="p-4">
                      <div className="flex flex-col items-end gap-3 text-gray-400">
                        <button 
                          onClick={() => handleOpenModal(course)}
                          className="hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(course.id)}
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
                {editingCourse ? "Edit Course" : "Add New Course"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Course Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Category</label>
                    <input 
                      type="text" 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g., Programming, Design"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Duration</label>
                    <input 
                      type="text" 
                      name="duration" 
                      value={formData.duration} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g., 6 Months"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Fees</label>
                    <input 
                      type="text" 
                      name="fees" 
                      value={formData.fees} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g., ₹5000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Eligibility</label>
                    <input 
                      type="text" 
                      name="eligibility" 
                      value={formData.eligibility} 
                      onChange={handleChange} 
                      required 
                      placeholder="e.g., 10th Pass"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Description</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required 
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    ></textarea>
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
                form="courseForm"
                className="px-4 py-2 bg-[#4f46e5] text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingCourse ? "Update Course" : "Save Course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!courseToDelete}
        title="Delete Course"
        message="Are you sure you want to delete this course? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setCourseToDelete(null)}
      />
    </div>
  );
}
