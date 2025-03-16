
import React, { useEffect, useState } from 'react';
import ContactForm from '@/components/ContactForm';
import ParticleBackground from '@/components/ParticleBackground';
import HolographicEffect from '@/components/HolographicEffect';

const Index: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    // Start the animation sequence
    setTimeout(() => {
      setShowForm(true);
    }, 1000);
    
    // Mark animation as complete after the total duration
    setTimeout(() => {
      setAnimationComplete(true);
    }, 3000);

    // Add staggered fade-in effect to elements
    const elements = document.querySelectorAll('.stagger-fade-in');
    elements.forEach((el, index) => {
      (el as HTMLElement).style.animationDelay = `${index * 0.1 + 3.2}s`;
    });
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden bg-gradient-to-b from-[#0A192F] via-[#112240] to-[#1A365D]">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Holographic Animation */}
      <HolographicEffect />
      
      {/* Form Container with Animation */}
      <div className={`relative ${showForm ? 'form-reveal' : 'form-hidden'}`}>
        <div className={`pointer-events-${animationComplete ? 'auto' : 'none'}`}>
          <ContactForm />
        </div>
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-8 text-white/40 text-sm animate-fade-in opacity-0" style={{ animationDelay: '3.5s' }}>
        © {new Date().getFullYear()} · Designed with precision
      </div>
    </div>
  );
};

export default Index;
