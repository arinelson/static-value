
import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useContactForm } from '@/hooks/useContactForm';
import { checkRateLimit } from '@/utils/rateLimiter';
import ContactFormField from './ContactFormField';
import RateLimitCountdown from './RateLimitCountdown';

const ContactForm: React.FC = () => {
  const {
    formData,
    submitting,
    focusedField,
    errors,
    handleChange,
    handleFocus,
    handleBlur,
    handleSubmit,
    formatCountdown
  } = useContactForm();
  
  const [countdown, setCountdown] = useState<number>(0);
  const [submissionsLeft, setSubmissionsLeft] = useState<number>(5);
  const [isHourBlock, setIsHourBlock] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);
  
  // Check rate limit on component mount
  useEffect(() => {
    const checkLimit = () => {
      const { canSubmit, waitTime, submissionsLeft, isHourBlock } = checkRateLimit();
      setSubmissionsLeft(submissionsLeft);
      setIsHourBlock(isHourBlock);
      
      if (!canSubmit) {
        setCountdown(waitTime);
        
        if (timerRef.current) {
          window.clearInterval(timerRef.current);
        }
        
        timerRef.current = window.setInterval(() => {
          setCountdown(prevCount => {
            if (prevCount <= 1) {
              if (timerRef.current) {
                window.clearInterval(timerRef.current);
                timerRef.current = null;
              }
              
              // Recheck limits after countdown ends
              const newLimit = checkRateLimit();
              setSubmissionsLeft(newLimit.submissionsLeft);
              setIsHourBlock(newLimit.isHourBlock);
              
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
      }
    };
    
    checkLimit();
    
    // Cleanup interval on unmount
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="bg-black/90 rounded-xl p-8 shadow-xl border border-gray-800">
        <RateLimitCountdown 
          countdown={countdown}
          submissionsLeft={submissionsLeft}
          isHourBlock={isHourBlock}
          formatCountdown={formatCountdown}
        />
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <ContactFormField
            type="text"
            name="name"
            value={formData.name}
            label="Nome"
            error={errors.name}
            isFocused={focusedField === 'name'}
            onChange={handleChange}
            onFocus={() => handleFocus('name')}
            onBlur={handleBlur}
          />
          
          <ContactFormField
            type="email"
            name="email"
            value={formData.email}
            label="Email"
            error={errors.email}
            isFocused={focusedField === 'email'}
            onChange={handleChange}
            onFocus={() => handleFocus('email')}
            onBlur={handleBlur}
          />
          
          <ContactFormField
            type="tel"
            name="phone"
            value={formData.phone}
            label="WhatsApp"
            error={errors.phone}
            isFocused={focusedField === 'phone'}
            onChange={handleChange}
            onFocus={() => handleFocus('phone')}
            onBlur={handleBlur}
          />
          
          <ContactFormField
            type="textarea"
            name="subject"
            value={formData.subject}
            label="Assunto"
            error={errors.subject}
            isFocused={focusedField === 'subject'}
            onChange={handleChange}
            onFocus={() => handleFocus('subject')}
            onBlur={handleBlur}
          />
          
          <button
            type="submit"
            disabled={submitting || countdown > 0}
            className={`w-full ${
              countdown > 0 
                ? 'bg-gray-700 cursor-not-allowed opacity-70' 
                : 'bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300'
            } rounded-md py-3 px-4 flex items-center justify-center gap-2 text-white font-medium transition-all duration-300 group mt-8`}
          >
            <span className="group-hover:translate-x-1 transition-transform duration-300">
              {submitting ? 'Enviando...' : countdown > 0 ? `Aguarde ${formatCountdown(countdown)}` : 'Enviar mensagem'}
            </span>
            <Send size={16} className="group-hover:translate-x-1 transition-transform duration-300" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ContactForm;
