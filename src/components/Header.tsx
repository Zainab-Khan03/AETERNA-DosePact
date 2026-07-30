import React from 'react';
import { Bell, Calendar, User, Menu, ShieldAlert, Volume2, Sparkles } from 'lucide-react';
import { UserProfile, AlarmState } from '../types';

interface HeaderProps {
  profile: UserProfile;
  alarmState: AlarmState;
  activeTab: string;
  onOpenDrawer: () => void;
  onOpenOnboarding: () => void;
  onOpenSignUp: () => void;
  onTriggerTestAlarm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  alarmState,
  activeTab,
  onOpenDrawer,
  onOpenOnboarding,
  onOpenSignUp,
  onTriggerTestAlarm,
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <header className="sticky top-0 z-30 bg-[#241710]/95 backdrop-blur-md border-b border-[#00CED1]/15 shadow-2xl px-4 lg:px-8 py-3 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Logo & Navigation Toggle */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenDrawer}
            className="p-2.5 rounded-xl bg-[#1F140D] text-[#00CED1] hover:bg-[#3D2B1F] border border-[#00CED1]/20 transition-all shadow-[0_0_10px_rgba(0,206,209,0.15)]"
            title="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00CED1] to-[#40E0D0] flex items-center justify-center shadow-[0_0_15px_rgba(0,206,209,0.4)] text-[#1F140D]">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold tracking-tight text-[#00CED1] font-sans">
                  AETERNA <span className="text-[#F5F5DC]/80 text-sm font-serif italic font-normal ml-1">DosePact</span>
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-widest rounded-full bg-[#00CED1]/10 text-[#00CED1] border border-[#00CED1]/30">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-[#F5F5DC]/60 hidden sm:block">
                Stomach Safety & Photo-Verified Adherence
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Time & Date Indicator */}
        <div className="hidden md:flex items-center space-x-4 bg-[#1F140D] px-5 py-2 rounded-2xl border border-[#00CED1]/15 shadow-inner">
          <div className="flex items-center space-x-2 text-xs text-[#F5F5DC]/90 font-serif italic">
            <Calendar className="w-4 h-4 text-[#00CED1]" />
            <span>{formattedDate}</span>
          </div>
          <div className="h-3.5 w-[1px] bg-[#00CED1]/20" />
          <div className="text-xs font-mono font-bold text-[#00CED1] tracking-wider">
            {formattedTime}
          </div>
        </div>

        {/* Right: Active Alarm Indicator, Test Trigger & User Profile */}
        <div className="flex items-center space-x-2.5">
          {alarmState.active && (
            <div className="flex items-center space-x-2 bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/40 px-3 py-1.5 rounded-xl animate-pulse">
              <Bell className="w-4 h-4 animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">Alarm Ringing!</span>
            </div>
          )}

          <button
            onClick={onTriggerTestAlarm}
            className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#1F140D] text-[#00CED1] hover:bg-[#00CED1]/10 border border-[#00CED1]/30 transition-all shadow-sm"
            title="Simulate / Test Medication Alarm"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#00CED1]" />
            <span className="hidden sm:inline">Test Alarm</span>
          </button>

          <button
            onClick={onOpenSignUp}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#00CED1]/15 hover:bg-[#00CED1]/25 border border-[#00CED1]/40 text-[#00CED1] font-bold text-xs transition-all shadow-[0_0_10px_rgba(0,206,209,0.2)]"
            title="Open Sign Up / Sign In Modal"
          >
            <User className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Up / In</span>
          </button>

          <button
            onClick={onOpenOnboarding}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-[#1F140D] hover:bg-[#3D2B1F] border border-[#00CED1]/20 text-[#F5F5DC] transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-[#00CED1]/15 flex items-center justify-center text-xs font-bold text-[#00CED1] border border-[#00CED1]/30 shadow-[0_0_10px_rgba(0,206,209,0.2)]">
              {profile.name ? profile.name.charAt(0) : 'A'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-[#F5F5DC] leading-none">
                {profile.name || 'User Profile'}
              </div>
              <div className="text-[10px] text-[#00CED1] leading-tight mt-1 uppercase font-semibold tracking-wider">
                {profile.stomachConditions?.length ? profile.stomachConditions[0] : 'Profile Settings'}
              </div>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};
