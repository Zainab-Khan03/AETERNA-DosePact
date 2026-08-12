import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Play, ShieldCheck } from 'lucide-react';

interface LandingAnimationProps {
  onComplete: () => void;
}

export const LandingAnimation: React.FC<LandingAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'initial' | 'breathing' | 'expanding' | 'done'>('initial');

  useEffect(() => {
    // Phase timeline:
    // 0ms: initial rotation + glow start
    // 800ms: breathing pulse
    // 2100ms: expansion & fill
    // 2800ms: complete

    const t1 = setTimeout(() => setPhase('breathing'), 800);
    const t2 = setTimeout(() => setPhase('expanding'), 2100);
    const t3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') return null;

  return (
    <AnimatePresence>
      <motion.div
        key="landing-animation-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === 'expanding' ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: 'easeInOut' }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#E3EFE6] overflow-hidden select-none"
      >
        {/* Skip button in top right */}
        <button
          type="button"
          onClick={handleSkip}
          className="absolute top-6 right-6 z-20 px-4 py-2 rounded-full bg-white/80 hover:bg-white text-[#1B2A23] font-bold text-xs border border-[#C3DACB] backdrop-blur-md shadow-sm transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <span>Skip Intro</span>
          <Play className="w-3 h-3 fill-current" />
        </button>

        {/* Ambient Radial Glowing Aura */}
        <motion.div
          animate={{
            scale: phase === 'breathing' ? [1, 1.35, 1.15] : phase === 'expanding' ? [1.15, 8] : 1,
            opacity: phase === 'expanding' ? [0.6, 0] : [0.3, 0.6, 0.4],
          }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
          className="absolute w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-[#FEF08A]/40 via-[#BBF7D0]/40 to-[#FFEDD5]/40 blur-3xl pointer-events-none"
        />

        {/* Floating Rotating Pill Container */}
        <div className="relative z-10 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.6, opacity: 0, rotate: -45 }}
            animate={{
              scale: phase === 'expanding' ? 18 : phase === 'breathing' ? [1, 1.12, 1] : 1,
              rotate: phase === 'expanding' ? 360 : [0, 180, 360],
              opacity: phase === 'expanding' ? 0 : 1,
            }}
            transition={{
              duration: phase === 'expanding' ? 0.7 : 1.8,
              ease: phase === 'expanding' ? 'easeIn' : 'easeInOut',
            }}
            className="relative w-32 h-16 rounded-full shadow-lg p-1 flex items-center justify-between border-2 border-white/80 bg-gradient-to-r from-[#FEF08A] via-[#BBF7D0] to-[#BAE6FD]"
          >
            {/* Left Pill Half */}
            <div className="w-1/2 h-full rounded-l-full bg-white/90 backdrop-blur-sm flex items-center justify-center border-r border-[#C3DACB]/50">
              <ShieldCheck className="w-5 h-5 text-[#3B7A57]" />
            </div>

            {/* Right Pill Half */}
            <div className="w-1/2 h-full rounded-r-full bg-[#234E35] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 text-[#FEF08A]" />
            </div>
          </motion.div>

          {/* App Title Intro */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{
              opacity: phase === 'expanding' ? 0 : 1,
              y: phase === 'expanding' ? -20 : 0,
            }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 text-center"
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1B2A23] tracking-tight flex items-center justify-center space-x-2">
              <span>DOSEPACT</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3B7A57] text-white text-[11px] font-bold tracking-widest uppercase">
                AETERNA
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-[#557060] mt-1.5 tracking-wide">
              Smart Medication Adherence & GI Safety Suite
            </p>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
