// src/components/CTABanner.tsx
import React from 'react';
import { ShieldCheck, Camera, Bell, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';

interface CTABannerProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
  userName?: string;
}

export const CTABanner: React.FC<CTABannerProps> = ({
  onGetStarted,
  onLearnMore,
  userName = 'Patient',
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#234E35] via-[#1B2A23] to-[#2D342E] p-8 sm:p-12 shadow-2xl">
      {/* Background decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#3B7A57]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#E07A5F]/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      
      {/* Floating pill icons */}
      <div className="absolute top-4 right-8 opacity-10 text-6xl">💊</div>
      <div className="absolute bottom-8 left-12 opacity-10 text-4xl">💊</div>

      <div className="relative z-10">
        <div className="flex items-center space-x-2 mb-4">
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[#3B7A57]/30 text-[#E3EFE6] border border-[#3B7A57]/50">
            🚀 New Update
          </span>
          <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full bg-[#FADEC9]/20 text-[#FADEC9] border border-[#FADEC9]/30">
            Photo Verification
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
          <span className="block">Hello, {userName}! 👋</span>
          <span className="block text-[#E3EFE6] mt-2">
            Never Miss a Dose Again
          </span>
        </h2>

        <p className="mt-4 text-base sm:text-lg text-[#E3EFE6]/80 max-w-2xl leading-relaxed">
          AETERNA DosePact uses AI-powered photo verification and persistent alarms 
          to ensure you take your medications safely and on time.
        </p>

        {/* Feature highlights */}
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="flex items-center space-x-2 text-sm text-[#E3EFE6]/70">
            <Camera className="w-4 h-4 text-[#3B7A57]" />
            <span>Photo Verify</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-[#E3EFE6]/70">
            <Bell className="w-4 h-4 text-[#E07A5F]" />
            <span>Persistent Alarms</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-[#E3EFE6]/70">
            <ShieldCheck className="w-4 h-4 text-[#3B7A57]" />
            <span>GI Safety Engine</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onGetStarted}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="bg-white text-[#234E35] hover:bg-[#E3EFE6] shadow-lg hover:shadow-xl"
          >
            Start Your Routine
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={onLearnMore}
            className="border-white/30 text-white hover:bg-white/10 hover:border-white/60"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Learn More
          </Button>
        </div>

        {/* Trust badges */}
        <div className="mt-6 flex items-center space-x-6 text-xs text-[#E3EFE6]/60">
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57]" />
            <span>HIPAA Compliant</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57]" />
            <span>End-to-End Encrypted</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B7A57]" />
            <span>AI Verified</span>
          </span>
        </div>
      </div>
    </div>
  );
};