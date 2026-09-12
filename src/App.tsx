import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Courses } from "./pages/Courses";
import { Gallery } from "./pages/Gallery";
import { Contact } from "./pages/Contact";
import { Verify } from "./pages/Verify";

// Admin Imports
import { AdminLogin } from "./pages/admin/Login";
import { AdminLayout } from "./components/AdminLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminCourses } from "./pages/admin/Courses";
import { AdminStudents } from "./pages/admin/Students";
import { AdminBatches } from "./pages/admin/Batches";
import { AdminFees } from "./pages/admin/Fees";
import { AdminAttendance } from "./pages/admin/Attendance";
import { AdminCertificates } from "./pages/admin/Certificates";
import { AdminEnquiries } from "./pages/admin/Enquiries";
import { AdminGallery } from "./pages/admin/Gallery";
import { AdminWebsiteContent } from "./pages/admin/WebsiteContent";
import { AdminDataExport } from "./pages/admin/DataExport";
import { AdminTestimonials } from "./pages/admin/Testimonials";

// Placeholder for new admin pages
function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500">This module is currently under development.</p>
    </div>
  );
}

// Layout wrapper for public pages
function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/courses" element={<PublicLayout><Courses /></PublicLayout>} />
        <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/verify" element={<PublicLayout><Verify /></PublicLayout>} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="batches" element={<AdminBatches />} />
          <Route path="fees" element={<AdminFees />} />
          <Route path="attendance" element={<AdminAttendance />} />
          <Route path="certificates" element={<AdminCertificates />} />
          <Route path="enquiries" element={<AdminEnquiries />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="content" element={<AdminWebsiteContent />} />
          <Route path="export" element={<AdminDataExport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
