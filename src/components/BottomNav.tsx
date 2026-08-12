import React from 'react';
import { 
  LayoutDashboard, 
  Pill, 
  Calendar, 
  ShieldAlert, 
  BarChart3, 
  Settings 
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: LayoutDashboard,
    },
    {
      id: 'cabinet',
      label: 'Cabinet',
      icon: Pill,
    },
    {
      id: 'schedules',
      label: 'Schedule',
      icon: Calendar,
    },
    {
      id: 'warnings',
      label: 'Safety',
      icon: ShieldAlert,
    },
    {
      id: 'analytics',
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'profile',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#E3EFE6]/95 backdrop-blur-md border-t border-[#C3DACB] px-2 py-1.5 shadow-lg">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'profile' && activeTab === 'settings');

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[52px] ${
                isActive
                  ? 'text-[#1B2A23] bg-white font-bold scale-105 shadow-sm border border-[#C3DACB]'
                  : 'text-[#557060] hover:text-[#1B2A23]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-[#234E35]' : 'stroke-[1.75]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
