import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, GraduationCap } from "lucide-react";
import { useWebsiteContent } from "../contexts/WebsiteContentContext";

export function Footer() {
  const { content } = useWebsiteContent();

  return (
    <footer className="bg-[#1e2235] text-gray-300 py-12 border-t border-gray-800">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {content.instituteInfo.logoUrl ? (
              <img src={content.instituteInfo.logoUrl} alt={content.instituteInfo.shortName} className="w-10 h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white border border-white/10">
                <GraduationCap size={20} />
              </div>
            )}
            <div>
              <h1 className="font-bold text-lg text-white leading-tight font-serif">{content.instituteInfo.shortName}</h1>
              <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{content.instituteInfo.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mt-2">
            {content.instituteInfo.footerDescription}
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-base font-serif">Quick Links</h3>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Admission</Link></li>
            <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Popular Courses */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-base font-serif">Courses</h3>
          <ul className="flex flex-col gap-3 text-sm">
            {content.instituteInfo.footerCourses.map((course, index) => (
              <li key={index}><Link to="/courses" className="hover:text-white transition-colors">{course}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-white font-bold text-base font-serif">Contact Info</h3>
          <ul className="flex flex-col gap-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <span className="leading-relaxed whitespace-pre-line">{content.contactInfo.address}</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <span className="leading-relaxed whitespace-pre-line">{content.contactInfo.phone}</span>
            </li>
            <li className="flex items-start gap-3">
              <Mail className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <span className="leading-relaxed whitespace-pre-line">{content.contactInfo.email}</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-sm text-center text-gray-400">
        <p>&copy; {new Date().getFullYear()} {content.instituteInfo.fullName}. All rights reserved.</p>
      </div>
    </footer>
  );
}
