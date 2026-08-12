import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  ShieldAlert, 
  HeartPulse, 
  CheckCircle2, 
  Save, 
  UserCheck, 
  BellRing,
  Stethoscope,
  Info,
  Sparkles,
  Volume2,
  Lock,
  Download,
  Trash2,
  LogOut,
  SlidersHorizontal,
  Settings,
  Palette,
  LayoutGrid,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface UserSettingsPageProps {
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
  onOpenDeleteAccount?: () => void;
  onOpenAlarmCustomizer?: () => void;
  onSignOut?: () => void;
}

const COMMON_GI_CONDITIONS = [
  'Acid Reflux / GERD',
  'Peptic Ulcer Disease',
  'NSAID Sensitivity',
  'Gastritis / Dyspepsia',
  'Sensitive Gastric Mucosa',
  'Irritable Bowel Syndrome (IBS)',
  'Inflammatory Bowel Disease (IBD)',
  'Celiac Disease',
  'None / Healthy Stomach',
];

export const UserSettingsPage: React.FC<UserSettingsPageProps> = ({
  profile,
  onSaveProfile,
  onOpenDeleteAccount,
  onOpenAlarmCustomizer,
  onSignOut,
}) => {
  const [formData, setFormData] = useState<UserProfile>({
    name: profile.name || '',
    email: profile.email || '',
    phoneNumber: profile.phoneNumber || '',
    age: profile.age || 30,
    stomachConditions: profile.stomachConditions || ['Acid Reflux / GERD'],
    physicianName: profile.physicianName || '',
    physicianPhone: profile.physicianPhone || '',
    emergencyContact: profile.emergencyContact || '',
    emergencyContactName: profile.emergencyContactName || profile.emergencyContact || '',
    emergencyContactPhone: profile.emergencyContactPhone || '',
    emergencyContactRelation: profile.emergencyContactRelation || 'Spouse / Partner',
    notifyEmergencyOnMissed: profile.notifyEmergencyOnMissed ?? true,
    notes: profile.notes || '',
    onboardingCompleted: profile.onboardingCompleted ?? true,
    themePreset: profile.themePreset || 'calm_sage',
    cardDensity: profile.cardDensity || 'standard',
    animationIntensity: profile.animationIntensity || 'normal',
    dashboardLayout: profile.dashboardLayout || 'bento',
    soundNotifications: profile.soundNotifications ?? true,
    vibrationNotifications: profile.vibrationNotifications ?? true,
    escalationTimeoutMinutes: profile.escalationTimeoutMinutes || 45,
    advanceReminderMinutes: profile.advanceReminderMinutes || 15,
    highContrastMode: profile.highContrastMode ?? false,
  });

  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [activeTabSection, setActiveTabSection] = useState<'all' | 'personal' | 'emergency' | 'gi_profile' | 'personalization' | 'security'>('all');

  const [passwordChangeRequested, setPasswordChangeRequested] = useState<boolean>(false);

  const handleToggleCondition = (condition: string) => {
    let updated = [...formData.stomachConditions];
    if (condition === 'None / Healthy Stomach') {
      updated = ['None / Healthy Stomach'];
    } else {
      updated = updated.filter((c) => c !== 'None / Healthy Stomach');
      if (updated.includes(condition)) {
        updated = updated.filter((c) => c !== condition);
      } else {
        updated.push(condition);
      }
    }
    if (updated.length === 0) {
      updated = ['None / Healthy Stomach'];
    }
    setFormData({ ...formData, stomachConditions: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const combinedEmergency = formData.emergencyContactName 
      ? `${formData.emergencyContactName}${formData.emergencyContactPhone ? ` (${formData.emergencyContactPhone})` : ''}`
      : formData.emergencyContact;

    const finalProfile: UserProfile = {
      ...formData,
      emergencyContact: combinedEmergency,
    };

    onSaveProfile(finalProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(formData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `dosepact_user_profile_${formData.name.toLowerCase().replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-white border border-[#C3DACB] p-6 lg:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-2xl bg-[#3B7A57] text-white flex items-center justify-center text-2xl lg:text-3xl font-bold shadow-sm">
                {formData.name ? formData.name.charAt(0) : 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#234E35] border-2 border-white flex items-center justify-center text-white">
                <Settings className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl lg:text-3xl font-bold text-[#1B2A23] tracking-tight">
                  User Settings & Profile
                </h2>
                <span className="px-3 py-1 text-xs font-bold tracking-wider rounded-full bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB]">
                  Patient Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#557060] mt-1 flex items-center space-x-2 font-medium">
                <Mail className="w-3.5 h-3.5 text-[#3B7A57]" />
                <span>{formData.email || 'No email registered'}</span>
                <span className="text-[#C3DACB]">•</span>
                <Phone className="w-3.5 h-3.5 text-[#3B7A57]" />
                <span>{formData.phoneNumber || 'No phone registered'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {onOpenAlarmCustomizer && (
              <button
                type="button"
                onClick={onOpenAlarmCustomizer}
                className="flex items-center space-x-2 px-4 py-3 rounded-2xl bg-[#F2F8F4] hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#1B2A23] font-bold text-xs transition-all cursor-pointer"
                title="Configure Medication Alarm Sounds & Tones"
              >
                <Volume2 className="w-4 h-4 text-[#3B7A57]" />
                <span className="hidden sm:inline">Alarm Tones</span>
              </button>
            )}

            <button
              onClick={handleSubmit}
              className="flex items-center space-x-2 px-6 py-3 rounded-2xl bg-[#234E35] hover:bg-[#1A3D28] text-white font-bold text-sm shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>Save Profile</span>
            </button>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-8 flex items-center space-x-2 border-t border-[#C3DACB] pt-5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'All Settings', icon: SlidersHorizontal },
            { id: 'personal', label: 'Personal Information', icon: User },
            { id: 'emergency', label: 'Emergency Contacts', icon: BellRing },
            { id: 'gi_profile', label: 'GI Safety Profile', icon: HeartPulse },
            { id: 'personalization', label: 'Personalization & Layout', icon: Palette },
            { id: 'security', label: 'Security & Account', icon: Lock },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTabSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTabSection(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#234E35] text-white shadow-sm'
                    : 'bg-[#F2F8F4] text-[#1B2A23] hover:bg-[#E3EFE6] border border-[#C3DACB]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Success Notification Banner */}
      <AnimatePresence>
        {savedSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#E3EFE6] border border-[#C3DACB] rounded-2xl p-4 flex items-center justify-between shadow-sm"
          >
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-[#3B7A57]" />
              <div>
                <div className="text-sm font-bold text-[#1B2A23]">
                  User Settings Saved Successfully
                </div>
                <div className="text-xs text-[#557060] font-medium">
                  Your updated profile, emergency contact rules, and GI settings are live.
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Personal Information */}
        {(activeTabSection === 'all' || activeTabSection === 'personal') && (
          <div className="bg-white border border-[#C3DACB] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C3DACB] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#E3EFE6] text-[#234E35]">
                  <UserCheck className="w-5 h-5 text-[#3B7A57]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A23]">Personal Information</h3>
                  <p className="text-xs text-[#557060] font-medium">Manage your legal name, contact numbers, and patient details</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#234E35] uppercase bg-[#E3EFE6] border border-[#C3DACB] px-2.5 py-1 rounded-full">
                Verified Profile
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#557060] absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                    placeholder="e.g. Eleanor Vance"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#557060] absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                    placeholder="patient@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Primary Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#557060] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="18"
                  max="120"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 18 })}
                  className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl px-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Emergency Contacts & Caregiver Escalation */}
        {(activeTabSection === 'all' || activeTabSection === 'emergency') && (
          <div className="bg-white border border-[#C3DACB] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C3DACB] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#E3EFE6] text-[#234E35]">
                  <BellRing className="w-5 h-5 text-[#3B7A57]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A23]">Emergency Contacts & Caregivers</h3>
                  <p className="text-xs text-[#557060] font-medium">Designate contacts notified during unacknowledged medication alarms</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#1B2A23] uppercase bg-[#FADEC9] border border-[#F5C29B] px-2.5 py-1 rounded-full flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3 text-[#E07A5F]" />
                <span>Caregiver Escalation</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Emergency Contact Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.emergencyContactName}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl px-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                  placeholder="e.g. Dr. Arthur Vance"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Emergency Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#557060] absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    required
                    value={formData.emergencyContactPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                    placeholder="+1 (555) 998-1244"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Relationship
                </label>
                <select
                  value={formData.emergencyContactRelation}
                  onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
                  className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl px-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                >
                  <option value="Spouse / Partner">Spouse / Partner</option>
                  <option value="Primary Physician">Primary Care Physician</option>
                  <option value="Parent / Guardian">Parent / Guardian</option>
                  <option value="Adult Child">Adult Child</option>
                  <option value="Caregiver / Nurse">Caregiver / Nurse</option>
                  <option value="Close Friend">Close Friend / Neighbor</option>
                </select>
              </div>
            </div>

            {/* Prescribing Physician Section */}
            <div className="pt-4 border-t border-[#C3DACB] grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2 flex items-center space-x-1.5">
                  <Stethoscope className="w-4 h-4 text-[#3B7A57]" />
                  <span>Prescribing Physician Name</span>
                </label>
                <input
                  type="text"
                  value={formData.physicianName}
                  onChange={(e) => setFormData({ ...formData, physicianName: e.target.value })}
                  className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl px-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                  placeholder="e.g. Dr. Marcus Vance, M.D."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#557060] mb-2">
                  Physician Clinic Phone
                </label>
                <input
                  type="tel"
                  value={formData.physicianPhone}
                  onChange={(e) => setFormData({ ...formData, physicianPhone: e.target.value })}
                  className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl px-4 py-3 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                  placeholder="+1 (555) 998-1244"
                />
              </div>
            </div>

            {/* Auto Notify Toggle */}
            <div className="bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-[#E3EFE6] text-[#234E35]">
                  <ShieldAlert className="w-5 h-5 text-[#3B7A57]" />
                </div>
                <div>
                  <div className="text-sm font-bold text-[#1B2A23]">
                    Emergency Alert Escalation
                  </div>
                  <div className="text-xs text-[#557060] font-medium">
                    Dispatches an alert to your emergency contact if a dose goes unverified 45 minutes after alarm.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, notifyEmergencyOnMissed: !formData.notifyEmergencyOnMissed })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                  formData.notifyEmergencyOnMissed ? 'bg-[#3B7A57]' : 'bg-[#C3DACB]'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    formData.notifyEmergencyOnMissed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* SECTION 3: GI & Stomach Health Profile */}
        {(activeTabSection === 'all' || activeTabSection === 'gi_profile') && (
          <div className="bg-white border border-[#C3DACB] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C3DACB] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#E3EFE6] text-[#234E35]">
                  <HeartPulse className="w-5 h-5 text-[#3B7A57]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A23]">GI & Stomach Sensitivities</h3>
                  <p className="text-xs text-[#557060] font-medium">
                    Configure gastrointestinal conditions for drug-food safety and stomach protection guidelines
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-[#234E35] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>GI Safeguards</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#557060] uppercase tracking-wider mb-3">
                Active Gastrointestinal Conditions:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {COMMON_GI_CONDITIONS.map((condition) => {
                  const isSelected = formData.stomachConditions.includes(condition);
                  return (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => handleToggleCondition(condition)}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#E3EFE6] border-[#C3DACB] text-[#1B2A23] shadow-sm'
                          : 'bg-[#F2F8F4] border-[#C3DACB] text-[#557060] hover:bg-[#E3EFE6]/50'
                      }`}
                    >
                      <span>{condition}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3B7A57] shrink-0 ml-2" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#557060] uppercase tracking-wider mb-2 flex items-center space-x-1">
                <Info className="w-3.5 h-3.5 text-[#3B7A57]" />
                <span>Special Food & Timing Notes</span>
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-3.5 text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] focus:bg-white transition-colors"
                placeholder="e.g. Must take Ibuprofen with milk. Sensitive stomach in the morning."
              />
            </div>
          </div>
        )}

        {/* SECTION 4: Personalization, Theme & Layout */}
        {(activeTabSection === 'all' || activeTabSection === 'personalization') && (
          <div className="bg-white border border-[#C3DACB] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C3DACB] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#E3EFE6] text-[#234E35]">
                  <Palette className="w-5 h-5 text-[#3B7A57]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A23]">Personalization & Accessibility</h3>
                  <p className="text-xs text-[#557060] font-medium">Customize theme palettes, layout density, animation intensity, and motion controls</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs text-[#234E35] font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tailored Design</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-bold text-[#557060] uppercase tracking-wider mb-3">
                  Color Theme Preset
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'calm_sage', label: 'Calm Sage & Cream', color: 'bg-[#E3EFE6] border-[#3B7A57]' },
                    { id: 'butter_yellow', label: 'Butter Yellow & Green', color: 'bg-[#FEF08A] border-[#EAB308]' },
                    { id: 'sunset_orange', label: 'Sunset Warmth', color: 'bg-[#FFEDD5] border-[#F97316]' },
                    { id: 'ocean_calm', label: 'Soft Ocean Blue', color: 'bg-[#BAE6FD] border-[#0284C7]' },
                  ].map((theme) => {
                    const isSelected = formData.themePreset === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, themePreset: theme.id as any })}
                        className={`p-3.5 rounded-2xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#E3EFE6] border-[#3B7A57] text-[#1B2A23] shadow-sm'
                            : 'bg-[#F2F8F4] border-[#C3DACB] text-[#557060] hover:bg-[#E3EFE6]/50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${theme.color} border border-black/10`} />
                          <span>{theme.label}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#3B7A57]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Card Density */}
              <div>
                <label className="block text-xs font-bold text-[#557060] uppercase tracking-wider mb-3">
                  Card Spacing & Layout Density
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'compact', label: 'Compact' },
                    { id: 'standard', label: 'Standard' },
                    { id: 'relaxed', label: 'Relaxed' },
                  ].map((density) => {
                    const isSelected = formData.cardDensity === density.id;
                    return (
                      <button
                        key={density.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, cardDensity: density.id as any })}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#234E35] text-white border-[#234E35]'
                            : 'bg-[#F2F8F4] text-[#1B2A23] border-[#C3DACB] hover:bg-[#E3EFE6]'
                        }`}
                      >
                        {density.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dashboard Layout Style */}
              <div>
                <label className="block text-xs font-bold text-[#557060] uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <LayoutGrid className="w-4 h-4 text-[#3B7A57]" />
                  <span>Dashboard View Structure</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'bento', label: 'Bento Grid' },
                    { id: 'timeline', label: 'Timeline' },
                    { id: 'compact_cards', label: 'List Cards' },
                  ].map((layout) => {
                    const isSelected = formData.dashboardLayout === layout.id;
                    return (
                      <button
                        key={layout.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, dashboardLayout: layout.id as any })}
                        className={`p-3 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#234E35] text-white border-[#234E35]'
                            : 'bg-[#F2F8F4] text-[#1B2A23] border-[#C3DACB] hover:bg-[#E3EFE6]'
                        }`}
                      >
                        {layout.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Motion & Reduced Motion Toggle */}
              <div>
                <label className="block text-xs font-bold text-[#557060] uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-[#3B7A57]" />
                  <span>Animation & Visual Feedback Intensity</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'reduced', label: 'Reduced' },
                    { id: 'subtle', label: 'Subtle' },
                    { id: 'normal', label: 'Normal' },
                    { id: 'high', label: 'Fluid' },
                  ].map((anim) => {
                    const isSelected = formData.animationIntensity === anim.id;
                    return (
                      <button
                        key={anim.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, animationIntensity: anim.id as any })}
                        className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#234E35] text-white border-[#234E35]'
                            : 'bg-[#F2F8F4] text-[#1B2A23] border-[#C3DACB] hover:bg-[#E3EFE6]'
                        }`}
                      >
                        {anim.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Notification & High Contrast Toggles */}
            <div className="pt-4 border-t border-[#C3DACB] grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#1B2A23]">High Contrast Color Scheme</div>
                  <p className="text-xs text-[#557060] font-medium">Increases text and border contrast for maximum readability</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, highContrastMode: !formData.highContrastMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.highContrastMode ? 'bg-[#3B7A57]' : 'bg-[#C3DACB]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.highContrastMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#1B2A23]">Audio & Haptic Reminders</div>
                  <p className="text-xs text-[#557060] font-medium">Play acoustic chime and haptic pulse on dose schedules</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, soundNotifications: !formData.soundNotifications })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                    formData.soundNotifications ? 'bg-[#3B7A57]' : 'bg-[#C3DACB]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.soundNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: Security, Export & Account Management */}
        {(activeTabSection === 'all' || activeTabSection === 'security') && (
          <div className="bg-white border border-[#C3DACB] rounded-3xl p-6 lg:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#C3DACB] pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-[#E3EFE6] text-[#234E35]">
                  <Lock className="w-5 h-5 text-[#3B7A57]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#1B2A23]">Account & Data Management</h3>
                  <p className="text-xs text-[#557060] font-medium">Security credentials, data export, and session settings</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Change Password Link */}
              <div className="bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-sm font-bold text-[#1B2A23] flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-[#3B7A57]" />
                    <span>Password & Credentials</span>
                  </div>
                  <p className="text-xs text-[#557060] mt-1 font-medium">
                    Send a password reset link to <span className="text-[#1B2A23] font-bold">{formData.email || 'registered email'}</span>.
                  </p>
                </div>

                {passwordChangeRequested ? (
                  <div className="text-xs font-bold text-[#1B2A23] bg-[#E3EFE6] p-2.5 rounded-xl border border-[#C3DACB] flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3B7A57]" />
                    <span>Reset instructions sent!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPasswordChangeRequested(true)}
                    className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#1B2A23] font-bold text-xs transition-colors cursor-pointer shadow-sm"
                  >
                    Send Password Reset Email
                  </button>
                )}
              </div>

              {/* Export Data */}
              <div className="bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="text-sm font-bold text-[#1B2A23] flex items-center space-x-2">
                    <Download className="w-4 h-4 text-[#3B7A57]" />
                    <span>Export Patient Records</span>
                  </div>
                  <p className="text-xs text-[#557060] mt-1 font-medium">
                    Download your profile, schedules, and adherence verification data in JSON format.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExportData}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#1B2A23] font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 text-[#3B7A57]" />
                  <span>Export Profile JSON Data</span>
                </button>
              </div>
            </div>

            {/* Account Danger Actions */}
            <div className="pt-4 border-t border-[#C3DACB] flex flex-col sm:flex-row items-center justify-between gap-4">
              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#F2F8F4] hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#1B2A23] font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              )}

              {onOpenDeleteAccount && (
                <button
                  type="button"
                  onClick={onOpenDeleteAccount}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#FADEC9] hover:bg-[#FADEC9]/80 border border-[#F5C29B] text-[#E07A5F] font-bold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Account</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Actions Footer */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-[#C3DACB]">
          <button
            type="button"
            onClick={() => setFormData(profile)}
            className="px-6 py-3 rounded-2xl bg-[#F2F8F4] hover:bg-[#E3EFE6] border border-[#C3DACB] text-[#1B2A23] font-semibold text-sm transition-colors cursor-pointer"
          >
            Reset Form
          </button>

          <button
            type="submit"
            className="flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-[#234E35] hover:bg-[#1A3D28] text-white font-bold text-sm shadow-sm transition-all transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4 stroke-[2.5]" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
