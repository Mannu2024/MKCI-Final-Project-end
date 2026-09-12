import { Link, useLocation } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useWebsiteContent } from "../contexts/WebsiteContentContext";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { content } = useWebsiteContent();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Courses", path: "/courses" },
    { name: "Gallery", path: "/gallery" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          {content.instituteInfo.logoUrl ? (
            <img src={content.instituteInfo.logoUrl} alt={content.instituteInfo.shortName} className="w-10 h-10 object-contain" />
          ) : (
            <div className="w-10 h-10 bg-[#3b5bdb] rounded-lg flex items-center justify-center text-white">
              <GraduationCap size={24} />
            </div>
          )}
          <div>
            <h1 className="font-bold text-lg text-gray-900 leading-tight">{content.instituteInfo.shortName}</h1>
            <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{content.instituteInfo.tagline}</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center bg-gray-50 rounded-full px-2 py-1 border border-gray-100">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                location.pathname === link.path 
                  ? "text-[#3b5bdb] bg-white shadow-sm" 
                  : "text-gray-600 hover:text-[#3b5bdb]"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/verify" className="text-[#20c997] border border-[#20c997] px-4 py-2 rounded-md text-sm font-medium hover:bg-[#20c997]/10 transition-colors">
            Verify Student
          </Link>
          <Link to="/admin/login" className="bg-[#3b5bdb] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
            Admin
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-gray-700" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden bg-white border-t p-4 flex flex-col gap-4 font-medium text-gray-700 shadow-lg absolute w-full left-0">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path} 
              onClick={() => setIsOpen(false)}
              className={location.pathname === link.path ? "text-[#3b5bdb]" : ""}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-px bg-gray-100 my-2"></div>
          <Link to="/verify" onClick={() => setIsOpen(false)} className="text-[#20c997]">Verify Student</Link>
          <Link to="/admin/login" onClick={() => setIsOpen(false)} className="text-[#3b5bdb]">Admin Portal</Link>
        </div>
      )}
    </header>
  );
}
