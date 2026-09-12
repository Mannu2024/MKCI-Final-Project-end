import React, { useState, useEffect, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";
import { Save, Plus, Trash2, Image as ImageIcon, Upload, Monitor, Award, Users, BookOpen, ShieldCheck, Clock, Star, CheckCircle, Target, Eye } from "lucide-react";

const AVAILABLE_ICONS = [
  { name: "Monitor", icon: Monitor },
  { name: "Award", icon: Award },
  { name: "Users", icon: Users },
  { name: "BookOpen", icon: BookOpen },
  { name: "ShieldCheck", icon: ShieldCheck },
  { name: "Clock", icon: Clock },
  { name: "Star", icon: Star },
  { name: "CheckCircle", icon: CheckCircle },
  { name: "Target", icon: Target },
  { name: "Eye", icon: Eye },
];

const TABS = [
  "Institute Info", "Hero Section", "Stats", "About", 
  "Why Choose Us", "Contact Info", "CTA Section", "Testimonials"
];

export function AdminWebsiteContent() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState<any>({
    instituteInfo: { logoUrl: "", fullName: "", shortName: "", tagline: "", footerDescription: "", footerCourses: [] },
    heroSection: { badgeText: "", titleLine1: "", titleHighlight: "", description: "" },
    stats: [],
    about: { sectionTitle: "", paragraphs: [], cards: [] },
    whyChooseUs: { sectionTitle: "", subtitle: "", highlights: [], checklist: [] },
    contactInfo: { sectionTitle: "", subtitle: "", address: "", phone: "", email: "", workingHours: "", mapUrl: "" },
    ctaSection: { title: "", description: "" },
    testimonials: []
  });

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(db, "settings", "websiteContent");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setContent(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "websiteContent"), content);
      alert("Changes saved successfully!");
    } catch (error) {
      console.error("Error saving content:", error);
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const storageRef = ref(storage, `settings/logo-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setContent({ ...content, instituteInfo: { ...content.instituteInfo, logoUrl: url } });
    } catch (error) {
      console.error("Error uploading logo:", error);
      alert("Failed to upload logo.");
    }
  };

  const updateField = (section: string, field: string, value: any) => {
    setContent({ ...content, [section]: { ...content[section], [field]: value } });
  };

  const updateArrayItem = (section: string, field: string, index: number, key: string | null, value: any) => {
    const newArray = [...content[section][field]];
    if (key) newArray[index][key] = value;
    else newArray[index] = value;
    updateField(section, field, newArray);
  };

  const addArrayItem = (section: string, field: string, emptyItem: any) => {
    updateField(section, field, [...content[section][field], emptyItem]);
  };

  const removeArrayItem = (section: string, field: string, index: number) => {
    const newArray = [...content[section][field]];
    newArray.splice(index, 1);
    updateField(section, field, newArray);
  };

  if (loading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="space-y-6 font-sans">
      <h1 className="text-2xl font-bold text-gray-900 font-serif">Website Content</h1>
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-900 font-serif mb-6">{activeTab}</h2>

        {activeTab === "Institute Info" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Institute Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                  {content.instituteInfo.logoUrl ? (
                    <img src={content.instituteInfo.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon className="text-gray-400" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleLogoUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
                    <Upload size={16} /> Upload Logo
                  </button>
                  <p className="text-xs text-gray-500 mt-2">Max 2MB. PNG or JPG recommended.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Institute Full Name</label>
                <input type="text" value={content.instituteInfo.fullName} onChange={e => updateField("instituteInfo", "fullName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Name (Navbar)</label>
                  <input type="text" value={content.instituteInfo.shortName} onChange={e => updateField("instituteInfo", "shortName", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                  <input type="text" value={content.instituteInfo.tagline} onChange={e => updateField("instituteInfo", "tagline", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Footer Description</label>
                <textarea rows={3} value={content.instituteInfo.footerDescription} onChange={e => updateField("instituteInfo", "footerDescription", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Footer Courses List</label>
                <div className="space-y-2">
                  {content.instituteInfo.footerCourses.map((course: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                      <input type="text" value={course} onChange={e => {
                        const newCourses = [...content.instituteInfo.footerCourses];
                        newCourses[idx] = e.target.value;
                        updateField("instituteInfo", "footerCourses", newCourses);
                      }} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      <button onClick={() => {
                        const newCourses = [...content.instituteInfo.footerCourses];
                        newCourses.splice(idx, 1);
                        updateField("instituteInfo", "footerCourses", newCourses);
                      }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  ))}
                  <button onClick={() => updateField("instituteInfo", "footerCourses", [...content.instituteInfo.footerCourses, ""])} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Hero Section" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
              <input type="text" value={content.heroSection.badgeText} onChange={e => updateField("heroSection", "badgeText", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Line 1</label>
              <input type="text" value={content.heroSection.titleLine1} onChange={e => updateField("heroSection", "titleLine1", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title Highlight (colored text)</label>
              <input type="text" value={content.heroSection.titleHighlight} onChange={e => updateField("heroSection", "titleHighlight", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={content.heroSection.description} onChange={e => updateField("heroSection", "description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
        )}

        {activeTab === "Stats" && (
          <div className="space-y-4">
            {content.stats.map((stat: any, idx: number) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                  <input type="text" value={stat.value} onChange={e => updateArrayItem("stats", "", idx, "value", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                  <div className="flex gap-2">
                    <input type="text" value={stat.label} onChange={e => updateArrayItem("stats", "", idx, "label", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={() => {
                      const newStats = [...content.stats];
                      newStats.splice(idx, 1);
                      setContent({ ...content, stats: newStats });
                    }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => setContent({ ...content, stats: [...content.stats, { value: "", label: "" }] })} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
              <Plus size={16} /> Add Stat
            </button>
          </div>
        )}

        {activeTab === "About" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input type="text" value={content.about.sectionTitle} onChange={e => updateField("about", "sectionTitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paragraphs</label>
              <div className="space-y-3">
                {content.about.paragraphs.map((para: string, idx: number) => (
                  <div key={idx} className="flex gap-2 items-start">
                    <textarea rows={3} value={para} onChange={e => updateArrayItem("about", "paragraphs", idx, null, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
                    <button onClick={() => removeArrayItem("about", "paragraphs", idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button onClick={() => addArrayItem("about", "paragraphs", "")} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                  <Plus size={16} /> Add Paragraph
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cards (Mission, Vision, etc.)</label>
              <div className="space-y-4">
                {content.about.cards.map((card: any, idx: number) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative">
                    <button onClick={() => removeArrayItem("about", "cards", idx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16} /></button>
                    <div className="space-y-3 pr-8">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                        <select 
                          value={card.icon || "Target"} 
                          onChange={e => updateArrayItem("about", "cards", idx, "icon", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          {AVAILABLE_ICONS.map(icon => (
                            <option key={icon.name} value={icon.name}>{icon.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                        <input type="text" value={card.title} onChange={e => updateArrayItem("about", "cards", idx, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <textarea rows={2} value={card.description} onChange={e => updateArrayItem("about", "cards", idx, "description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addArrayItem("about", "cards", { title: "", description: "", icon: "Target" })} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
                  <Plus size={16} /> Add Card
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Why Choose Us" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input type="text" value={content.whyChooseUs.sectionTitle} onChange={e => updateField("whyChooseUs", "sectionTitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea rows={2} value={content.whyChooseUs.subtitle} onChange={e => updateField("whyChooseUs", "subtitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Highlights (icon cards)</label>
              <div className="space-y-3">
                {content.whyChooseUs.highlights.map((hl: any, idx: number) => (
                  <div key={idx} className="flex gap-4 items-start p-4 border border-gray-200 rounded-xl bg-gray-50 relative">
                    <button onClick={() => removeArrayItem("whyChooseUs", "highlights", idx)} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16} /></button>
                    <div className="flex-1 space-y-3 pr-8">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Icon</label>
                        <select 
                          value={hl.icon || "Monitor"} 
                          onChange={e => updateArrayItem("whyChooseUs", "highlights", idx, "icon", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        >
                          {AVAILABLE_ICONS.map(icon => (
                            <option key={icon.name} value={icon.name}>{icon.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                        <input type="text" value={hl.title} onChange={e => updateArrayItem("whyChooseUs", "highlights", idx, "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                        <input type="text" value={hl.description} onChange={e => updateArrayItem("whyChooseUs", "highlights", idx, "description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={() => addArrayItem("whyChooseUs", "highlights", { title: "", description: "", icon: "Monitor" })} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-2 shadow-sm">
                  <Plus size={16} /> Add Highlight
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Items</label>
              <div className="space-y-2">
                {content.whyChooseUs.checklist.map((item: string, idx: number) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={item} onChange={e => updateArrayItem("whyChooseUs", "checklist", idx, null, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                    <button onClick={() => removeArrayItem("whyChooseUs", "checklist", idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                  </div>
                ))}
                <button onClick={() => addArrayItem("whyChooseUs", "checklist", "")} className="text-sm text-indigo-600 font-medium flex items-center gap-1 hover:text-indigo-700">
                  <Plus size={16} /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Contact Info" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section Title</label>
              <input type="text" value={content.contactInfo.sectionTitle} onChange={e => updateField("contactInfo", "sectionTitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
              <textarea rows={2} value={content.contactInfo.subtitle} onChange={e => updateField("contactInfo", "subtitle", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" value={content.contactInfo.address} onChange={e => updateField("contactInfo", "address", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={content.contactInfo.phone} onChange={e => updateField("contactInfo", "phone", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="text" value={content.contactInfo.email} onChange={e => updateField("contactInfo", "email", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Working Hours</label>
              <input type="text" value={content.contactInfo.workingHours} onChange={e => updateField("contactInfo", "workingHours", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps Embed URL</label>
              <input type="text" value={content.contactInfo.mapUrl} onChange={e => updateField("contactInfo", "mapUrl", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
        )}

        {activeTab === "CTA Section" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input type="text" value={content.ctaSection.title} onChange={e => updateField("ctaSection", "title", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea rows={3} value={content.ctaSection.description} onChange={e => updateField("ctaSection", "description", e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
            </div>
          </div>
        )}

        {activeTab === "Testimonials" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setContent({ ...content, testimonials: [...content.testimonials, { name: "", role: "", content: "" }] })} className="bg-[#4f46e5] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                <Plus size={16} /> Add Testimonial
              </button>
            </div>
            
            {content.testimonials.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No testimonials yet. Add one above.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content.testimonials.map((t: any, idx: number) => (
                  <div key={idx} className="p-4 border border-gray-200 rounded-xl bg-gray-50 relative">
                    <button onClick={() => {
                      const newT = [...content.testimonials];
                      newT.splice(idx, 1);
                      setContent({ ...content, testimonials: newT });
                    }} className="absolute top-4 right-4 text-red-500 hover:bg-red-100 p-1 rounded"><Trash2 size={16} /></button>
                    <div className="space-y-3 pr-8">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Student Name</label>
                        <input type="text" value={t.name} onChange={e => {
                          const newT = [...content.testimonials];
                          newT[idx].name = e.target.value;
                          setContent({ ...content, testimonials: newT });
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Course/Role</label>
                        <input type="text" value={t.role} onChange={e => {
                          const newT = [...content.testimonials];
                          newT[idx].role = e.target.value;
                          setContent({ ...content, testimonials: newT });
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Review</label>
                        <textarea rows={3} value={t.content} onChange={e => {
                          const newT = [...content.testimonials];
                          newT[idx].content = e.target.value;
                          setContent({ ...content, testimonials: newT });
                        }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 resize-none" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#4f46e5] text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Saving...</>
            ) : (
              <><Save size={18} /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
