
import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Mail, Phone, FileText, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { GOOGLE_SHEETS_URL } from '@/config/apiConfig';
import { checkRateLimit, recordSubmission } from '@/utils/rateLimiter';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  
  // Format countdown display
  const formatCountdown = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} segundos`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)} minutos e ${seconds % 60} segundos`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      return `${hours} hora${hours > 1 ? 's' : ''}, ${minutes} minuto${minutes > 1 ? 's' : ''} e ${remainingSeconds} segundo${remainingSeconds > 1 ? 's' : ''}`;
    }
  };
  
  const validateEmail = (email: string) => {
    if (!email) return "Email é obrigatório";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";
    
    const domain = email.split('@')[1];
    if (!VALID_EMAIL_DOMAINS.includes(domain)) {
      return `Somente e-mails desses domínios são aceitos: ${VALID_EMAIL_DOMAINS.join(', ')}`;
    }
    
    return "";
  };

  const validatePhone = (phone: string) => {
    if (!phone) return "Número de telefone é obrigatório";
    
    const numericPhone = phone.replace(/\D/g, '');
    
    if (numericPhone.length !== 11) {
      return "O telefone deve ter 11 dígitos: (DD) 9 XXXX-XXXX";
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
        setErrors(prev => ({ ...prev, [name]: value ? "" : `${name} é obrigatório` }));
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
    
    if (!formData.name) newErrors.name = "Nome é obrigatório";
    
    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;
    
    const phoneError = validatePhone(formData.phone);
    if (phoneError) newErrors.phone = phoneError;
    
    if (!formData.subject) newErrors.subject = "Assunto é obrigatório";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user can submit
    const { canSubmit, waitTime, submissionsLeft, isHourBlock } = checkRateLimit();
    setSubmissionsLeft(submissionsLeft);
    setIsHourBlock(isHourBlock);
    
    if (!canSubmit) {
      setCountdown(waitTime);
      
      // Start countdown timer
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
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000);
      
      const message = isHourBlock
        ? `Você atingiu o limite de envios. Tente novamente em ${formatCountdown(waitTime)}.`
        : `Aguarde ${formatCountdown(waitTime)} antes de enviar outra mensagem.`;
      
      toast({
        title: "Limite de envio",
        description: message,
        variant: "destructive",
      });
      
      return;
    }
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    console.log("Enviando dados para:", GOOGLE_SHEETS_URL);
    console.log("Dados a serem enviados:", formData);
    
    try {
      const form = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });
      
      const jsonResponse = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log("Resposta recebida");
      
      // Record successful submission
      recordSubmission();
      
      // Update countdown and submissions left
      const newLimitStatus = checkRateLimit();
      setSubmissionsLeft(newLimitStatus.submissionsLeft);
      
      if (!newLimitStatus.canSubmit) {
        setCountdown(newLimitStatus.waitTime);
        
        // Start countdown timer
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
              return 0;
            }
            return prevCount - 1;
          });
        }, 1000);
      }
      
      toast({
        title: "Formulário enviado com sucesso",
        description: "Seus dados foram enviados!",
      });
      
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
      });
      
      setErrors({});
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      toast({
        title: "Erro ao enviar formulário",
        description: "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto animate-fade-in-up">
      <div className="bg-black/90 rounded-xl p-8 shadow-xl border border-gray-800">
        {countdown > 0 && (
          <Alert className="mb-4 bg-yellow-900/30 border-yellow-600 text-yellow-200">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
            <AlertDescription className="ml-2">
              {isHourBlock 
                ? `Você atingiu o limite de envios. Tente novamente em ${formatCountdown(countdown)}.`
                : `Aguarde ${formatCountdown(countdown)} antes de enviar outra mensagem.`
              }
            </AlertDescription>
          </Alert>
        )}
        
        {!isHourBlock && submissionsLeft < 5 && (
          <Alert className="mb-4 bg-blue-900/30 border-blue-600 text-blue-200">
            <AlertDescription>
              Você tem {submissionsLeft} {submissionsLeft === 1 ? 'envio restante' : 'envios restantes'} antes do limite de hora.
            </AlertDescription>
          </Alert>
        )}
        
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
              <span>Nome</span>
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
              <span>WhatsApp</span>
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
              <span>Assunto</span>
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
