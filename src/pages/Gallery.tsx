import { useState, useEffect } from "react";
import { CTA } from "../components/CTA";
import { motion } from "motion/react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

interface GalleryImage {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  active: boolean;
}

export function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "gallery"));
        const galleryData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as GalleryImage[];
        setImages(galleryData.filter((img) => img.active !== false)); // Default to true if missing
      } catch (err) {
        console.error("Failed to fetch gallery:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const categories = ["All", ...Array.from(new Set(images.map((img) => img.category)))];

  const filteredImages = images.filter((img) => {
    return selectedCategory === "All" || img.category === selectedCategory;
  });

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <section className="bg-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Take a look at our campus, events, and student life at Maa Kamakhya Computer Institute.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category 
                    ? "bg-indigo-600 text-white shadow-md" 
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Image Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredImages.map((img, index) => (
                <motion.div 
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all aspect-square bg-gray-200"
                >
                  <img 
                    src={img.imageUrl || `https://picsum.photos/seed/gallery${img.id}/400/400`} 
                    alt={img.title} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <h3 className="text-white font-bold text-lg mb-1">{img.title}</h3>
                    <p className="text-indigo-300 text-sm font-medium">{img.category}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-gray-900 mb-2">No images found</h3>
              <p className="text-gray-500">Check back later for updates.</p>
            </div>
          )}
        </div>
      </section>

      <CTA />
    </div>
  );
}
