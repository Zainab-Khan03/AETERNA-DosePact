import React, { useEffect, useState } from 'react';
import { Bell, Volume2, ShieldAlert, Camera, Clock, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AlarmState } from '../types';
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

  useEffect(() => {
    if (alarmState.isRinging) {
      alarmAudio.start(alarmState.escalationLevel);

      const timer = setInterval(() => {
        setElapsedSeconds((prev) => {
          const next = prev + 1;
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
      <div className="fixed inset-0 z-50 bg-[#2D342E]/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-[#FAF6EE] border border-[#EBDEC0] rounded-3xl p-6 sm:p-8 shadow-2xl text-[#2D342E] relative overflow-hidden"
        >
          {/* Accent bar */}
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#768E78]" />

          {/* Header Alarm Icon & Status Badge */}
          <div className="flex flex-col items-center text-center mb-6 pl-2">
            <div className="relative mb-3">
              <div className="w-16 h-16 rounded-2xl bg-[#768E78] text-white flex items-center justify-center shadow-md animate-bounce">
                <Bell className="w-8 h-8 stroke-[2]" />
              </div>
              <span className="absolute -top-1 -right-1 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-[#E79897] text-white shadow-sm">
                ALARM
              </span>
            </div>

            <h2 className="text-2xl font-bold text-[#2D342E]">
              {slot.label} • {slot.time}
            </h2>
            <p className="text-xs text-[#768E78] mt-1 font-bold uppercase tracking-wider">
              Verification Required
            </p>
          </div>

          {/* Escalation Intensity Alert Bar */}
          <div className="mb-5 p-3 rounded-2xl bg-white border border-[#EBDEC0] flex items-center justify-between text-xs ml-2">
            <div className="flex items-center space-x-2 text-[#6B756C]">
              <Volume2 className="w-4 h-4 text-[#768E78] animate-pulse" />
              <span className="font-semibold">Alarm Volume Level:</span>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EBDEC0] text-[#2D342E] border border-[#C6C09C] font-mono">
              Level {elapsedSeconds > 25 ? '3 (Critical)' : elapsedSeconds > 12 ? '2 (Urgent)' : '1 (Standard)'}
            </span>
          </div>

          {/* Medications Scheduled to Take */}
          <div className="space-y-3 mb-6 ml-2">
            <div className="text-xs font-bold text-[#6B756C] uppercase tracking-wider">
              Scheduled Medications ({meds.length})
            </div>

            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {meds.map((med) => (
                <div
                  key={med.id}
                  className="p-3.5 rounded-2xl bg-white border border-[#EBDEC0] flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-bold text-[#2D342E]">{med.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-[#FAF6EE] text-[#768E78] border border-[#EBDEC0] font-mono font-bold">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-[#6B756C] mt-1 font-medium">{med.instructions}</p>
                  </div>

                  {med.giRisk === 'high' && (
                    <div className="shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#E79897]/20 border border-[#E79897] text-[#B95B5A] text-[10px] font-bold">
                      <AlertTriangle className="w-3 h-3" />
                      <span>With Food</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 ml-2">
            <button
              onClick={() => setShowCamera(true)}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#768E78] hover:bg-[#5C705E] text-white font-bold text-sm tracking-wide shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              <Camera className="w-5 h-5" />
              <span>Verify Dose with Photo</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={onSnooze}
                disabled={alarmState.snoozeCount >= alarmState.maxSnoozes}
                className={`py-3 px-4 rounded-2xl border font-bold text-xs transition-all flex items-center justify-center space-x-2 ${
                  alarmState.snoozeCount >= alarmState.maxSnoozes
                    ? 'bg-white text-[#6B756C]/40 border-[#EBDEC0] cursor-not-allowed'
                    : 'bg-white text-[#2D342E] hover:bg-[#EBDEC0]/40 border-[#EBDEC0] cursor-pointer'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>
                  Snooze ({alarmState.snoozeCount}/{alarmState.maxSnoozes})
                </span>
              </button>

              <button
                onClick={onCancelAlarm}
                className="py-3 px-4 rounded-2xl bg-[#E79897]/20 text-[#B95B5A] hover:bg-[#E79897]/30 border border-[#E79897] font-bold text-xs transition-colors flex items-center justify-center space-x-2 cursor-pointer"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Dismiss Alarm</span>
              </button>
            </div>
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
