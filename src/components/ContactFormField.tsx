
import React from 'react';
import { User, Mail, Phone, FileText } from 'lucide-react';

interface FormFieldProps {
  type: 'text' | 'email' | 'tel' | 'textarea';
  name: string;
  value: string;
  label: string;
  error?: string;
  isFocused: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const ContactFormField: React.FC<FormFieldProps> = ({
  type,
  name,
  value,
  label,
  error,
  isFocused,
  onChange,
  onFocus,
  onBlur
}) => {
  const getIcon = () => {
    switch (name) {
      case 'name':
        return <User size={16} />;
      case 'email':
        return <Mail size={16} />;
      case 'phone':
        return <Phone size={16} />;
      case 'subject':
        return <FileText size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative mt-8">
      <label 
        className={`absolute left-4 flex items-center gap-2 transition-all duration-300 ${
          isFocused || value 
            ? 'text-xs -top-6 text-blue-400' 
            : 'text-gray-400 top-3'
        }`}
      >
        {getIcon()} 
        <span>{label}</span>
      </label>

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full bg-black/70 border ${
            error ? 'border-red-500' : 'border-gray-700'
          } rounded-md px-4 py-3 min-h-[120px] resize-none pt-4 outline-none focus:border-blue-400 transition-all duration-300 text-white`}
          required
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className={`w-full bg-black/70 border ${
            error ? 'border-red-500' : 'border-gray-700'
          } rounded-md px-4 py-3 outline-none focus:border-blue-400 transition-all duration-300 text-white`}
          required
        />
      )}

      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

export default ContactFormField;
