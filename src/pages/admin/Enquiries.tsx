import { useState, useEffect } from "react";
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Trash2, Search, Mail, Phone, Calendar, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { ConfirmModal } from "../../components/ConfirmModal";

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string;
  date: string;
  status: "pending" | "resolved";
}

export function AdminEnquiries() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [enquiryToDelete, setEnquiryToDelete] = useState<string | null>(null);

  const fetchEnquiries = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "enquiries"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      const enqData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Enquiry[];
      setEnquiries(enqData);
    } catch (err) {
      console.error("Failed to fetch enquiries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: "pending" | "resolved") => {
    try {
      await updateDoc(doc(db, "enquiries", id), { status: newStatus });
      fetchEnquiries();
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    setEnquiryToDelete(id);
  };

  const confirmDelete = async () => {
    if (!enquiryToDelete) return;
    try {
      await deleteDoc(doc(db, "enquiries", enquiryToDelete));
      fetchEnquiries();
    } catch (error) {
      console.error("Error deleting enquiry:", error);
      alert("Failed to delete enquiry.");
    } finally {
      setEnquiryToDelete(null);
    }
  };

  const isEmailConfigured = 
    import.meta.env.VITE_EMAILJS_SERVICE_ID && 
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID && 
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
      </div>

      {!isEmailConfigured && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="text-amber-800 font-semibold text-sm">Email Notifications Not Configured</h3>
            <p className="text-amber-700 text-xs mt-1">
              To receive email notifications for new enquiries, please configure your EmailJS credentials in the environment variables:
              <code className="bg-amber-100 px-1 py-0.5 rounded mx-1">VITE_EMAILJS_SERVICE_ID</code>, 
              <code className="bg-amber-100 px-1 py-0.5 rounded mx-1">VITE_EMAILJS_TEMPLATE_ID</code>, and 
              <code className="bg-amber-100 px-1 py-0.5 rounded mx-1">VITE_EMAILJS_PUBLIC_KEY</code>.
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No enquiries found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 font-semibold text-gray-600">Date & Time</th>
                  <th className="p-4 font-semibold text-gray-600">Contact Details</th>
                  <th className="p-4 font-semibold text-gray-600">Course Interest</th>
                  <th className="p-4 font-semibold text-gray-600">Message</th>
                  <th className="p-4 font-semibold text-gray-600">Status</th>
                  <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(enquiry.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(enquiry.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{enquiry.name}</div>
                      <div className="text-sm text-gray-500">{enquiry.phone}</div>
                      <div className="text-sm text-gray-500">{enquiry.email}</div>
                    </td>
                    <td className="p-4 text-gray-600">
                      {enquiry.course ? (
                        <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">
                          {enquiry.course}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">Not specified</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-600 text-sm max-w-xs">
                      <p className="truncate" title={enquiry.message}>{enquiry.message}</p>
                    </td>
                    <td className="p-4">
                      {enquiry.status === 'resolved' ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle size={16} /> Resolved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                          <Clock size={16} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4 flex justify-end gap-2">
                      {enquiry.status === 'pending' ? (
                        <button 
                          onClick={() => handleStatusChange(enquiry.id, 'resolved')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Mark as Resolved"
                        >
                          <CheckCircle size={18} />
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleStatusChange(enquiry.id, 'pending')}
                          className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title="Mark as Pending"
                        >
                          <Clock size={18} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(enquiry.id)}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal 
        isOpen={!!enquiryToDelete}
        title="Delete Enquiry"
        message="Are you sure you want to delete this enquiry? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setEnquiryToDelete(null)}
      />
    </div>
  );
}
