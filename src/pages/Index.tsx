
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
      {/* Top decorative elements */}
      <div className="absolute top-16 left-16 w-3 h-3 rounded-full bg-blue-300/30 animate-pulse-slow" />
      <div className="absolute top-24 left-24 w-1.5 h-1.5 rounded-full bg-blue-300/20 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-32 right-40 w-2 h-2 rounded-full bg-blue-300/25 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      {/* Form Container */}
      <ContactForm />
      
      {/* Bottom decorative elements */}
      <div className="absolute bottom-16 right-24 w-2.5 h-2.5 rounded-full bg-blue-300/30 animate-pulse-slow" />
      <div className="absolute bottom-24 right-16 w-1.5 h-1.5 rounded-full bg-blue-300/20 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-12 left-32 w-2 h-2 rounded-full bg-blue-300/25 animate-pulse-slow" style={{ animationDelay: '0.8s' }} />
      
      {/* Footer */}
      <div className="absolute bottom-8 text-white/40 text-sm animate-fade-in opacity-0" style={{ animationDelay: '1s' }}>
        © {new Date().getFullYear()} · Designed with precision
      </div>
    </div>
  );
};

export default Index;
