import React, { useState } from 'react';
import { User, ShieldAlert, Bell, Camera, CheckCircle2, ArrowRight, Volume2, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { alarmAudio } from '../utils/audioAlarm';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (updatedProfile: UserProfile) => void;
}

const STOMACH_CONDITIONS_LIST = [
  'Acid Reflux / GERD',
  'Gastritis',
  'Peptic Ulcer History',
  'Sensitive Gastric Mucosa',
  'Irritable Bowel Syndrome (IBS)',
  'None / Healthy Stomach',
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form fields
  const [name, setName] = useState<string>(profile.name || 'Eleanor Vance');
  const [age, setAge] = useState<number>(profile.age || 48);
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    profile.stomachConditions || ['Acid Reflux / GERD']
  );
  const [physicianName, setPhysicianName] = useState<string>(profile.physicianName || 'Dr. Marcus Vance, M.D.');
  const [emergencyContact, setEmergencyContact] = useState<string>(profile.emergencyContact || '+1 (555) 392-8811');
  const [isTestPlaying, setIsTestPlaying] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleTestSound = () => {
    if (isTestPlaying) {
      alarmAudio.stop();
      setIsTestPlaying(false);
    } else {
      alarmAudio.start(1);
      setIsTestPlaying(true);
      setTimeout(() => {
        alarmAudio.stop();
        setIsTestPlaying(false);
      }, 3500);
    }
  };

  const handleFinish = () => {
    alarmAudio.stop();
    onSaveProfile({
      name,
      age: Number(age) || 30,
      stomachConditions: selectedConditions,
      physicianName,
      emergencyContact,
      onboardingCompleted: true,
    });
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xl bg-[#3D2B1F] border border-[#F5F5DC]/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-[#F5F5DC] space-y-6 relative overflow-hidden"
        >
          {/* Spine bar */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00CED1]" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#F5F5DC]/10 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00CED1]/20 border border-[#00CED1]/40 flex items-center justify-center text-[#00CED1]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-serif italic text-[#F5F5DC]">DosePact Setup & Profile</h3>
                <p className="text-xs text-[#F5F5DC]/60 mt-0.5">Step {step} of 3 • Custom Patient Configuration</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-[#F5F5DC]/40 hover:text-[#F5F5DC] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step 1: Medical Profile & Stomach Conditions */}
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#F5F5DC]">Patient Identity & GI Sensitivity</h4>
                <p className="text-xs text-[#F5F5DC]/60">
                  Specify stomach conditions to customize AI drug interaction safety warnings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#00CED1] mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#00CED1]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#00CED1] mb-1 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#00CED1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#00CED1] mb-1 uppercase tracking-wider">
                  Stomach & Digestive Conditions
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STOMACH_CONDITIONS_LIST.map((cond) => {
                    const isSelected = selectedConditions.includes(cond);
                    return (
                      <button
                        type="button"
                        key={cond}
                        onClick={() => toggleCondition(cond)}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#00CED1]/20 border-[#00CED1] text-[#00CED1]'
                            : 'bg-[#1F140D] border-[#F5F5DC]/10 text-[#F5F5DC]/60 hover:border-[#F5F5DC]/30'
                        }`}
                      >
                        <span>{cond}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#00CED1]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Emergency Contact & Physician */}
          {step === 2 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#F5F5DC]">Physician & Healthcare Provider Info</h4>
                <p className="text-xs text-[#F5F5DC]/60">
                  Used for exportable medical report headers and emergency contact alerts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#00CED1] mb-1 uppercase tracking-wider">Prescribing Physician</label>
                <input
                  type="text"
                  value={physicianName}
                  onChange={(e) => setPhysicianName(e.target.value)}
                  placeholder="e.g. Dr. Marcus Vance, M.D."
                  className="w-full p-3 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#00CED1]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#00CED1] mb-1 uppercase tracking-wider">Emergency Phone Number</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. +1 (555) 392-8811"
                  className="w-full p-3 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 text-sm text-[#F5F5DC] focus:outline-none focus:border-[#00CED1]"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Alarm Sound Test & Tutorial */}
          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#F5F5DC]">Persistent Alarm & Photo Tutorial</h4>
                <p className="text-xs text-[#F5F5DC]/60">
                  Test your web audio synthesizer and learn how the photo verification works.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1F140D] border border-[#00CED1]/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#00CED1]">
                    <Volume2 className="w-4 h-4" />
                    <span>Alarm Chime Sound Test</span>
                  </div>
                  <button
                    onClick={handleTestSound}
                    className="px-3.5 py-1.5 rounded-xl bg-[#00CED1] text-[#1F140D] font-extrabold text-xs uppercase tracking-wider hover:bg-[#40E0D0] cursor-pointer"
                  >
                    {isTestPlaying ? 'Stop Test' : 'Play Test Sound'}
                  </button>
                </div>
                <p className="text-xs text-[#F5F5DC]/70">
                  Alarms will ring continuously until you capture a fresh photo of your medication in hand.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 space-y-2 text-xs text-[#F5F5DC]/80">
                <div className="font-bold text-[#00CED1]">How Photo Verification Works:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li>Direct native camera stream captures pill in hand.</li>
                  <li>EXIF timestamp header validates capture date is today.</li>
                  <li>Gemini AI vision detects medication and logs dose.</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#F5F5DC]/10">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="py-2.5 px-5 rounded-xl bg-[#1F140D] text-[#F5F5DC]/80 border border-[#F5F5DC]/10 text-xs font-bold cursor-pointer hover:text-[#F5F5DC]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="py-2.5 px-6 rounded-xl bg-[#00CED1] text-[#1F140D] text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:bg-[#40E0D0]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="py-2.5 px-6 rounded-xl bg-[#00CED1] text-[#1F140D] text-xs font-black uppercase tracking-wider shadow-lg hover:bg-[#40E0D0] cursor-pointer"
              >
                Save & Complete Setup
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
