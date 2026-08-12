import React from 'react';
import { Bell, Calendar, User, Menu, ShieldCheck, Volume2 } from 'lucide-react';
import { UserProfile, AlarmState } from '../types';

interface HeaderProps {
  profile: UserProfile;
  alarmState: AlarmState;
  activeTab: string;
  onOpenDrawer: () => void;
  onOpenOnboarding: () => void;
  onOpenSignUp: () => void;
  onTriggerTestAlarm: () => void;
  onSelectTab?: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  alarmState,
  activeTab,
  onOpenDrawer,
  onOpenOnboarding,
  onOpenSignUp,
  onTriggerTestAlarm,
  onSelectTab,
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
    <header className="sticky top-0 z-30 bg-[#E3EFE6]/95 backdrop-blur-md border-b border-[#C3DACB] px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Left: Brand Logo & Navigation Toggle */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          <button
            onClick={onOpenDrawer}
            className="p-2.5 rounded-xl bg-white text-[#1B2A23] hover:text-[#234E35] hover:bg-[#F2F8F4] border border-[#C3DACB] shadow-sm transition-all cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5 stroke-[2]" />
          </button>

          <div 
            onClick={() => onSelectTab && onSelectTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#234E35] text-white flex items-center justify-center shadow-sm group-hover:bg-[#1A3D28] transition-colors">
              <ShieldCheck className="w-5 h-5 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-[#1B2A23] font-sans">
                  Aeterna <span className="text-[#3B7A57] font-semibold">DosePact</span>
                </h1>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB]">
                  Protected
                </span>
              </div>
              <p className="text-xs text-[#557060] hidden sm:block font-medium">
                Stomach Safety & Photo-Verified Routine
              </p>
            </div>
          </div>
        </div>

        {/* Center: Live Time & Date Indicator */}
        <div className="hidden md:flex items-center space-x-3 bg-white px-4 py-2 rounded-xl border border-[#C3DACB] shadow-sm text-[#1B2A23]">
          <div className="flex items-center space-x-2 text-xs font-medium text-[#234E35]">
            <Calendar className="w-4 h-4 text-[#3B7A57]" />
            <span>{formattedDate}</span>
          </div>
          <div className="h-3.5 w-[1px] bg-[#C3DACB]" />
          <div className="text-xs font-bold text-[#234E35] font-mono">
            {formattedTime}
          </div>
        </div>

        {/* Right: Active Alarm Indicator, Test Trigger & User Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {alarmState.active && (
            <div className="flex items-center space-x-2 bg-[#FADEC9] text-[#E07A5F] border border-[#F5C29B] px-3 py-1.5 rounded-xl animate-pulse">
              <Bell className="w-4 h-4 text-[#E07A5F] animate-bounce" />
              <span className="text-xs font-bold uppercase tracking-wider">Alarm Ringing</span>
            </div>
          )}

          <button
            onClick={onTriggerTestAlarm}
            className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-[#1B2A23] hover:text-[#234E35] hover:bg-[#F2F8F4] border border-[#C3DACB] transition-all shadow-sm cursor-pointer"
            title="Simulate / Test Alarm Sound"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#3B7A57]" />
            <span className="hidden sm:inline">Test Sound</span>
          </button>

          <button
            onClick={onOpenSignUp}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-[#E3EFE6] hover:bg-[#C3DACB]/50 border border-[#C3DACB] text-[#1B2A23] font-bold text-xs transition-all shadow-sm cursor-pointer"
            title="Account Access"
          >
            <User className="w-3.5 h-3.5 text-[#3B7A57]" />
            <span className="hidden sm:inline">Account</span>
          </button>

          <button
            onClick={() => onSelectTab ? onSelectTab('profile') : onOpenOnboarding()}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F2F8F4] border border-[#C3DACB] text-[#1B2A23] transition-all shadow-sm cursor-pointer"
            title="View Settings & Profile"
          >
            <div className="w-8 h-8 rounded-lg bg-[#234E35] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              {profile.name ? profile.name.charAt(0) : 'A'}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-[#1B2A23] leading-none">
                {profile.name || 'User Profile'}
              </div>
              <div className="text-[10px] text-[#234E35] leading-tight mt-1 font-semibold truncate max-w-[110px]">
                {profile.stomachConditions?.length ? profile.stomachConditions[0] : 'Settings'}
              </div>
            </div>
          </button>
        </div>

      </div>
    </header>
  );
};
