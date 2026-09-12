import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Users, BookOpen, Award, FileText, UserCheck, UserX, TrendingUp } from "lucide-react";

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    completedStudents: 0,
    courses: 0,
    certificates: 0,
    enquiries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsSnap, coursesSnap, certsSnap, enqSnap] = await Promise.all([
          getDocs(collection(db, "students")),
          getDocs(collection(db, "courses")),
          getDocs(collection(db, "certificates")),
          getDocs(collection(db, "enquiries")),
        ]);

        const studentsData = studentsSnap.docs.map(doc => doc.data());
        const active = studentsData.filter(s => s.status === 'Active').length;
        const completed = studentsData.filter(s => s.status === 'Completed').length;

        setStats({
          totalStudents: studentsSnap.size,
          activeStudents: active,
          completedStudents: completed,
          courses: coursesSnap.size,
          certificates: certsSnap.size,
          enquiries: enqSnap.size,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Users size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <p className="text-3xl font-bold text-gray-900 font-serif">{stats.totalStudents}</p>
          </div>
        </div>

        {/* Active Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center">
            <UserCheck size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Active Students</p>
            <p className="text-3xl font-bold text-gray-900 font-serif">{stats.activeStudents}</p>
          </div>
        </div>

        {/* Completed Students */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <UserX size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Completed</p>
            <p className="text-3xl font-bold text-gray-900 font-serif">{stats.completedStudents}</p>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <BookOpen size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Courses</p>
            <p className="text-3xl font-bold text-gray-900 font-serif">{stats.courses}</p>
          </div>
        </div>

        {/* Certificates Issued */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-teal-50 text-teal-500 rounded-xl flex items-center justify-center">
            <Award size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Certificates Issued</p>
            <p className="text-3xl font-bold text-gray-900 font-serif">{stats.certificates}</p>
          </div>
        </div>

        {/* New Enquiries */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
            <FileText size={28} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">New Enquiries</p>
            <p className="text-3xl font-bold text-gray-900 font-serif">{stats.enquiries}</p>
          </div>
        </div>
      </div>

      {/* Real-time Data Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center mt-8">
        <TrendingUp size={48} className="text-blue-400 mb-4" strokeWidth={1.5} />
        <h3 className="text-lg font-bold text-gray-900 font-serif mb-2">Real-time data connected</h3>
        <p className="text-gray-500">All dashboard stats update automatically when data changes.</p>
      </div>
    </div>
  );
}
