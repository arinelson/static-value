
import React, { useState } from 'react';
import { Send, User, Mail, Phone, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
}

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormData | null>(null);
  
  // You can configure this URL later in the code
  const GOOGLE_SHEETS_URL = ""; // TODO: Add your Google Sheets URL here

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFocus = (field: keyof FormData) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!GOOGLE_SHEETS_URL) {
      console.log("Google Sheets URL not configured");
      toast({
        title: "Form submitted",
        description: "Form received, but Google Sheets URL not configured yet",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script web apps
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      // Since we're using no-cors mode, we can't actually check the response status
      toast({
        title: "Form submitted successfully",
        description: "Your data has been sent!",
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error submitting form",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="bg-black/90 rounded-xl p-8 shadow-xl border border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'name' || formData.name 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400'
              }`}
            >
              <User size={16} /> 
              <span>Name</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onFocus={() => handleFocus('name')}
              onBlur={handleBlur}
              className="w-full bg-black/70 border border-gray-700 rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'email' || formData.email 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400'
              }`}
            >
              <Mail size={16} /> 
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => handleFocus('email')}
              onBlur={handleBlur}
              className="w-full bg-black/70 border border-gray-700 rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'phone' || formData.phone 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400'
              }`}
            >
              <Phone size={16} /> 
              <span>Phone</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onFocus={() => handleFocus('phone')}
              onBlur={handleBlur}
              className="w-full bg-black/70 border border-gray-700 rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'subject' || formData.subject 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400'
              }`}
            >
              <FileText size={16} /> 
              <span>Subject</span>
            </label>
            <textarea
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              onFocus={() => handleFocus('subject')}
              onBlur={handleBlur}
              className="w-full bg-black/70 border border-gray-700 rounded-md px-4 py-3 min-h-[120px] resize-none pt-4 outline-none focus:border-blue-400 transition-all duration-300 text-white"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-md py-3 px-4 flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 group"
          >
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              {submitting ? 'Sending...' : 'Send message'}
            </span>
            <Send size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
