import React, { useEffect, useState } from 'react';
import { Bell, Volume2, ShieldAlert, Camera, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlarmState, Medication, ScheduleSlot } from '../types';
import { alarmAudio } from '../utils/audioAlarm';
import { CameraVerification } from './CameraVerification';

interface AlarmModalProps {
  alarmState: AlarmState;
  onDismiss: (photoUrl: string, verificationDetails: any) => void;
  onSnooze: () => void;
  onCancelAlarm: () => void;
}

export const AlarmModal: React.FC<AlarmModalProps> = ({
  alarmState,
  onDismiss,
  onSnooze,
  onCancelAlarm,
}) => {
  const [showCamera, setShowCamera] = useState<boolean>(false);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  const slot = alarmState.scheduleSlot;
  const meds = alarmState.medications || [];

  // Start audio alarm and trigger escalation timer
  useEffect(() => {
    if (alarmState.isRinging) {
      alarmAudio.start(alarmState.escalationLevel);

      const timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
          // Escalate intensity after 12 seconds and 25 seconds
          if (next === 12 && alarmState.escalationLevel < 2) {
            alarmAudio.setEscalation(2);
          } else if (next === 25 && alarmState.escalationLevel < 3) {
            alarmAudio.setEscalation(3);
          }
          return next;
        });
      }, 1000);

      return () => {
        clearInterval(timer);
        alarmAudio.stop();
      };
    }
  }, [alarmState.isRinging, alarmState.escalationLevel]);

  if (!alarmState.active || !slot) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto">
        
        {/* Flashing Aqua Alert Border Effect */}
        <div className="absolute inset-0 pointer-events-none border-4 border-[#00CED1] animate-pulse opacity-60" />

        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-[#3D2B1F] border-2 border-[#00CED1] rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(0,206,209,0.35)] text-[#F5F5DC] relative overflow-hidden"
        >
          {/* Spine bar */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00CED1]" />

          {/* Header Alarm Icon & Status Badge */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#00CED1] to-[#40E0D0] flex items-center justify-center shadow-[0_0_30px_rgba(0,206,209,0.5)] animate-bounce text-[#1F140D]">
                <Bell className="w-10 h-10 stroke-[2.5]" />
              </div>
              <span className="absolute -top-1 -right-1 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-full bg-[#FF4500] text-white shadow-md">
                ACTIVE ALARM
              </span>
            </div>

            <h2 className="text-3xl font-serif italic text-[#F5F5DC]">
              {slot.label} • {slot.time}
            </h2>
            <p className="text-xs text-[#00CED1] mt-1 font-mono font-bold uppercase tracking-wider">
              PERSISTENT ALARM • PHOTO VERIFICATION REQUIRED
            </p>
          </div>

          {/* Escalation Intensity Alert Bar */}
          <div className="mb-6 p-3.5 rounded-2xl bg-[#1F140D] border border-[#00CED1]/20 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs">
              <Volume2 className="w-4 h-4 text-[#00CED1] animate-pulse" />
              <span className="text-[#F5F5DC]/80">Alarm Sound Intensity:</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#00CED1]/20 text-[#00CED1] border border-[#00CED1]/30 font-mono">
              Level {elapsedSeconds > 25 ? '3 (Critical)' : elapsedSeconds > 12 ? '2 (Urgent)' : '1 (Gentle)'}
            </span>
          </div>

          {/* Medications Scheduled to Take */}
          <div className="space-y-3 mb-6">
            <div className="text-xs font-bold text-[#00CED1] uppercase tracking-wider">
              Medications to Take Now ({meds.length})
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="p-4 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#F5F5DC]">{med.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#3D2B1F] text-[#00CED1] border border-[#00CED1]/20 font-mono font-bold">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-[#F5F5DC]/60 mt-1 font-serif italic">{med.instructions}</p>
                  </div>

                  {/* GI Risk Badge */}
                  {med.giRisk === 'high' && (
                    <div className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#FF4500]/20 border border-[#FF4500]/40 text-[#FF4500] text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3 text-[#FF4500]" />
                      <span>Take with food</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => setShowCamera(true)}
              className="w-full py-4 px-6 rounded-2xl bg-[#00CED1] text-[#1F140D] font-black text-base uppercase tracking-wider shadow-[0_8px_30px_rgba(0,206,209,0.4)] hover:bg-[#40E0D0] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2.5 cursor-pointer"
            >
              <Camera className="w-6 h-6" />
              <span>Take Photo to Dismiss Alarm</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSnooze}
                disabled={alarmState.snoozeCount >= alarmState.maxSnoozes}
                className={`py-3 px-4 rounded-2xl border font-semibold text-xs transition-all flex items-center justify-center space-x-2 ${
                  alarmState.snoozeCount >= alarmState.maxSnoozes
                    ? 'bg-[#1F140D] text-[#F5F5DC]/30 border-[#F5F5DC]/5 cursor-not-allowed'
                    : 'bg-[#1F140D] text-[#F5F5DC]/80 hover:bg-[#1F140D]/80 hover:text-[#F5F5DC] border-[#00CED1]/20'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  Snooze 5 Min ({alarmState.snoozeCount}/{alarmState.maxSnoozes})
                </span>
              </button>

              <button
                onClick={onCancelAlarm}
                className="py-3 px-4 rounded-2xl bg-[#FF4500]/20 text-[#FF4500] hover:bg-[#FF4500]/30 border border-[#FF4500]/40 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Emergency Stop</span>
              </button>
            </div>
          </div>

          {/* Security & Verification Disclaimer */}
          <div className="mt-5 text-center text-[11px] text-[#A89888] border-t border-[#3D2B1F] pt-3">
            Photo verification enforces strict compliance. Saved gallery images will be rejected.
          </div>
        </motion.div>

        {/* Camera Modal Overlay */}
        {showCamera && (
          <CameraVerification
            scheduleSlot={slot}
            medications={meds}
            onVerified={(photoUrl, verificationDetails) => {
              setShowCamera(false);
              alarmAudio.stop();
              onDismiss(photoUrl, verificationDetails);
            }}
            onCancel={() => setShowCamera(false)}
          />
        )}
      </div>
    </AnimatePresence>
  );
};
