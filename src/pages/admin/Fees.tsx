import React, { useState, useEffect } from "react";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Plus, Edit, Trash2, Search, CreditCard, CheckCircle, Clock, X } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseName: string;
  amount: number;
  date: string;
  paymentMethod: "Cash" | "Online" | "Bank Transfer";
  status: "Paid" | "Pending";
  remarks: string;
}

interface Student {
  id: string;
  name: string;
  courseName: string;
}

export function AdminFees() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<FeeRecord | null>(null);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    studentId: "",
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    paymentMethod: "Cash" as "Cash" | "Online" | "Bank Transfer",
    status: "Paid" as "Paid" | "Pending",
    remarks: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [feesSnap, studentsSnap] = await Promise.all([
        getDocs(collection(db, "fees")),
        getDocs(collection(db, "students"))
      ]);
      
      setFees(feesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as FeeRecord[]);
      setStudents(studentsSnap.docs.map(doc => ({ 
        id: doc.id, 
        name: doc.data().name,
        courseName: doc.data().courseName
      })) as Student[]);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (fee?: FeeRecord) => {
    if (fee) {
      setEditingFee(fee);
      setFormData({
        studentId: fee.studentId,
        amount: fee.amount,
        date: fee.date,
        paymentMethod: fee.paymentMethod,
        status: fee.status,
        remarks: fee.remarks || "",
      });
    } else {
      setEditingFee(null);
      setFormData({
        studentId: students.length > 0 ? students[0].id : "",
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        paymentMethod: "Cash",
        status: "Paid",
        remarks: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === "amount" ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const student = students.find(s => s.id === formData.studentId);
      if (!student) return;

      const feeData = {
        ...formData,
        studentName: student.name,
        courseName: student.courseName,
      };

      if (editingFee) {
        await updateDoc(doc(db, "fees", editingFee.id), feeData);
      } else {
        await addDoc(collection(db, "fees"), feeData);
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      console.error("Error saving fee record:", error);
      alert("Failed to save fee record.");
    }
  };

  const handleDelete = async (id: string) => {
    setFeeToDelete(id);
  };

  const confirmDelete = async () => {
    if (!feeToDelete) return;
    try {
      await deleteDoc(doc(db, "fees", feeToDelete));
      fetchData();
    } catch (error) {
      console.error("Error deleting fee record:", error);
      alert("Failed to delete fee record.");
    } finally {
      setFeeToDelete(null);
    }
  };

  const filteredFees = fees.filter(fee => 
    fee.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fee.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Fees Management</h1>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors"
        >
          <Plus size={20} />
          Add Fee Record
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Search by student or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredFees.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CreditCard size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No fee records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600">Date</th>
                  <th className="p-4 font-semibold text-gray-600">Student</th>
                  <th className="p-4 font-semibold text-gray-600">Amount</th>
                  <th className="p-4 font-semibold text-gray-600">Method</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFees.map((fee) => (
                  <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                      {new Date(fee.date).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{fee.studentName}</div>
                      <div className="text-xs text-gray-500">{fee.courseName}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-900">₹{fee.amount.toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {fee.paymentMethod}
                    </td>
                    <td className="p-4">
                      {fee.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle size={12} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <Clock size={12} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      <button 
                        onClick={() => handleOpenModal(fee)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(fee.id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">
                {editingFee ? "Edit Fee Record" : "Add Fee Record"}
              </h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select 
                  name="studentId" 
                  value={formData.studentId} 
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="" disabled>Select Student</option>
                  {students.map(student => (
                    <option key={student.id} value={student.id}>
                      {student.name} ({student.courseName})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <input 
                    type="number" 
                    name="amount" 
                    value={formData.amount} 
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input 
                    type="date" 
                    name="date" 
                    value={formData.date} 
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                  <select 
                    name="paymentMethod" 
                    value={formData.paymentMethod} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Online">Online</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <textarea 
                  name="remarks" 
                  value={formData.remarks} 
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Optional details..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editingFee ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!feeToDelete}
        title="Delete Fee Record"
        message="Are you sure you want to delete this fee record? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setFeeToDelete(null)}
      />
    </div>
  );
}
