
import React, { useEffect } from 'react';
import ParticleBackground from '@/components/ParticleBackground';
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      <ParticleBackground />
      
      <div className="absolute top-0 right-0 w-60 h-60 rounded-full bg-tech-blue/5 blur-[80px] -z-10" />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-[#4169E1]/5 blur-[100px] -z-10" />
      
      {/* Top decorative elements */}
      <div className="absolute top-16 left-16 w-3 h-3 rounded-full bg-tech-blue/30 animate-pulse-slow" />
      <div className="absolute top-24 left-24 w-1.5 h-1.5 rounded-full bg-tech-blue/20 animate-pulse-slow" style={{ animationDelay: '0.5s' }} />
      <div className="absolute top-32 right-40 w-2 h-2 rounded-full bg-tech-blue/25 animate-pulse-slow" style={{ animationDelay: '1s' }} />
      
      {/* Header */}
      <div className="mb-16 text-center stagger-fade-in opacity-0 animate-fade-in">
        <div className="inline-block px-3 py-1 mb-4 text-xs font-medium text-tech-blue bg-tech-blue/10 rounded-full">
          Connect with us
        </div>
        <h1 className="text-5xl font-light text-tech-white mb-4 tracking-tight">
          Contact <span className="text-tech-blue">Form</span>
        </h1>
        <p className="text-tech-light max-w-md mx-auto">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      
      {/* Form Container */}
      <ContactForm />
      
      {/* Bottom decorative elements */}
      <div className="absolute bottom-16 right-24 w-2.5 h-2.5 rounded-full bg-tech-blue/30 animate-pulse-slow" />
      <div className="absolute bottom-24 right-16 w-1.5 h-1.5 rounded-full bg-tech-blue/20 animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-12 left-32 w-2 h-2 rounded-full bg-tech-blue/25 animate-pulse-slow" style={{ animationDelay: '0.8s' }} />
      
      {/* Footer */}
      <div className="absolute bottom-8 text-tech-light/40 text-sm animate-fade-in opacity-0" style={{ animationDelay: '1s' }}>
        © {new Date().getFullYear()} · Designed with precision
      </div>
    </div>
  );
};

export default Index;
