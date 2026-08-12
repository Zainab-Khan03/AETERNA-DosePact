// src/App.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  INITIAL_MEDICATIONS, 
  INITIAL_SCHEDULES, 
  INITIAL_USER_PROFILE, 
  INITIAL_LOGS 
} from './data/initialData';
import { 
  Medication, 
  ScheduleSlot, 
  DoseLog, 
  UserProfile, 
  AlarmState 
} from './types';
import { Header } from './components/Header';
import { NavigationDrawer } from './components/NavigationDrawer';
import { DashboardView } from './components/DashboardView';
import { MedicationCabinet } from './components/MedicationCabinet';
import { ScheduleBuilder } from './components/ScheduleBuilder';
import { InteractionWarnings } from './components/InteractionWarnings';
import { AnalyticsView } from './components/AnalyticsView';
import { AlarmModal } from './components/AlarmModal';
import { CameraVerification } from './components/CameraVerification';
import { OnboardingWizard } from './components/OnboardingWizard';
import { SignUpModal } from './components/SignUpModal';
import { DeleteAccountModal } from './components/DeleteAccountModal';
import { AlarmCustomizerModal } from './components/AlarmCustomizerModal';
import { UserSettingsPage } from './components/UserSettingsPage';
import { BottomNav } from './components/BottomNav';
import { LandingAnimation } from './components/LandingAnimation';
import { alarmAudio } from './utils/audioAlarm';
import { PhotoVerificationDetails } from './types';

