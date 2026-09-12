import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  active: boolean;
}

export function HomeGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        // Fetch up to 8 active gallery images
        const q = query(
          collection(db, "gallery"), 
          where("active", "==", true),
          limit(8)
        );
        const querySnapshot = await getDocs(q);
        const galleryData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryImage[];
        setImages(galleryData);
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  if (loading || images.length === 0) return null;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
            Our Gallery
          </h2>
          <p className="text-gray-500 text-lg">
            A glimpse into our campus, events, and student life.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, index) => (
            <motion.div 
              key={img.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all aspect-square bg-gray-100"
            >
              <img 
                src={img.imageUrl || `https://picsum.photos/seed/gallery${img.id}/400/400`} 
                alt={img.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-sm mb-1">{img.title}</h3>
                <p className="text-indigo-300 text-xs font-medium">{img.category}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link 
            to="/gallery"
            className="inline-flex items-center gap-2 text-[#3b4cca] font-semibold hover:text-[#2f3da8] transition-colors"
          >
            View Full Gallery <ChevronRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
