
import React, { useState } from 'react';
import { Send, User, Mail, Phone, FileText } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface FormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
}

const VALID_EMAIL_DOMAINS = [
  'gmail.com',
  'outlook.com',
  'hotmail.com',
  'yahoo.com',
  'icloud.com',
  'protonmail.com',
  'aol.com',
  'mail.com',
  'zoho.com',
  'live.com',
  'msn.com'
];

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  
  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbz7sJKZi4PyoAsHJaA8S2YCFn-Lf4AiFgW1dXBDA2yUBLt1eQia4MeNPvo-_gtjn-zQ/exec"; // TODO: Add your Google Sheets URL here

  const validateEmail = (email: string) => {
    if (!email) return "Email is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    
    const domain = email.split('@')[1];
    if (!VALID_EMAIL_DOMAINS.includes(domain)) {
      return `Only emails from these domains are accepted: ${VALID_EMAIL_DOMAINS.join(', ')}`;
    }
    
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Phone number is required";
    
    const numericPhone = phone.replace(/\D/g, '');
    
    if (numericPhone.length !== 11) {
      return "Phone must have 11 digits: (DD) 9 XXXX-XXXX";
    }
    
    return "";
  };

  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 3) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      const rawValue = value.replace(/\D/g, '');
      const trimmed = rawValue.slice(0, 11);
      const formatted = formatPhoneNumber(trimmed);
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      
      const phoneError = validatePhone(trimmed);
      setErrors(prev => ({ ...prev, [name]: phoneError }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      if (name === 'email') {
        const emailError = validateEmail(value);
        setErrors(prev => ({ ...prev, [name]: emailError }));
      } else {
        setErrors(prev => ({ ...prev, [name]: value ? "" : `${name} is required` }));
      }
    }
  };

  const handleFocus = (field: keyof FormData) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    
    if (!formData.name) newErrors.name = "Name is required";
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    if (!formData.subject) newErrors.subject = "Subject is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please correct the errors in the form",
        variant: "destructive",
      });
      return;
    }
    
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
      
      setErrors({});
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
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="relative mt-6">
            <label 
              className={`absolute left-4 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'name' || formData.name 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400 top-3'
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
              className={`w-full bg-black/70 border ${
                errors.name ? 'border-red-500' : 'border-gray-700'
              } rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white`}
              required
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
          
          <div className="relative mt-8">
            <label 
              className={`absolute left-4 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'email' || formData.email 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400 top-3'
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
              className={`w-full bg-black/70 border ${
                errors.email ? 'border-red-500' : 'border-gray-700'
              } rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white`}
              required
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email}</p>
            )}
          </div>
          
          <div className="relative mt-8">
            <label 
              className={`absolute left-4 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'phone' || formData.phone 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400 top-3'
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
              className={`w-full bg-black/70 border ${
                errors.phone ? 'border-red-500' : 'border-gray-700'
              } rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white`}
              required
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
          
          <div className="relative mt-8">
            <label 
              className={`absolute left-4 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'subject' || formData.subject 
                  ? 'text-xs -top-6 text-blue-400' 
                  : 'text-gray-400 top-3'
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
              className={`w-full bg-black/70 border ${
                errors.subject ? 'border-red-500' : 'border-gray-700'
              } rounded-md px-4 py-3 min-h-[120px] resize-none pt-4 outline-none focus:border-blue-400 transition-all duration-300 text-white`}
              required
            />
            {errors.subject && (
              <p className="text-red-500 text-xs mt-1">{errors.subject}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 rounded-md py-3 px-4 flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 group mt-8"
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
