import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Clock, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { collection, getDocs, limit, query } from "firebase/firestore";
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

export function HomeCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Fetch up to 6 courses for the home page
        const q = query(collection(db, "courses"), limit(6));
        const querySnapshot = await getDocs(q);
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

  if (loading || courses.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Popular Courses
          </h2>
          <p className="text-gray-500 text-lg">
            Explore our most sought-after computer courses designed to build your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-[#f8fafc] rounded-xl p-6 shadow-sm border border-gray-100 flex flex-col"
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

        <div className="text-center mt-12">
          <Link 
            to="/courses"
            className="inline-flex items-center gap-2 text-[#3b4cca] font-semibold hover:text-[#2f3da8] transition-colors"
          >
            View All Courses <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
