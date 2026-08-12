import React from 'react';
import { 
  X, 
  CalendarDays, 
  Pill, 
  Clock, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  Flame,
  ShieldCheck,
  Music,
  LogOut,
  Trash2
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
  onSignOut?: () => void;
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
  onSignOut,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Today\'s Routine',
      subtitle: 'Daily timeline & alarms',
      icon: CalendarDays,
      badge: 'Today',
    },
    {
      id: 'cabinet',
      label: 'Medication Cabinet',
      subtitle: 'Inventory & food rules',
      icon: Pill,
    },
    {
      id: 'schedules',
      label: 'Routine Schedule',
      subtitle: 'Custom dose times',
      icon: Clock,
    },
    {
      id: 'warnings',
      label: 'GI & Stomach Safety',
      subtitle: 'Sensitivities & interactions',
      icon: AlertTriangle,
      badge: 'Safety',
    },
    {
      id: 'analytics',
      label: 'Adherence Reports',
      subtitle: 'Compliance history & physician log',
      icon: BarChart3,
    },
    {
      id: 'profile',
      label: 'User Settings',
      subtitle: 'Profile, emergency contacts & security',
      icon: Settings,
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#1B2A23]/40 backdrop-blur-sm"
          />

          {/* Navigation Drawer Panel */}
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed top-0 left-0 bottom-0 z-50 w-80 sm:w-88 h-full bg-[#E3EFE6] border-r border-[#C3DACB] shadow-2xl flex flex-col justify-between text-[#1B2A23]"
          >
            {/* Scrollable Main Area */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-2 pb-4">
              {/* Drawer Header */}
              <div className="p-5 flex items-center justify-between border-b border-[#C3DACB] bg-white">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-[#234E35] text-white flex items-center justify-center shadow-sm">
                    <ShieldCheck className="w-5 h-5 stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-[#1B2A23]">Aeterna DosePact</h2>
                    <p className="text-[11px] text-[#234E35] font-bold tracking-wide uppercase">Patient Portal</p>
                  </div>
                </div>

                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#557060] hover:text-[#1B2A23] hover:bg-[#E3EFE6] transition-colors cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Patient Progress Card */}
              <div className="p-4 mx-4 mt-3 rounded-2xl bg-white border border-[#C3DACB] shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-[#234E35] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {profile.name ? profile.name.charAt(0) : 'P'}
                    </div>
                    <div className="truncate">
                      <div className="text-xs font-bold text-[#1B2A23] truncate">{profile.name || 'Patient Profile'}</div>
                      <div className="text-[10px] text-[#557060]">Adherence Summary</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 text-xs font-bold text-[#1B2A23] bg-[#FADEC9] border border-[#F5C29B] px-2 py-0.5 rounded-full shrink-0">
                    <Flame className="w-3.5 h-3.5 fill-[#E07A5F] text-[#E07A5F]" />
                    <span>{streakDays}d Streak</span>
                  </div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-[11px] text-[#557060] font-semibold">
                    <span>Adherence Rate</span>
                    <span className="font-bold text-[#234E35]">{adherencePercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-[#E3EFE6] rounded-full overflow-hidden border border-[#C3DACB]">
                    <div
                      className="h-full bg-[#3B7A57] transition-all duration-500 rounded-full"
                      style={{ width: `${adherencePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="px-3 space-y-1 mt-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'settings');

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all duration-150 group cursor-pointer ${
                        isActive
                          ? 'bg-white text-[#1B2A23] border border-[#C3DACB] font-bold shadow-sm'
                          : 'text-[#1B2A23] hover:bg-white/60'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className={`p-2 rounded-lg transition-colors ${
                          isActive ? 'bg-[#234E35] text-white' : 'bg-white text-[#3B7A57] border border-[#C3DACB] group-hover:bg-[#234E35] group-hover:text-white'
                        }`}>
                          <Icon className="w-4 h-4 stroke-[2]" />
                        </div>
                        <div className="truncate">
                          <div className="text-xs font-bold leading-tight">{item.label}</div>
                          <div className="text-[10px] text-[#557060] leading-tight mt-0.5 truncate">{item.subtitle}</div>
                        </div>
                      </div>

                      {item.badge && (
                        <span className={`shrink-0 ml-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
                          isActive 
                            ? 'bg-[#234E35] text-white border-[#234E35]' 
                            : 'bg-[#FADEC9] text-[#1B2A23] border-[#F5C29B]'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Footer Section */}
            <div className="p-4 border-t border-[#C3DACB] bg-white space-y-2">
              <div className="grid grid-cols-1 gap-1.5">
                {onOpenAlarmCustomizer && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAlarmCustomizer();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#F2F8F4] hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#234E35] font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                  >
                    <Music className="w-3.5 h-3.5 text-[#3B7A57]" />
                    <span>Alarm Sound Settings</span>
                  </button>
                )}

                {onSignOut && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onSignOut();
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-[#F2F8F4] hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#1B2A23] font-semibold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                )}

                {onOpenDeleteAccount && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenDeleteAccount();
                    }}
                    className="w-full py-1.5 px-3 text-[#E07A5F] hover:text-[#B95B5A] font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete Account</span>
                  </button>
                )}
              </div>

              <div className="pt-2 border-t border-[#C3DACB] flex items-center justify-between text-[10px] text-[#557060]">
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3 h-3 text-[#3B7A57]" />
                  <span>DosePact Guard</span>
                </span>
                <span>v2.4 Active</span>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
