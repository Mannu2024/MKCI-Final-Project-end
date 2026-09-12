import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Star, Target, Eye, Award, BookOpen, Monitor, Shield, Clock, Users, ShieldCheck, MapPin, Phone, Mail, Send } from "lucide-react";
import { CTA } from "../components/CTA";
import { motion } from "motion/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { sendEnquiryEmail } from "../lib/email";
import { useWebsiteContent } from "../contexts/WebsiteContentContext";
import { HomeCourses } from "../components/HomeCourses";
import { HomeGallery } from "../components/HomeGallery";
import { HomeTestimonials } from "../components/HomeTestimonials";

export function Home() {
  const { content } = useWebsiteContent();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "enquiries"), {
        ...formData,
        status: "pending",
        date: new Date().toISOString()
      });

      // Send email notification to admin
      await sendEnquiryEmail(formData);

      setIsSuccess(true);
      setFormData({ name: "", phone: "", email: "", message: "" });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (error) {
      console.error("Error submitting enquiry:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f8fafc]">
      {/* Hero Section */}
      <section className="relative bg-[#1e2235] pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {content.heroSection.badgeText && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 text-indigo-200 rounded-full text-sm font-medium mb-6 border border-white/10">
                <Star size={16} className="text-[#f59e0b]" />
                {content.heroSection.badgeText}
              </div>
            )}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 font-serif">
              {content.heroSection.titleLine1} <br />
              <span className="text-[#f59e0b]">{content.heroSection.titleHighlight}</span>
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed max-w-2xl mb-10">
              {content.heroSection.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/courses" className="bg-[#f59e0b] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#d97706] transition-colors flex items-center justify-center gap-2">
                Explore Courses <ArrowRight size={18} />
              </Link>
              <Link to="/verify" className="bg-transparent text-emerald-400 border border-emerald-400/30 px-8 py-3 rounded-md font-semibold hover:bg-emerald-400/10 transition-colors flex items-center justify-center">
                Verify Student / Certificate
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section (Overlapping) */}
      <section className="relative -mt-16 lg:-mt-24 z-10 mb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {content.stats.slice(0, 3).map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                <h3 className="text-4xl font-bold text-[#3b4cca] mb-2 font-serif">{stat.value}</h3>
                <p className="text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-[#f4f6f9]">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="flex flex-col gap-6">
            <h2 className="text-4xl font-bold text-gray-900 font-serif">
              {content.about.sectionTitle}
            </h2>
            {content.about.paragraphs.map((para, index) => (
              <p key={index} className="text-gray-500 leading-relaxed text-lg">
                {para}
              </p>
            ))}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {content.about.cards.map((card, index) => {
              const iconMap: Record<string, any> = {
                Target, Eye, Award, BookOpen, Monitor, Users, ShieldCheck, Clock, Star, CheckCircle
              };
              const Icon = iconMap[card.icon as string] || Target;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                  <div className="w-12 h-12 bg-white text-[#3b4cca] rounded-full flex items-center justify-center mb-4 border border-gray-100 shadow-sm">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2 font-serif">{card.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{card.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <HomeCourses />

      {/* Why Choose Us */}
      <section className="py-20 bg-[#f4f6f9]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
              {content.whyChooseUs.sectionTitle}
            </h2>
            <p className="text-gray-500 text-lg">
              {content.whyChooseUs.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-12 max-w-6xl mx-auto">
            {content.whyChooseUs.highlights.map((highlight, index) => {
              const iconMap: Record<string, any> = {
                Monitor, Award, Users, BookOpen, ShieldCheck, Shield, Clock, Star, CheckCircle
              };
              const Icon = iconMap[highlight.icon as string] || Monitor;
              return (
                <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-5 w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                  <div className="w-12 h-12 bg-[#eef2ff] text-[#3b4cca] rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2 font-serif">{highlight.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {highlight.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-4 max-w-5xl mx-auto">
            {content.whyChooseUs.checklist.map((item, index) => (
              <div key={index} className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <HomeGallery />

      {/* Testimonials Section */}
      <HomeTestimonials />

      {/* Contact Section */}
      <section className="py-20 bg-[#eef2f6]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4 font-serif">
              {content.contactInfo.sectionTitle}
            </h2>
            <p className="text-gray-500 text-lg">
              {content.contactInfo.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Info Cards & Map */}
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#eef2ff] text-[#3b4cca] rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 font-serif">Address</h3>
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                      {content.contactInfo.address}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#eef2ff] text-[#3b4cca] rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 font-serif">Phone</h3>
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                      {content.contactInfo.phone}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#eef2ff] text-[#3b4cca] rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 font-serif">Email</h3>
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                      {content.contactInfo.email}
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#eef2ff] text-[#3b4cca] rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm mb-1 font-serif">Working Hours</h3>
                    <p className="text-xs text-gray-500 leading-relaxed whitespace-pre-line">
                      {content.contactInfo.workingHours}
                    </p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="bg-gray-200 rounded-xl overflow-hidden h-[300px] shadow-sm border border-gray-100">
                {content.contactInfo.mapUrl ? (
                  <iframe 
                    src={content.contactInfo.mapUrl} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500 text-sm p-4 text-center">
                    Google Maps Platform rejected your request. Invalid request. Invalid 'pb' parameter.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Form */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 font-serif">Send us a Message</h3>
              
              {isSuccess ? (
                <div className="bg-emerald-50 text-emerald-800 p-6 rounded-xl flex flex-col items-center text-center gap-4 border border-emerald-100">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Message Sent Successfully!</h4>
                    <p className="text-sm text-emerald-700">Thank you for contacting us. We will get back to you shortly.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="name" className="text-xs font-medium text-gray-700">Name *</label>
                    <input 
                      type="text" 
                      id="name" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3b4cca] bg-[#f8fafc] text-sm"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="phone" className="text-xs font-medium text-gray-700">Phone *</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3b4cca] bg-[#f8fafc] text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-xs font-medium text-gray-700">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3b4cca] bg-[#f8fafc] text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="message" className="text-xs font-medium text-gray-700">Message</label>
                    <textarea 
                      id="message" 
                      name="message" 
                      value={formData.message}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#3b4cca] bg-[#f8fafc] text-sm resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="mt-2 w-full bg-[#3b4cca] text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-[#2a389e] transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>Send Message <Send size={14} /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTA />
    </div>
  );
}
