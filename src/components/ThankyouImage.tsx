// src/components/ThankYouImage.tsx
import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, Heart, Sparkles, ShieldCheck } from 'lucide-react';

interface ThankYouImageProps {
  type?: 'dose_taken' | 'account_created' | 'profile_updated' | 'verification_complete';
  size?: 'sm' | 'md' | 'lg';
  showMessage?: boolean;
  message?: string;
  className?: string;
}

const configs = {
  dose_taken: {
    icon: CheckCircle2,
    color: '#3B7A57',
    bgColor: 'bg-[#E3EFE6]',
    defaultMessage: 'Dose Verified! ✅',
  },
  account_created: {
    icon: Heart,
    color: '#E07A5F',
    bgColor: 'bg-[#FADEC9]',
    defaultMessage: 'Welcome to DosePact! ❤️',
  },
  profile_updated: {
    icon: Sparkles,
    color: '#3B7A57',
    bgColor: 'bg-[#E3EFE6]',
    defaultMessage: 'Profile Updated! ✨',
  },
  verification_complete: {
    icon: ShieldCheck,
    color: '#234E35',
    bgColor: 'bg-[#E3EFE6]',
    defaultMessage: 'Verification Complete! 🛡️',
  },
};

const sizeClasses = {
  sm: 'w-16 h-16 text-2xl',
  md: 'w-24 h-24 text-3xl',
  lg: 'w-32 h-32 text-4xl',
};

export const ThankYouImage: React.FC<ThankYouImageProps> = ({
  type = 'dose_taken',
  size = 'md',
  showMessage = true,
  message,
  className = '',
}) => {
  const config = configs[type];
  const Icon = config.icon;
  const sizeClass = sizeClasses[size];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        damping: 20, 
        stiffness: 300,
        duration: 0.6 
      }}
      className={`flex flex-col items-center justify-center ${className}`}
    >
      {/* Animated Circle Background */}
      <motion.div
        className={`${config.bgColor} ${sizeClass} rounded-full flex items-center justify-center shadow-lg relative`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Icon 
          className="stroke-[2.5]"
          style={{ color: config.color }}
        />
        
        {/* Animated rings */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#3B7A57]/20"
          animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#3B7A57]/10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        />
      </motion.div>

      {/* Message */}
      {showMessage && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-center"
        >
          <p className="font-bold text-[#1B2A23] text-sm">
            {message || config.defaultMessage}
          </p>
          <p className="text-xs text-[#557060] mt-0.5 font-medium">
            AETERNA DosePact
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

// Success animation with confetti-like effect
export const SuccessAnimation: React.FC<{
  onComplete?: () => void;
  message?: string;
}> = ({ onComplete, message = 'Success!' }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B2A23]/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl"
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <ThankYouImage type="dose_taken" size="lg" />
        <h3 className="text-xl font-bold text-[#1B2A23] mt-4">
          {message}
        </h3>
        <p className="text-sm text-[#557060] mt-2">
          Your dose has been successfully verified and logged.
        </p>
      </motion.div>
    </motion.div>
  );
};