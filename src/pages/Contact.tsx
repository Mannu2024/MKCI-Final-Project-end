import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { MapPin, Phone, Mail, Send, CheckCircle, Clock } from "lucide-react";
import { motion } from "motion/react";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { sendEnquiryEmail } from "../lib/email";
import { useWebsiteContent } from "../contexts/WebsiteContentContext";
import { CTA } from "../components/CTA";

export function Contact() {
  const location = useLocation();
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
      {/* Page Header */}
      <section className="pt-16 pb-12 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-serif">Contact Us</h1>
          <p className="text-gray-600">
            Get in touch with us for any queries or information.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4 max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Column: Info Cards & Map */}
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Address</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {content.contactInfo.address}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Phone</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {content.contactInfo.phone}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Email</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    {content.contactInfo.email}
                  </p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Working Hours</h3>
                  <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
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
            <h3 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            {isSuccess ? (
              <div className="bg-green-50 text-green-800 p-6 rounded-xl flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h4 className="font-bold mb-1">Message Sent Successfully!</h4>
                  <p className="text-sm text-green-700">Thank you for contacting us. We will get back to you shortly.</p>
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
                    className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#f8fafc] text-sm"
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
                    className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#f8fafc] text-sm"
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
                    className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#f8fafc] text-sm"
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
                    className="w-full px-3 py-2.5 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-[#f8fafc] text-sm resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="mt-2 w-full bg-[#3b5bdb] text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed text-sm"
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
      </section>

      <CTA />
    </div>
  );
}