export default function App() {
  // Session Landing Animation State
  const [showLandingAnim, setShowLandingAnim] = useState<boolean>(() => {
    const seen = sessionStorage.getItem('dosepact_seen_landing');
    return !seen;
  });

  // Application Data State (with localStorage persistence)
  const [medications, setMedications] = useState<Medication[]>(() => {
    const saved = localStorage.getItem('dosepact_meds');
    return saved ? JSON.parse(saved) : INITIAL_MEDICATIONS;
  });

  const [schedules, setSchedules] = useState<ScheduleSlot[]>(() => {
    const saved = localStorage.getItem('dosepact_schedules');
    return saved ? JSON.parse(saved) : INITIAL_SCHEDULES;
  });

  const [logs, setLogs] = useState<DoseLog[]>(() => {
    const saved = localStorage.getItem('dosepact_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dosepact_profile');
    return saved ? JSON.parse(saved) : INITIAL_USER_PROFILE;
  });

  // UI Navigation State
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  
  // Persist sign up / authentication state across page refreshes
  const [isSignUpOpen, setIsSignUpOpen] = useState<boolean>(() => {
    const token = localStorage.getItem('dosepact_token');
    const savedProfile = localStorage.getItem('dosepact_profile');
    if (token) return false;
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed && (parsed.email || parsed.name)) {
          return false;
        }
      } catch (e) {
        // ignore
      }
    }
    return false;
  });

  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState<boolean>(false);
  const [isAlarmCustomizerOpen, setIsAlarmCustomizerOpen] = useState<boolean>(false);
  const [activeVerificationSlot, setActiveVerificationSlot] = useState<ScheduleSlot | null>(null);

  // Active Persistent Alarm State
  const [alarmState, setAlarmState] = useState<AlarmState>({
    active: false,
    escalationLevel: 1,
    snoozeCount: 0,
    maxSnoozes: 2,
    isRinging: false,
  });

  // ============================================================
  // HANDLERS
  // ============================================================

  // Sign Up Success Handler
  const handleSignUpSuccess = (updatedProfile: UserProfile, token: string) => {
    setProfile(updatedProfile);
    localStorage.setItem('dosepact_token', token);
    localStorage.setItem('dosepact_profile', JSON.stringify(updatedProfile));
    if (updatedProfile.id) {
      localStorage.setItem('dosepact_user_id', updatedProfile.id);
    }
    setIsSignUpOpen(false);
  };

  // Sign Out Handler
  const handleSignOut = () => {
    localStorage.removeItem('dosepact_token');
    localStorage.removeItem('dosepact_profile');
    localStorage.removeItem('dosepact_user_id');
    setProfile({
      name: 'Guest Patient',
      email: '',
      phoneNumber: '',
      age: 30,
      stomachConditions: ['None / Healthy Stomach'],
      physicianName: '',
      physicianPhone: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
      onboardingCompleted: false,
    });
    setIsSignUpOpen(true);
  };

  // Account Deleted Handler
  const handleAccountDeleted = () => {
    localStorage.removeItem('dosepact_token');
    localStorage.removeItem('dosepact_profile');
    localStorage.removeItem('dosepact_user_id');
    setProfile({
      name: 'Guest Patient',
      email: '',
      phoneNumber: '',
      age: 30,
      stomachConditions: ['None / Healthy Stomach'],
      physicianName: '',
      physicianPhone: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: '',
      },
      onboardingCompleted: false,
    });
    setIsSignUpOpen(true);
  };

  // Save Profile Handler
  const handleSaveProfile = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem('dosepact_profile', JSON.stringify(updatedProfile));
  };

  // ============================================================
  // SAVE TO LOCALSTORAGE
  // ============================================================

  useEffect(() => {
    localStorage.setItem('dosepact_meds', JSON.stringify(medications));
  }, [medications]);

  useEffect(() => {
    localStorage.setItem('dosepact_schedules', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('dosepact_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('dosepact_profile', JSON.stringify(profile));
  }, [profile]);

  // ============================================================
  // SCHEDULE MONITOR
  // ============================================================

  useEffect(() => {
    const checkScheduleTimes = () => {
      if (alarmState.active) return;

      const now = new Date();
      const currentHH = now.getHours().toString().padStart(2, '0');
      const currentMM = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHH}:${currentMM}`;
      const todayDateStr = now.toISOString().split('T')[0];

      const matchingSlot = schedules.find((slot) => {
        if (!slot.isEnabled) return false;
        if (slot.time !== currentTimeStr) return false;

        const alreadyTaken = logs.some(
          (l) => l.scheduleId === slot.id && l.date === todayDateStr && l.status === 'taken'
        );
        return !alreadyTaken;
      });

      if (matchingSlot) {
        const slotMeds = medications.filter((m) => matchingSlot.medicationIds.includes(m.id));
        setAlarmState({
          active: true,
          scheduleSlot: matchingSlot,
          medications: slotMeds,
          startedAt: now.toISOString(),
          escalationLevel: 1,
          snoozeCount: 0,
          maxSnoozes: 2,
          isRinging: true,
        });
      }
    };

    const timer = setInterval(checkScheduleTimes, 15000);
    return () => clearInterval(timer);
  }, [schedules, logs, alarmState.active, medications]);

  // ============================================================
  // ALARM HANDLERS
  // ============================================================

  const handleTriggerTestAlarm = () => {
    if (schedules.length === 0) return;
    const testSlot = schedules[0];
    const testMeds = medications.filter((m) => testSlot.medicationIds.includes(m.id));

    setAlarmState({
      active: true,
      scheduleSlot: testSlot,
      medications: testMeds,
      startedAt: new Date().toISOString(),
      escalationLevel: 1,
      snoozeCount: 0,
      maxSnoozes: 2,
      isRinging: true,
    });
  };

  const handleDismissAlarm = (photoUrl: string, verificationDetails: PhotoVerificationDetails) => {
    alarmAudio.stop();

    if (alarmState.scheduleSlot) {
      const slot = alarmState.scheduleSlot;
      const todayStr = new Date().toISOString().split('T')[0];

      const newLog: DoseLog = {
        id: `log-${Date.now()}`,
        scheduleId: slot.id,
        scheduleLabel: slot.label,
        scheduledTime: slot.time,
        date: todayStr,
        medicationsTaken: (alarmState.medications || []).map((m) => ({
          medicationId: m.id,
          name: m.name,
          dosage: m.dosage,
        })),
        takenAt: new Date().toISOString(),
        status: 'taken',
        photoUrl,
        photoVerified: true,
        exifTimestamp: new Date().toISOString(),
        verificationDetails,
      };

      setLogs((prev) => [newLog, ...prev]);
    }

    setAlarmState({
      active: false,
      escalationLevel: 1,
      snoozeCount: 0,
      maxSnoozes: 2,
      isRinging: false,
    });
  };

  const handleSnoozeAlarm = () => {
    alarmAudio.stop();
    const nextSnoozeCount = alarmState.snoozeCount + 1;

    setAlarmState((prev) => ({
      ...prev,
      active: false,
      isRinging: false,
      snoozeCount: nextSnoozeCount,
    }));

    setTimeout(() => {
      setAlarmState((prev) => ({
        ...prev,
        active: true,
        isRinging: true,
        escalationLevel: 2,
      }));
    }, 180000);
  };

  const handleCancelAlarm = () => {
    alarmAudio.stop();
    setAlarmState({
      active: false,
      escalationLevel: 1,
      snoozeCount: 0,
      maxSnoozes: 2,
      isRinging: false,
    });
  };

  // ============================================================
  // DOSE VERIFICATION HANDLERS
  // ============================================================

  const handleTriggerDoseVerification = (slot: ScheduleSlot) => {
    setActiveVerificationSlot(slot);
  };

  const handleDashboardPhotoVerified = (photoUrl: string, verificationDetails: PhotoVerificationDetails) => {
    if (!activeVerificationSlot) return;
    const slot = activeVerificationSlot;
    const todayStr = new Date().toISOString().split('T')[0];
    const slotMeds = medications.filter((m) => slot.medicationIds.includes(m.id));

    const newLog: DoseLog = {
      id: `log-${Date.now()}`,
      scheduleId: slot.id,
      scheduleLabel: slot.label,
      scheduledTime: slot.time,
      date: todayStr,
      medicationsTaken: slotMeds.map((m) => ({
        medicationId: m.id,
        name: m.name,
        dosage: m.dosage,
      })),
      takenAt: new Date().toISOString(),
      status: 'taken',
      photoUrl,
      photoVerified: true,
      exifTimestamp: new Date().toISOString(),
      verificationDetails,
    };

    setLogs((prev) => [newLog, ...prev]);
    setActiveVerificationSlot(null);
  };

  // ============================================================
  // MEDICATION CRUD
  // ============================================================

  const handleAddMedication = (newMed: Omit<Medication, 'id'>) => {
    const created: Medication = {
      ...newMed,
      id: `med-${Date.now()}`,
    };
    setMedications((prev) => [...prev, created]);
  };

  const handleDeleteMedication = (id: string) => {
    setMedications((prev) => prev.filter((m) => m.id !== id));
  };

  // ============================================================
  // SCHEDULE CRUD
  // ============================================================

  const handleAddSchedule = (newSlot: Omit<ScheduleSlot, 'id'>) => {
    const created: ScheduleSlot = {
      ...newSlot,
      id: `sched-${Date.now()}`,
    };
    setSchedules((prev) => [...prev, created]);
  };

  const handleUpdateSchedule = (id: string, updated: Partial<ScheduleSlot>) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updated } : s))
    );
  };

  const handleDeleteSchedule = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  // ============================================================
  // STATS
  // ============================================================

  const adherencePercent = logs.length > 0 ? 96 : 100;
  const streakDays = 5;

  // ============================================================
  // RENDER
  // ============================================================

  // Dedicated Full Page Sign Up / Sign In Screen
  if (isSignUpOpen) {
    return (
      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSignUpSuccess={handleSignUpSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#E3EFE6] text-[#1B2A23] font-sans selection:bg-[#768E78] selection:text-white relative overflow-x-hidden">
      
      {/* Background Parallax Light Ambient Tinted Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#768E78]/12 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-10 w-[450px] h-[450px] bg-[#3B7A57]/10 rounded-full blur-3xl" />
      </div>

      {/* Persistent App Header */}
      <Header
        profile={profile}
        alarmState={alarmState}
        activeTab={activeTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenSignUp={() => setIsSignUpOpen(true)}
        onTriggerTestAlarm={handleTriggerTestAlarm}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-12">
        {/* Book-like Page Turn Animate Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, rotateY: -4, x: 15 }}
            animate={{ opacity: 1, rotateY: 0, x: 0 }}
            exit={{ opacity: 0, rotateY: 4, x: -15 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                schedules={schedules}
                medications={medications}
                logs={logs}
                onTriggerDoseVerification={handleTriggerDoseVerification}
                onNavigateTab={(tab) => setActiveTab(tab)}
                streakDays={streakDays}
                adherencePercent={adherencePercent}
                profile={profile}
              />
            )}

            {activeTab === 'cabinet' && (
              <MedicationCabinet
                medications={medications}
                onAddMedication={handleAddMedication}
                onDeleteMedication={handleDeleteMedication}
              />
            )}

            {activeTab === 'schedules' && (
              <ScheduleBuilder
                schedules={schedules}
                medications={medications}
                onAddSchedule={handleAddSchedule}
                onUpdateSchedule={handleUpdateSchedule}
                onDeleteSchedule={handleDeleteSchedule}
              />
            )}

            {activeTab === 'warnings' && (
              <InteractionWarnings
                medications={medications}
                profile={profile}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsView
                logs={logs}
                profile={profile}
                medications={medications}
                adherencePercent={adherencePercent}
                streakDays={streakDays}
              />
            )}

            {(activeTab === 'profile' || activeTab === 'settings') && (
              <UserSettingsPage
                profile={profile}
                onSaveProfile={handleSaveProfile}
                onOpenDeleteAccount={() => setIsDeleteAccountOpen(true)}
                onOpenAlarmCustomizer={() => setIsAlarmCustomizerOpen(true)}
                onSignOut={handleSignOut}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Slide Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        profile={profile}
        adherencePercent={adherencePercent}
        streakDays={streakDays}
        onOpenDeleteAccount={() => setIsDeleteAccountOpen(true)}
        onOpenAlarmCustomizer={() => setIsAlarmCustomizerOpen(true)}
        onSignOut={handleSignOut}
      />

      {/* Persistent Alarm Modal */}
      <AlarmModal
        alarmState={alarmState}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onCancelAlarm={handleCancelAlarm}
      />

      {/* Dashboard Verification Camera Modal */}
      {activeVerificationSlot && (
        <CameraVerification
          scheduleSlot={activeVerificationSlot}
          medications={medications.filter((m) => activeVerificationSlot.medicationIds.includes(m.id))}
          onVerified={handleDashboardPhotoVerified}
          onCancel={() => setActiveVerificationSlot(null)}
        />
      )}

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        profile={profile}
        onSaveProfile={(updated) => setProfile(updated)}
      />

      {/* Account Deletion Double Confirmation Modal */}
      <DeleteAccountModal
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        profile={profile}
        onAccountDeleted={handleAccountDeleted}
      />

      {/* Alarm Sound Customizer Modal */}
      <AlarmCustomizerModal
        isOpen={isAlarmCustomizerOpen}
        onClose={() => setIsAlarmCustomizerOpen(false)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* Opening Session Landing Animation */}
      {showLandingAnim && (
        <LandingAnimation
          onComplete={() => {
            sessionStorage.setItem('dosepact_seen_landing', 'true');
            setShowLandingAnim(false);
          }}
        />
      )}
    </div>
  );
}