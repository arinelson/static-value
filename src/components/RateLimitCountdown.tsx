
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface RateLimitCountdownProps {
  countdown: number;
  submissionsLeft: number;
  isHourBlock: boolean;
  formatCountdown: (seconds: number) => string;
}

const RateLimitCountdown: React.FC<RateLimitCountdownProps> = ({
  countdown,
  submissionsLeft,
  isHourBlock,
  formatCountdown
}) => {
  if (countdown <= 0 && (isHourBlock || submissionsLeft >= 5)) {
    return null;
  }

  return (
    <>
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
    </>
  );
};

export default RateLimitCountdown;
