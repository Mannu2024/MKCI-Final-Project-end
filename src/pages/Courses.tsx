import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Course {
  id: string;
  name: string;
  category: string;
  duration: string;
  fees: string;
  description: string;
  eligibility: string;
}

export function Courses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchCourses = async () => {
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

    fetchCourses();
  }, []);

  const categories = ["All", ...Array.from(new Set(courses.map((c) => c.category)))];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-[#f4f6f9]">
      {/* Page Header */}
      <section className="pt-16 pb-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-900 font-serif mb-4">Our Courses</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Explore our comprehensive range of professional computer courses
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors border ${
                  selectedCategory === category 
                    ? "bg-[#3b4cca] text-white border-[#3b4cca]" 
                    : "bg-transparent text-gray-600 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3b4cca]"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course, index) => (
                <motion.div 
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col"
                >
                  <div className="mb-4">
                    <span className="inline-block bg-[#eef2ff] text-[#3b4cca] px-3 py-1 rounded-full text-xs font-medium mb-4">
                      {course.category}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 font-serif mb-3 leading-tight">{course.name}</h3>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-3">
                      {course.description}
                    </p>
                  </div>
                  
                  <div className="mt-auto space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={16} />
                      <span>Duration: {course.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <BookOpen size={16} />
                      <span>Eligibility: {course.eligibility}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-sm font-bold text-[#3b4cca]">
                        Fees: {course.fees}
                      </span>
                    </div>
                  </div>
                  
                  <Link 
                    to={`/contact?course=${encodeURIComponent(course.name)}`}
                    className="w-full bg-[#3b4cca] text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2f3da8] transition-colors text-sm"
                  >
                    Enquire Now <ChevronRight size={16} />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500">Try adjusting your filters.</p>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedCategory("All"); }}
                className="mt-6 text-[#3b4cca] font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
