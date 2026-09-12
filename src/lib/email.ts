import emailjs from '@emailjs/browser';

export const sendEnquiryEmail = async (formData: {
  name: string;
  phone: string;
  email: string;
  message: string;
  course?: string;
}) => {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("EmailJS credentials not found. Skipping email notification.");
    return false;
  }

  try {
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email || "Not provided",
      phone: formData.phone,
      course: formData.course || "Not specified",
      message: formData.message || "No message provided",
    };

    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams,
      publicKey
    );
    
    return response.status === 200;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
};
