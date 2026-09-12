import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit, Trash2, X, Search, Star, MessageCircle } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface Testimonial {
  id: string;
  name: string;
  course: string;
  feedback: string;
  rating: number;
  active: boolean;
}

export function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [courses, setCourses] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialToDelete, setTestimonialToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    course: "",
    feedback: "",
    rating: 5,
    active: true,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [testimonialsSnap, coursesSnap] = await Promise.all([
        getDocs(collection(db, "testimonials")),
        getDocs(collection(db, "courses"))
      ]);
      
      setTestimonials(testimonialsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Testimonial[]);
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

  const handleOpenModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setFormData({
        name: testimonial.name,
        course: testimonial.course,
        feedback: testimonial.feedback,
        rating: testimonial.rating || 5,
        active: testimonial.active !== false,
      });
    } else {
      setEditingTestimonial(null);
      setFormData({
        name: "",
        course: courses.length > 0 ? courses[0].name : "",
        feedback: "",
        rating: 5,
        active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTestimonial(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "rating") {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await updateDoc(doc(db, "testimonials", editingTestimonial.id), formData);
      } else {
        await addDoc(collection(db, "testimonials"), formData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving testimonial:", error);
      alert("Failed to save testimonial.");
    }
  };

  const handleDelete = async (id: string) => {
    setTestimonialToDelete(id);
  };

  const confirmDelete = async () => {
    if (!testimonialToDelete) return;
    try {
      await deleteDoc(doc(db, "testimonials", testimonialToDelete));
      fetchData();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      alert("Failed to delete testimonial.");
    } finally {
      setTestimonialToDelete(null);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "testimonials", id), { active: !currentStatus });
      setTestimonials(testimonials.map(t => t.id === id ? { ...t, active: !currentStatus } : t));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const filteredTestimonials = testimonials.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.course.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.feedback.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 font-serif">Testimonials</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search testimonials..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            />
          </div>
          
          <button 
            onClick={() => handleOpenModal()}
            className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
          >
            <Plus size={16} /> Add Testimonial
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No testimonials found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-sm">
                  <th className="p-4 font-medium whitespace-nowrap">Student Name</th>
                  <th className="p-4 font-medium whitespace-nowrap">Course</th>
                  <th className="p-4 font-medium">Feedback</th>
                  <th className="p-4 font-medium whitespace-nowrap">Rating</th>
                  <th className="p-4 font-medium whitespace-nowrap">Status</th>
                  <th className="p-4 font-medium text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTestimonials.map((testimonial) => (
                  <tr key={testimonial.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-900 font-medium flex items-center gap-2">
                      <MessageCircle size={16} className="text-indigo-500" />
                      {testimonial.name}
                    </td>
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{testimonial.course}</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={testimonial.feedback}>
                      {testimonial.feedback}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} fill={i < (testimonial.rating || 5) ? "currentColor" : "none"} className={i >= (testimonial.rating || 5) ? "text-gray-300" : ""} />
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(testimonial.id, testimonial.active !== false)}
                        className={`px-3 py-1 rounded-full text-xs font-medium lowercase transition-colors ${
                          testimonial.active !== false ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {testimonial.active !== false ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-3 text-gray-400">
                        <button 
                          onClick={() => handleOpenModal(testimonial)}
                          className="hover:text-gray-900 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(testimonial.id)}
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
                {editingTestimonial ? "Edit Testimonial" : "Add Testimonial"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <form id="testimonialForm" onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Student Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Course</label>
                  <select 
                    name="course" 
                    value={formData.course} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="" disabled>Select a course</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Rating (1-5)</label>
                  <input 
                    type="number" 
                    name="rating" 
                    min="1"
                    max="5"
                    value={formData.rating} 
                    onChange={handleChange} 
                    required 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">Feedback</label>
                  <textarea 
                    name="feedback" 
                    value={formData.feedback} 
                    onChange={handleChange} 
                    required 
                    rows={4}
                    placeholder="Student's review or feedback..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  ></textarea>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input 
                    type="checkbox" 
                    id="active"
                    name="active" 
                    checked={formData.active} 
                    onChange={handleChange} 
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Show on website
                  </label>
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
                form="testimonialForm"
                className="px-4 py-2 bg-[#4f46e5] text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                {editingTestimonial ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!testimonialToDelete}
        title="Delete Testimonial"
        message="Are you sure you want to delete this testimonial? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setTestimonialToDelete(null)}
      />
    </div>
  );
}
