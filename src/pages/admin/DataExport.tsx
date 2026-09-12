import React, { useState } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { 
  Download, 
  Users, 
  BookOpen, 
  Layers, 
  CreditCard, 
  CalendarCheck, 
  Award, 
  MessageSquare,
  Calendar
} from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

export function AdminDataExport() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState<string | null>(null);

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return "";
    
    // Get all unique headers
    const headersSet = new Set<string>();
    data.forEach(row => Object.keys(row).forEach(key => headersSet.add(key)));
    const headers = Array.from(headersSet);

    const rows = data.map(row => 
      headers.map(header => {
        let val = row[header];
        if (val === null || val === undefined) val = "";
        else if (val instanceof Timestamp) val = val.toDate().toISOString();
        else if (typeof val === 'object') val = JSON.stringify(val);
        else val = String(val);
        
        // Escape quotes
        val = val.replace(/"/g, '""');
        // Wrap in quotes if contains comma, newline, or quotes
        if (val.includes(',') || val.includes('\n') || val.includes('"')) {
          val = `"${val}"`;
        }
        return val;
      }).join(",")
    );
    return [headers.join(","), ...rows].join("\n");
  };

  const fetchData = async (collectionName: string) => {
    let q = collection(db, collectionName);
    
    // If date range is selected, try to filter by a common date field if it exists
    // Note: This is a simplified approach. In a real app, you'd need to know the exact date field for each collection.
    // For this example, we'll fetch all and filter client-side if needed, or just fetch all.
    // To keep it simple and robust, we'll fetch all and let the user filter in Excel, 
    // or we can filter by 'createdAt' or 'date' if those fields exist.
    
    const snapshot = await getDocs(q);
    let data: any[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Client-side date filtering (assuming 'createdAt' or 'date' or 'enrollmentDate' fields)
    if (fromDate || toDate) {
      const from = fromDate ? new Date(fromDate).getTime() : 0;
      const to = toDate ? new Date(toDate).getTime() + 86400000 : Infinity; // Add 1 day to include the end date fully

      data = data.filter(item => {
        let itemDate = 0;
        if (item.createdAt) itemDate = new Date(item.createdAt).getTime();
        else if (item.date) itemDate = new Date(item.date).getTime();
        else if (item.enrollmentDate) itemDate = new Date(item.enrollmentDate).getTime();
        else return true; // If no date field, include it

        return itemDate >= from && itemDate <= to;
      });
    }

    return data;
  };

  const handleExportCSV = async (collectionName: string, fileName: string) => {
    setExporting(collectionName);
    try {
      const data = await fetchData(collectionName);
      if (data.length === 0) {
        alert(`No data found for ${fileName} in the selected date range.`);
        return;
      }
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      saveAs(blob, `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error(`Error exporting ${collectionName}:`, error);
      alert(`Failed to export ${fileName}.`);
    } finally {
      setExporting(null);
    }
  };

  const handleExportAll = async () => {
    setExporting("all");
    try {
      const zip = new JSZip();
      
      for (const card of exportCards) {
        const data = await fetchData(card.collection);
        if (data.length > 0) {
          const csv = convertToCSV(data);
          zip.file(`${card.title}_${new Date().toISOString().split('T')[0]}.csv`, csv);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `MKCI_All_Data_${new Date().toISOString().split('T')[0]}.zip`);
    } catch (error) {
      console.error("Error exporting all data:", error);
      alert("Failed to export all data.");
    } finally {
      setExporting(null);
    }
  };

  const exportCards = [
    {
      title: "Students",
      description: "All student records with personal details, course & batch info",
      icon: Users,
      collection: "students",
    },
    {
      title: "Courses",
      description: "All courses with duration, fees, and category details",
      icon: BookOpen,
      collection: "courses",
    },
    {
      title: "Batches",
      description: "All batches with start/end dates and status",
      icon: Layers,
      collection: "batches",
    },
    {
      title: "Payments",
      description: "All payment records with amounts, mode, and references",
      icon: CreditCard,
      collection: "payments",
    },
    {
      title: "Attendance",
      description: "All attendance records with dates and status",
      icon: CalendarCheck,
      collection: "attendance",
    },
    {
      title: "Certificates",
      description: "All issued certificates with verification details",
      icon: Award,
      collection: "certificates",
    },
    {
      title: "Enquiries",
      description: "All enquiries with contact info and status",
      icon: MessageSquare,
      collection: "enquiries",
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-serif">Data Export</h1>
          <p className="text-gray-500 text-sm mt-1">
            Download your data as CSV files compatible with Excel, Google Sheets, etc.
          </p>
        </div>
        <button
          onClick={handleExportAll}
          disabled={exporting !== null}
          className="bg-[#3b4cca] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#2a389e] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 whitespace-nowrap"
        >
          {exporting === "all" ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Download size={18} />
          )}
          Export All as ZIP
        </button>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4">
        <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Date Range:</span>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4cca] w-full bg-gray-50"
              placeholder="From date"
            />
          </div>
          <span className="text-gray-500 text-sm">to</span>
          <div className="relative flex-1 sm:flex-none">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar size={16} className="text-gray-400" />
            </div>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3b4cca] w-full bg-gray-50"
              placeholder="To date"
            />
          </div>
        </div>
      </div>

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportCards.map((card, index) => {
          const Icon = card.icon;
          const isExportingThis = exporting === card.collection;
          
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-[#eef2ff] text-[#3b4cca] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-gray-900 font-serif text-lg">{card.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-6 flex-grow">
                {card.description}
              </p>
              <button
                onClick={() => handleExportCSV(card.collection, card.title)}
                disabled={exporting !== null}
                className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm disabled:opacity-70"
              >
                {isExportingThis ? (
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Download size={16} />
                )}
                Export CSV
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
