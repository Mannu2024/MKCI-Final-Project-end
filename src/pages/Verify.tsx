import React, { useState } from "react";
import { CheckCircle, XCircle, User, Hash, Download } from "lucide-react";
import { motion } from "motion/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface CertificateDetails {
  certNo?: string;
  issueDate?: string;
  verified: boolean;
  studentName?: string;
  courseName?: string;
  grade?: string;
  startDate?: string;
  endDate?: string;
}

interface StudentDetails {
  rollNo?: string;
  name?: string;
  fatherName?: string;
  motherName?: string;
}

export function Verify() {
  const [rollNo, setRollNo] = useState("");
  const [studentName, setStudentName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{cert: CertificateDetails, student: StudentDetails} | null>(null);
  const [error, setError] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo.trim() || !studentName.trim() || !fatherName.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      // Fetch all students (since we need case-insensitive match, and rollNo might not be perfectly indexed if optional)
      // Alternatively, query by rollNo exactly:
      const studentQ = query(collection(db, "students"), where("rollNo", "==", rollNo.trim()));
      const studentSnap = await getDocs(studentQ);
      
      let matchedStudentData: StudentDetails | null = null;

      if (!studentSnap.empty) {
        // Roll no matched. Now check name and fatherName case-insensitively
        for (const doc of studentSnap.docs) {
          const data = doc.data() as StudentDetails;
          const dbName = (data.name || "").toLowerCase().trim();
          const dbFather = (data.fatherName || "").toLowerCase().trim();
          
          if (
            dbName === studentName.toLowerCase().trim() && 
            dbFather === fatherName.toLowerCase().trim()
          ) {
            matchedStudentData = data;
            break;
          }
        }
      } else {
        // If rollNo query fails, fallback to fetching all students and checking manually (in case of case issues in rollNo)
        const allStudentsSnap = await getDocs(collection(db, "students"));
        for (const doc of allStudentsSnap.docs) {
          const data = doc.data() as StudentDetails;
          const dbRoll = (data.rollNo || "").toLowerCase().trim();
          const dbName = (data.name || "").toLowerCase().trim();
          const dbFather = (data.fatherName || "").toLowerCase().trim();
          
          if (
            dbRoll === rollNo.toLowerCase().trim() &&
            dbName === studentName.toLowerCase().trim() && 
            dbFather === fatherName.toLowerCase().trim()
          ) {
            matchedStudentData = data;
            break;
          }
        }
      }
      
      if (!matchedStudentData) {
        setError("Could not find a matching student record. Please check your Roll Number, Name, and Father's Name.");
        setLoading(false);
        return;
      }

      // 3. Find the certificate for this student
      const certQ = query(collection(db, "certificates"), where("studentName", "==", matchedStudentData.name));
      const certSnap = await getDocs(certQ);
      
      let matchedCertData: CertificateDetails | null = null;
      if (!certSnap.empty) {
        matchedCertData = certSnap.docs[0].data() as CertificateDetails;
      } else {
        // Try fetching all certs and matching case-insensitively
        const allCertsSnap = await getDocs(collection(db, "certificates"));
        for (const doc of allCertsSnap.docs) {
          const data = doc.data() as CertificateDetails;
          if ((data.studentName || "").toLowerCase().trim() === (matchedStudentData.name || "").toLowerCase().trim()) {
            matchedCertData = data;
            break;
          }
        }
      }

      if (matchedCertData) {
        if (!matchedCertData.verified) {
           setError("Certificate exists but is not marked as verified.");
        } else {
           setResult({ cert: matchedCertData, student: matchedStudentData });
        }
      } else {
        setError("No certificate has been issued for this student yet.");
      }
    } catch (err) {
      console.error("Verification error:", err);
      setError("An error occurred while verifying. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page Header */}
      <section className="bg-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Verify Student Certificate</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Enter your details below to verify your student record and view your official certificate.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 flex-grow">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 mb-12"
          >
            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Roll Number" 
                    className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-lg transition-all"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Student Name" 
                    className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-lg transition-all"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
                  <input 
                    type="text" 
                    placeholder="Father's Name" 
                    className="w-full pl-14 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 text-lg transition-all"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                  />
                </div>
              </div>
              <button 
                type="submit" 
                disabled={loading || !rollNo.trim() || !studentName.trim() || !fatherName.trim()}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center w-full"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  "Verify Record"
                )}
              </button>
            </form>
          </motion.div>

          {/* Results Area */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex items-center gap-4 max-w-3xl mx-auto mb-12"
            >
              <XCircle size={32} className="text-red-500 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-lg mb-1">Verification Failed</h3>
                <p>{error}</p>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <div className="bg-green-50 text-green-800 px-6 py-3 rounded-full font-bold flex items-center gap-2 mb-8 border border-green-200">
                <CheckCircle size={20} className="text-green-600" />
                Successfully Verified Record
              </div>

              {/* Professional Certificate Design */}
              <div className="w-full overflow-x-auto pb-8">
                <div className="min-w-[800px] max-w-[1000px] mx-auto bg-white p-2 shadow-2xl relative" style={{aspectRatio: '1.414/1'}}>
                  <div className="w-full h-full border-[12px] border-double border-[#2c3e50] p-8 relative flex flex-col items-center text-center">
                    
                    {/* Top Labels */}
                    <div className="w-full flex justify-between text-xs font-semibold text-gray-600 mb-6 font-serif">
                      <span>Enrollment No. {result.certNo || "N/A"}</span>
                      <span>Regd. No. {result.certNo || "N/A"}</span>
                    </div>

                    {/* Institute Title */}
                    <h1 className="text-4xl sm:text-5xl font-bold text-[#1e3a8a] mb-4 font-serif" style={{ fontFamily: 'Georgia, serif' }}>
                      Maa Kamakhya Computer Institute
                    </h1>

                    {/* Logo Placeholder */}
                    <div className="w-20 h-20 bg-blue-50 rounded-full border border-blue-200 flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full border border-blue-300 flex flex-col items-center justify-center">
                        <span className="text-[10px] font-bold text-blue-900 leading-tight">MKCI</span>
                      </div>
                    </div>

                    {/* Subtitle */}
                    <div className="text-sm font-medium text-gray-800 mb-8 max-w-lg font-serif uppercase tracking-wide">
                      UNDER THE AEGIS OF MAA KAMAKHYA SEWA SANSTHAN<br/>
                      <span className="text-xs text-gray-600 font-normal normal-case block mt-1">Ballu Ka Dera, Rampur, Mungari, Prayagraj</span>
                      <span className="text-xs text-gray-600 font-normal normal-case block">Mob.: 8630388963, 9580352424</span>
                    </div>

                    {/* Certificate Body */}
                    <div className="w-full text-base sm:text-lg text-gray-800 leading-relaxed font-serif space-y-6 flex-grow">
                      
                      <div className="flex items-end justify-center gap-2">
                        <span>This is to certify that Mr./Mrs./Miss</span>
                        <span className="flex-1 border-b border-black font-bold text-xl px-4 text-center inline-block min-w-[250px] uppercase">
                          {result.student.name || "-"}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end justify-center gap-4">
                        <div className="flex items-end flex-1 w-full gap-2">
                          <span className="whitespace-nowrap">S/O, D/O -</span>
                          <span className="flex-1 border-b border-black font-bold text-lg px-2 text-center uppercase min-w-[150px]">
                            {result.student.fatherName || "-"}
                          </span>
                        </div>
                        <div className="flex items-end flex-1 w-full gap-2">
                          <span className="whitespace-nowrap">M/O</span>
                          <span className="flex-1 border-b border-black font-bold text-lg px-2 text-center uppercase min-w-[150px]">
                            {result.student.motherName || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-center gap-2">
                        <span className="whitespace-nowrap">has been Completed</span>
                        <span className="flex-1 border-b border-black font-bold text-lg px-4 text-center uppercase min-w-[300px]">
                          {result.cert.courseName || "-"}
                        </span>
                      </div>

                      <div className="flex items-end justify-center gap-4">
                        <div className="flex items-end gap-2">
                          <span className="whitespace-nowrap">with placed in grade</span>
                          <span className="border-b border-black font-bold text-lg px-4 text-center min-w-[60px]">
                            {result.cert.grade ? `'${result.cert.grade}'` : "-"}
                          </span>
                        </div>
                        <div className="flex items-end gap-2">
                          <span className="whitespace-nowrap">Roll No.</span>
                          <span className="border-b border-black font-bold text-lg px-4 text-center min-w-[100px]">
                            {result.student.rollNo || "-"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-end justify-center gap-2 pt-2">
                        <span className="whitespace-nowrap">This course was conducted in Naini Prayagraj from</span>
                        <span className="border-b border-black font-bold text-base px-2 text-center min-w-[100px]">
                          {result.cert.startDate || "-"}
                        </span>
                        <span className="whitespace-nowrap">to</span>
                        <span className="border-b border-black font-bold text-base px-2 text-center min-w-[100px]">
                          {result.cert.endDate || "-"}
                        </span>
                      </div>

                    </div>

                    {/* Signatures */}
                    <div className="w-full flex justify-between items-end mt-12 px-8 font-serif">
                      <div className="text-center w-40">
                        <div className="h-12 flex items-center justify-center text-2xl text-blue-900 border-b border-gray-400" style={{fontFamily: 'cursive'}}>
                          Anoop Kumar
                        </div>
                        <span className="text-sm font-semibold mt-1 block">Director</span>
                      </div>
                      
                      <div className="text-center">
                        <span className="text-sm font-semibold block">Date: {result.cert.issueDate ? new Date(result.cert.issueDate).toLocaleDateString('en-IN') : "-"}</span>
                      </div>

                      <div className="text-center w-40">
                        <div className="h-12 flex items-center justify-center text-2xl text-blue-900 border-b border-gray-400" style={{fontFamily: 'cursive'}}>
                          Kamakhya Prasad
                        </div>
                        <span className="text-sm font-semibold mt-1 block">Managing Director</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="w-full text-center text-[10px] sm:text-xs text-gray-500 mt-6 bg-gray-100 py-1 font-serif">
                      Explanation of Grade : A+ = Above 90%, A=Above 80%, B+ = Above 70%, B = Above 60%, C= Above 50%
                    </div>

                  </div>
                </div>
              </div>
              
              <button className="mt-4 bg-white border border-gray-200 text-gray-700 px-6 py-2 rounded-lg font-medium shadow-sm flex items-center gap-2 hover:bg-gray-50 transition-colors" onClick={() => window.print()}>
                <Download size={18} /> Print Certificate
              </button>

            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}

