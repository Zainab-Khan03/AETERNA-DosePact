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
  const [emergencyContact, setEmergencyContact] = useState({
  name: profile.emergencyContact?.name || '',
  phone: profile.emergencyContact?.phone || '+1 (555) 392-8811',
  relation: profile.emergencyContact?.relation || '',
});
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
      <div className="fixed inset-0 z-50 bg-[#2D342E]/50 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-xl bg-[#FAF6EE] border border-[#EBDEC0] rounded-3xl p-6 sm:p-8 shadow-xl text-[#2D342E] space-y-6 relative overflow-hidden"
        >
          {/* Spine bar */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#768E78]" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EBDEC0] pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBDEC0] border border-[#C6C09C] flex items-center justify-center text-[#768E78]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#2D342E]">DosePact Setup & Profile</h3>
                <p className="text-xs text-[#6B756C] mt-0.5 font-semibold">Step {step} of 3 • Custom Patient Configuration</p>
              </div>
            </div>

            <button onClick={onClose} className="p-2 text-[#6B756C] hover:text-[#2D342E] cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step 1: Medical Profile & Stomach Conditions */}
          {step === 1 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#2D342E]">Patient Identity & GI Sensitivity</h4>
                <p className="text-xs text-[#6B756C] font-medium">
                  Specify stomach conditions to customize AI drug interaction safety warnings.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#6B756C] mb-1 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-white border border-[#EBDEC0] text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#6B756C] mb-1 uppercase tracking-wider">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full p-3 rounded-2xl bg-white border border-[#EBDEC0] text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B756C] mb-1 uppercase tracking-wider">
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
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-[#EBDEC0] border-[#C6C09C] text-[#2D342E]'
                            : 'bg-white border-[#EBDEC0] text-[#6B756C] hover:bg-[#FAF6EE]'
                        }`}
                      >
                        <span>{cond}</span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#768E78]" />}
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
                <h4 className="text-lg font-bold text-[#2D342E]">Physician & Healthcare Provider Info</h4>
                <p className="text-xs text-[#6B756C] font-medium">
                  Used for exportable medical report headers and emergency contact alerts.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B756C] mb-1 uppercase tracking-wider">Prescribing Physician</label>
                <input
                  type="text"
                  value={physicianName}
                  onChange={(e) => setPhysicianName(e.target.value)}
                  placeholder="e.g. Dr. Marcus Vance, M.D."
                  className="w-full p-3 rounded-2xl bg-white border border-[#EBDEC0] text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#6B756C] mb-1 uppercase tracking-wider">Emergency Phone Number</label>
                <input
                  type="text"
                  value={emergencyContact.phone}
                  onChange={(e) =>
                    setEmergencyContact({
                      ...emergencyContact,
                      phone: e.target.value,
                    })
                  }
                  placeholder="e.g. +1 (555) 392-8811"
                />
              </div>
            </motion.div>
          )}

          {/* Step 3: Alarm Sound Test & Tutorial */}
          {step === 3 && (
            <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-bold text-[#2D342E]">Persistent Alarm & Photo Tutorial</h4>
                <p className="text-xs text-[#6B756C] font-medium">
                  Test your web audio synthesizer and learn how the photo verification works.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EBDEC0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#768E78]">
                    <Volume2 className="w-4 h-4" />
                    <span>Alarm Chime Sound Test</span>
                  </div>
                  <button
                    onClick={handleTestSound}
                    className="px-3.5 py-1.5 rounded-xl bg-[#768E78] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C705E] cursor-pointer transition-colors"
                  >
                    {isTestPlaying ? 'Stop Test' : 'Play Test Sound'}
                  </button>
                </div>
                <p className="text-xs text-[#6B756C] font-medium">
                  Alarms will ring continuously until you capture a fresh photo of your medication in hand.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EBDEC0] space-y-2 text-xs text-[#6B756C]">
                <div className="font-bold text-[#2D342E]">How Photo Verification Works:</div>
                <ul className="list-disc list-inside space-y-1 font-medium">
                  <li>Direct native camera stream captures pill in hand.</li>
                  <li>EXIF timestamp header validates capture date is today.</li>
                  <li>Gemini AI vision detects medication and logs dose.</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EBDEC0]">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="py-2.5 px-5 rounded-xl bg-white text-[#2D342E] border border-[#EBDEC0] text-xs font-bold cursor-pointer hover:bg-[#FAF6EE]"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={() => setStep(step + 1)}
                className="py-2.5 px-6 rounded-xl bg-[#768E78] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer hover:bg-[#5C705E]"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="py-2.5 px-6 rounded-xl bg-[#768E78] text-white text-xs font-bold uppercase tracking-wider shadow-sm hover:bg-[#5C705E] cursor-pointer"
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
