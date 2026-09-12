import React, { createContext, useContext, useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface WebsiteContent {
  instituteInfo: {
    logoUrl: string;
    fullName: string;
    shortName: string;
    tagline: string;
    footerDescription: string;
    footerCourses: string[];
  };
  heroSection: {
    badgeText: string;
    titleLine1: string;
    titleHighlight: string;
    description: string;
  };
  stats: { value: string; label: string }[];
  about: {
    sectionTitle: string;
    paragraphs: string[];
    cards: { title: string; description: string; icon: string }[];
  };
  whyChooseUs: {
    sectionTitle: string;
    subtitle: string;
    highlights: { title: string; description: string; icon: string }[];
    checklist: string[];
  };
  contactInfo: {
    sectionTitle: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    workingHours: string;
    mapUrl: string;
  };
  ctaSection: {
    title: string;
    description: string;
  };
  testimonials: { name: string; role: string; content: string }[];
}

const defaultContent: WebsiteContent = {
  instituteInfo: {
    logoUrl: "",
    fullName: "Maa Kamakhya Computer Institute",
    shortName: "Maa Kamakhya",
    tagline: "Computer Institute",
    footerDescription: "Empowering students with industry-relevant computer education and certification at Mungari, Rampur, Prayagraj.",
    footerCourses: ["DCA / ADCA", "Tally Prime", "Web Development", "MS Office", "Programming"],
  },
  heroSection: {
    badgeText: "Trusted Computer Education Center",
    titleLine1: "Build Your Future with",
    titleHighlight: "Computer Skills",
    description: "Maa Kamakhya Computer Institute offers industry-recognized courses in computer applications, programming, accounting & more with certified training and placement support.",
  },
  stats: [
    { value: "94", label: "Students Trained" },
    { value: "5+", label: "Courses Offered" },
    { value: "4+", label: "Years Experience" },
  ],
  about: {
    sectionTitle: "About Us",
    paragraphs: [
      "Maa Kamakhya Computer Institute is a leading computer education institute dedicated to providing quality training in various computer courses. We believe in empowering our students with practical skills that are directly applicable in the professional world.",
      "Our institute offers a wide range of courses from basic computer literacy to advanced programming, ensuring that learners of all levels find the right path to enhance their digital skills."
    ],
    cards: [
      { title: "Mission", description: "To provide affordable, quality computer education to every student seeking to build a career in technology.", icon: "Target" },
      { title: "Vision", description: "To become the most trusted computer education center producing skilled professionals for the IT industry.", icon: "Eye" },
      { title: "Quality", description: "We maintain the highest standards of teaching with regularly updated curriculum and modern infrastructure.", icon: "Award" },
      { title: "Learning", description: "Our hands-on approach ensures students gain practical experience alongside theoretical knowledge.", icon: "BookOpen" }
    ],
  },
  whyChooseUs: {
    sectionTitle: "Why Choose Us",
    subtitle: "We provide world-class computer education with modern infrastructure and expert faculty.",
    highlights: [
      { title: "Modern Labs", description: "State-of-the-art computer labs with latest hardware", icon: "Monitor" },
      { title: "Certified Courses", description: "Industry-recognized certificates on completion", icon: "Award" },
      { title: "Expert Faculty", description: "Experienced trainers with real-world expertise", icon: "Users" },
      { title: "Verified Certificates", description: "Online certificate verification system", icon: "BookOpen" },
      { title: "Flexible Batches", description: "Morning, afternoon & weekend batches available", icon: "ShieldCheck" }
    ],
    checklist: [
      "Industry-recognized certifications",
      "Experienced & qualified faculty",
      "Modern computer labs",
      "Affordable fee structure",
      "Flexible batch timings",
      "Practical-focused training",
      "Online certificate verification"
    ],
  },
  contactInfo: {
    sectionTitle: "Contact Us",
    subtitle: "Get in touch with us for any queries or information.",
    address: "8W8G+2F5, Rampur Taluka Mungari,\nUttar Pradesh 212301",
    phone: "+91 7068573528",
    email: "anoopnaini5@gmail.com",
    workingHours: "Mon - Sat: 8:00 AM - 6:00 PM",
    mapUrl: "https://maps.google.com/maps?q=8W8G%2B2F5%2C%20Rampur%20Taluka%20Mungari%2C%20Uttar%20Pradesh%20212301&t=&z=15&ie=UTF8&iwloc=&output=embed"
  },
  ctaSection: {
    title: "Ready to Start Your Journey?",
    description: "Enroll in our courses today and take the first step towards a successful career in technology."
  },
  testimonials: [
    { name: "Rahul Sharma", role: "Web Development Student", content: "The instructors are very knowledgeable and helpful." },
    { name: "Priya Singh", role: "Data Science Student", content: "I got a job immediately after completing my course." }
  ]
};

interface WebsiteContentContextType {
  content: WebsiteContent;
  loading: boolean;
}

const WebsiteContentContext = createContext<WebsiteContentContextType>({
  content: defaultContent,
  loading: true,
});

export const useWebsiteContent = () => useContext(WebsiteContentContext);

export const WebsiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<WebsiteContent>(defaultContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "settings", "websiteContent");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as Partial<WebsiteContent>;
          
          // Auto-migrate to the new requested address if the old defaults are found
          const oldMapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114584.73584852928!2d91.7025114!3d26.143254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x375a5a287f9133ff%3A0x2bbd1332436bde32!2sGuwahati%2C%20Assam!5e0!3m2!1sen!2sin!4v1709123456789!5m2!1sen!2sin";
          if (data.contactInfo?.mapUrl === oldMapUrl) {
            import("firebase/firestore").then(async ({ updateDoc }) => {
              try {
                await updateDoc(docRef, {
                  "contactInfo.mapUrl": "https://maps.google.com/maps?q=8W8G%2B2F5%2C%20Rampur%20Taluka%20Mungari%2C%20Uttar%20Pradesh%20212301&t=&z=15&ie=UTF8&iwloc=&output=embed",
                  "contactInfo.address": "8W8G+2F5, Rampur Taluka Mungari,\nUttar Pradesh 212301"
                });
                console.log("Auto-migrated map URL to new location");
              } catch (e) {
                console.warn("Could not auto-migrate map URL (insufficient permissions), but UI will use defaults.", e);
              }
            });
            // Immediately override the local data being set to reflect the new address instantly
            data.contactInfo.mapUrl = "https://maps.google.com/maps?q=8W8G%2B2F5%2C%20Rampur%20Taluka%20Mungari%2C%20Uttar%20Pradesh%20212301&t=&z=15&ie=UTF8&iwloc=&output=embed";
            data.contactInfo.address = "8W8G+2F5, Rampur Taluka Mungari,\nUttar Pradesh 212301";
          }

          // Merge with default content to ensure all fields exist
          setContent({ ...defaultContent, ...data });
        }
      } catch (error) {
        // Fallback to default content if Firestore read fails (e.g. due to missing public read rules)
        console.warn("Could not fetch custom website content from Firestore, falling back to defaults. If you want public users to see custom content, ensure your Firestore security rules allow public reads to the 'settings' collection.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <WebsiteContentContext.Provider value={{ content, loading }}>
      {children}
    </WebsiteContentContext.Provider>
  );
};
