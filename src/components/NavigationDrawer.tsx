import React from 'react';
import { 
  X, 
  CalendarDays, 
  Pill, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Flame,
  ShieldAlert,
  Download,
  Trash2,
  Music
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  profile: UserProfile;
  adherencePercent: number;
  streakDays: number;
  onOpenDeleteAccount?: () => void;
  onOpenAlarmCustomizer?: () => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  profile,
  adherencePercent,
  streakDays,
  onOpenDeleteAccount,
  onOpenAlarmCustomizer,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Today\'s Schedule',
      subtitle: 'Daily timeline & dose alarms',
      icon: CalendarDays,
      badge: 'Live',
    },
    {
      id: 'cabinet',
      label: 'Medication Cabinet',
      subtitle: 'Categorized meds & GI risk tags',
      icon: Pill,
    },
    {
      id: 'schedules',
      label: 'Schedule Builder',
      subtitle: '15-min time slots & recurring setup',
      icon: Clock,
    },
    {
      id: 'warnings',
      label: 'Drug & Stomach Safety',
      subtitle: 'AI interaction & digestive checks',
      icon: AlertTriangle,
      badge: 'AI Powered',
    },
    {
      id: 'analytics',
      label: 'Adherence & Provider Export',
      subtitle: 'Charts, history & doctor report',
      icon: BarChart3,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Dark Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Book-like Layered Slide Drawer */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 bg-[#1F140D] border-r border-[#00CED1]/20 shadow-2xl flex flex-col justify-between overflow-hidden"
          >
            {/* Top Section */}
            <div>
              {/* Drawer Header */}
              <div className="p-6 flex items-center justify-between border-b border-[#00CED1]/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00CED1] to-[#40E0D0] flex items-center justify-center shadow-[0_0_15px_rgba(0,206,209,0.4)] text-[#1F140D]">
                    <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold tracking-tight text-[#00CED1]">AETERNA</h2>
                    <p className="text-xs text-[#F5F5DC]/60 font-serif italic">Adherence Engine</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#F5F5DC]/60 hover:text-[#00CED1] hover:bg-[#F5F5DC]/5 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Adherence Goal Progress Card */}
              <div className="p-5 m-4 rounded-2xl bg-gradient-to-br from-[#4A3728] to-[#1F140D] border border-[#00CED1]/10 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-[#00CED1] uppercase font-bold tracking-widest">Daily Adherence Goal</p>
                  <div className="flex items-center space-x-1 text-xs font-bold text-amber-400">
                    <Flame className="w-4 h-4 fill-amber-400" />
                    <span>{streakDays} Day Streak</span>
                  </div>
                </div>

                <div className="text-sm font-bold text-[#F5F5DC] mb-3">{profile.name}</div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="h-2 w-full bg-[#1F140D] rounded-full overflow-hidden border border-[#00CED1]/20">
                    <div
                      className="h-full bg-[#00CED1] shadow-[0_0_10px_#00CED1] transition-all duration-500"
                      style={{ width: `${adherencePercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#F5F5DC]/80 pt-1">
                    <span>Adherence Rate</span>
                    <span className="font-bold text-[#00CED1] font-mono">{adherencePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Menu Navigation Items */}
              <nav className="px-4 space-y-2 mt-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? 'bg-[#00CED1]/10 rounded-xl border-l-4 border-[#00CED1] text-[#00CED1] font-semibold'
                          : 'text-[#F5F5DC]/70 hover:bg-[#F5F5DC]/5 rounded-xl hover:text-[#F5F5DC]'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-[#00CED1]' : 'text-[#F5F5DC]/60 group-hover:text-[#00CED1]'}`} />
                        <div>
                          <div className="text-sm font-bold">{item.label}</div>
                          <div className="text-[11px] opacity-60 font-normal">{item.subtitle}</div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-[#00CED1]/20 text-[#00CED1] border border-[#00CED1]/30">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Footer Info & Action Buttons */}
            <div className="p-4 border-t border-[#00CED1]/10 bg-[#1F140D]/90 text-center space-y-2">
              {onOpenAlarmCustomizer && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAlarmCustomizer();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#00CED1]/15 hover:bg-[#00CED1]/25 border border-[#00CED1]/40 text-[#7FFFD4] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Music className="w-3.5 h-3.5 shrink-0 text-[#00CED1]" />
                  <span>Custom Alarm Music (MP3/WAV)</span>
                </button>
              )}

              {onOpenDeleteAccount && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDeleteAccount();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-[#FF4500]/15 hover:bg-[#FF4500]/25 border border-[#FF4500]/40 text-[#FF6347] font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0 text-[#FF4500]" />
                  <span>Delete Account (Zoho Email Confirmation)</span>
                </button>
              )}

              <div className="flex items-center justify-center space-x-2 text-xs text-[#00CED1] font-semibold">
                <ShieldAlert className="w-4 h-4" />
                <span>EXIF Photo Verified Guard</span>
              </div>
              <p className="text-[10px] text-[#F5F5DC]/40">
                AETERNA Adherence Engine • Patient-Centric Security
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
