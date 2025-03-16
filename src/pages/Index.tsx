
import React, { useEffect } from 'react';
import ContactForm from '@/components/ContactForm';

const Index: React.FC = () => {
  useEffect(() => {
    // Add staggered fade-in effect to elements
    const elements = document.querySelectorAll('.stagger-fade-in');
    elements.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * 0.1 + 0.2}s`;
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500">
      {/* Form Container */}
      <ContactForm />
      
      {/* Footer */}
      <div className="absolute bottom-8 text-white/40 text-sm animate-fade-in opacity-0" style={{ animationDelay: '1s' }}>
        © {new Date().getFullYear()} · Designed with precision
      </div>
    </div>
  );
};

export default Index;
