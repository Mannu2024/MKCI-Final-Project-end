import { Link } from "react-router-dom";
import { CheckCircle, Award, Users, BookOpen } from "lucide-react";
import { CTA } from "../components/CTA";
import { motion } from "motion/react";
import { useWebsiteContent } from "../contexts/WebsiteContentContext";

export function About() {
  const { content } = useWebsiteContent();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Page Header */}
      <section className="bg-indigo-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto">
            Learn more about {content.instituteInfo.fullName} and our mission to provide quality computer education.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6"
          >
            <div className="flex items-center gap-2 text-indigo-600 font-semibold">
              <span className="w-8 h-1 bg-indigo-600 rounded-full"></span>
              OUR STORY
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              {content.about.sectionTitle}
            </h2>
            {content.about.paragraphs.map((para, index) => (
              <p key={index} className="text-gray-600 leading-relaxed">
                {para}
              </p>
            ))}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {content.about.cards.map((card, index) => {
                const icons = [Award, Users, BookOpen, CheckCircle];
                const Icon = icons[index % icons.length];
                return (
                  <div key={index} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{card.title}</h4>
                      <p className="text-sm text-gray-500">{card.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <BookOpen size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To provide high-quality, practical, and affordable computer education that equips students with the skills they need to secure better employment opportunities and succeed in their careers. We strive to bridge the digital divide and make technology accessible to all.
            </p>
          </div>
          
          <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To be the leading computer education institute in the region, recognized for our commitment to excellence, innovative teaching methods, and the success of our alumni. We envision a future where every individual is digitally literate and empowered.
            </p>
          </div>
        </div>
      </section>

      <CTA />
    </div>
  );
}
