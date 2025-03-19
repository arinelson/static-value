
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { GOOGLE_SHEETS_URL } from '@/config/apiConfig';
import { checkRateLimit, recordSubmission } from '@/utils/rateLimiter';

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

export const useContactForm = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<keyof FormData | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user can submit
    const { canSubmit, waitTime, submissionsLeft, isHourBlock } = checkRateLimit();
    
    if (!canSubmit) {
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

  return {
    formData,
    submitting,
    focusedField,
    errors,
    handleChange,
    handleFocus,
    handleBlur,
    handleSubmit,
    formatCountdown
  };
};
