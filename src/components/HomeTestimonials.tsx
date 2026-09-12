import React, { useState, useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { motion } from "motion/react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Testimonial {
  id: string;
  name: string;
  course: string;
  feedback: string;
  rating: number;
}

export function HomeTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const q = query(collection(db, "testimonials"), where("active", "==", true));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Testimonial[];
        setTestimonials(data);
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-20 bg-[#f4f6f9]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            What Our Students Say
          </h2>
          <p className="text-gray-500 text-lg">
            Read about the experiences and success stories of our students.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div 
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative flex flex-col h-full"
            >
              <Quote className="absolute top-6 right-6 text-indigo-50" size={64} />
              <div className="flex gap-1 mb-6 text-amber-400 relative z-10">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={18} 
                    fill={i < (testimonial.rating || 5) ? "currentColor" : "none"} 
                    className={i >= (testimonial.rating || 5) ? "text-gray-300" : ""} 
                  />
                ))}
              </div>
              <p className="text-gray-600 leading-relaxed mb-8 relative z-10 italic flex-grow">
                "{testimonial.feedback}"
              </p>
              <div className="mt-auto relative z-10 flex items-center gap-4 border-t border-gray-50 pt-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                  {testimonial.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 font-serif text-sm">{testimonial.name}</h4>
                  <p className="text-xs text-indigo-600 font-medium">{testimonial.course}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
