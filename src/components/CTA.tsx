import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useWebsiteContent } from "../contexts/WebsiteContentContext";

export function CTA() {
  const { content } = useWebsiteContent();

  return (
    <section className="py-16 bg-[#eef2f6]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="bg-gradient-to-r from-[#2a43b5] to-[#4c51bf] rounded-2xl p-10 md:p-16 text-white shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif">{content.ctaSection.title}</h2>
          <p className="text-lg text-indigo-100 mb-8 max-w-2xl">
            {content.ctaSection.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/contact" className="bg-[#f59e0b] text-white px-8 py-3 rounded-md font-semibold hover:bg-[#d97706] transition-colors flex items-center justify-center">
              Apply Now
            </Link>
            <Link to="/contact" className="bg-transparent text-white border border-white/30 px-8 py-3 rounded-md font-semibold hover:bg-white/10 transition-colors flex items-center justify-center">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
