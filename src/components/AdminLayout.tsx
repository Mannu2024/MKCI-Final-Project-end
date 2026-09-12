import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { 
  LayoutDashboard, 
  BookOpen, 
  Users, 
  Award, 
  MessageSquare, 
  Image as ImageIcon, 
  MessageCircle,
  LogOut,
  Menu,
  X,
  GraduationCap,
  Layers,
  CreditCard,
  CalendarCheck,
  Settings,
  Download,
  Home,
  PanelLeft
} from "lucide-react";

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/admin/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navItems = [
    { path: "/admin", icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { path: "/admin/students", icon: <Users size={20} />, label: "Students" },
    { path: "/admin/courses", icon: <BookOpen size={20} />, label: "Courses" },
    { path: "/admin/batches", icon: <Layers size={20} />, label: "Batches" },
    { path: "/admin/fees", icon: <CreditCard size={20} />, label: "Fees" },
    { path: "/admin/attendance", icon: <CalendarCheck size={20} />, label: "Attendance" },
    { path: "/admin/certificates", icon: <Award size={20} />, label: "Certificates" },
    { path: "/admin/enquiries", icon: <MessageSquare size={20} />, label: "Enquiries" },
    { path: "/admin/gallery", icon: <ImageIcon size={20} />, label: "Gallery" },
    { path: "/admin/testimonials", icon: <MessageCircle size={20} />, label: "Testimonials" },
    { path: "/admin/content", icon: <Settings size={20} />, label: "Website Content" },
    { path: "/admin/export", icon: <Download size={20} />, label: "Data Export" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      {/* Sidebar */}
      <aside 
        className={`bg-[#0f172a] text-gray-300 w-64 flex-shrink-0 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full absolute h-full z-20"
        } md:relative md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <GraduationCap size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">MKCI Admin</h2>
          <button className="md:hidden ml-auto text-gray-400 hover:text-white" onClick={() => setIsSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 flex flex-col">
          <div className="px-6 mb-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Management</p>
          </div>
          <nav className="flex flex-col gap-1 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? "bg-[#1e293b] text-blue-400 font-medium" 
                      : "hover:bg-[#1e293b] hover:text-white"
                  }`}
                >
                  <div className={`${isActive ? "text-blue-400" : "text-gray-400"}`}>
                    {item.icon}
                  </div>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 flex flex-col gap-2">
          <Link 
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-[#1e293b] hover:text-white transition-colors"
          >
            <Home size={20} className="text-gray-400" />
            View Website
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors w-full text-left"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 gap-4">
          <button 
            className="text-gray-600 hover:text-indigo-600"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <PanelLeft size={24} />
          </button>
          <div className="font-semibold text-gray-800 flex items-center gap-2">
            Admin Panel
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
