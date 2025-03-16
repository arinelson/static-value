
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
    setSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "Form submitted successfully",
      description: "We'll get back to you soon!",
    });
    
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
    });
    
    setSubmitting(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="glass-panel rounded-xl p-8 subtle-glow">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'name' || formData.name 
                  ? 'text-xs -top-6 text-tech-blue' 
                  : 'text-tech-light/60'
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
              className="form-input"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'email' || formData.email 
                  ? 'text-xs -top-6 text-tech-blue' 
                  : 'text-tech-light/60'
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
              className="form-input"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'phone' || formData.phone 
                  ? 'text-xs -top-6 text-tech-blue' 
                  : 'text-tech-light/60'
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
              className="form-input"
              required
            />
          </div>
          
          <div className="relative">
            <label 
              className={`absolute left-4 top-3 flex items-center gap-2 transition-all duration-300 ${
                focusedField === 'subject' || formData.subject 
                  ? 'text-xs -top-6 text-tech-blue' 
                  : 'text-tech-light/60'
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
              className="form-input min-h-[120px] resize-none pt-4"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#0a192f] to-[#112240] hover:from-[#112240] hover:to-[#233554] border border-tech-blue/30 hover:border-tech-blue/80 rounded-md py-3 px-4 flex items-center justify-center gap-2 text-tech-blue transition-all duration-300 group"
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
