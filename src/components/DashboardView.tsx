import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Camera, 
  AlertCircle, 
  Flame, 
  Sparkles, 
  Calendar, 
  Plus, 
  ShieldCheck, 
  ChevronRight,
  TrendingUp,
  Pill
} from 'lucide-react';
import { motion } from 'motion/react';
import { ScheduleSlot, Medication, DoseLog } from '../types';

interface DashboardViewProps {
  schedules: ScheduleSlot[];
  medications: Medication[];
  logs: DoseLog[];
  onTriggerDoseVerification: (slot: ScheduleSlot) => void;
  onNavigateTab: (tab: string) => void;
  streakDays: number;
  adherencePercent: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schedules,
  medications,
  logs,
  onTriggerDoseVerification,
  onNavigateTab,
  streakDays,
  adherencePercent,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to get medication objects for a schedule
  const getMedsForSlot = (medIds: string[]): Medication[] => {
    return medications.filter((m) => medIds.includes(m.id));
  };

  // Helper to find today's log for a schedule slot
  const getLogForSlot = (scheduleId: string): DoseLog | undefined => {
    return logs.find((l) => l.scheduleId === scheduleId && l.date === todayStr);
  };

  const nextSlot = schedules.find((s) => !getLogForSlot(s.id)) || schedules[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Hero & Stat Grid matching Immersive UI Design */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Urgent Alert / Next Intake Hero Card */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#3D2B1F] rounded-3xl p-8 border border-[#F5F5DC]/5 shadow-xl relative overflow-hidden"
          >
            {/* Book Spine accent bar */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00CED1]" />

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-block px-3 py-1 rounded-md bg-[#FF4500]/20 text-[#FF4500] text-[10px] font-bold uppercase tracking-widest mb-2 border border-[#FF4500]/30">
                  Daily Intake Schedule
                </span>
                <h3 className="text-3xl font-serif italic text-[#F5F5DC]">
                  {nextSlot ? nextSlot.label : "Today's Intake"}
                </h3>
              </div>
              <div className="text-right">
                <p className="text-4xl font-mono text-[#00CED1] font-bold">{nextSlot ? nextSlot.time : '08:30'}</p>
                <p className="text-xs text-[#F5F5DC]/50 uppercase tracking-wider mt-0.5">Scheduled Slot</p>
              </div>
            </div>

            {/* List of Medications for next slot */}
            {nextSlot && (
              <div className="space-y-3 mb-8">
                {getMedsForSlot(nextSlot.medicationIds).map((med) => (
                  <div
                    key={med.id}
                    className="flex items-center justify-between p-4 bg-[#1F140D]/70 rounded-2xl border border-[#F5F5DC]/5"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#00CED1]/10 border border-[#00CED1]/20 flex items-center justify-center text-[#00CED1]">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#F5F5DC] text-sm">{med.name}</p>
                        <p className="text-xs text-[#F5F5DC]/50">{med.dosage} • {med.instructions}</p>
                      </div>
                    </div>
                    <span className="text-[#00CED1] font-mono text-xs font-bold uppercase px-2.5 py-1 rounded-lg bg-[#00CED1]/10">
                      {med.foodRequirement.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Action Button */}
            {nextSlot && (
              <button
                onClick={() => onTriggerDoseVerification(nextSlot)}
                className="w-full py-5 bg-[#00CED1] text-[#1F140D] hover:bg-[#40E0D0] rounded-2xl font-black text-sm uppercase tracking-wider shadow-[0_8px_30px_rgba(0,206,209,0.4)] hover:shadow-[0_12px_35px_rgba(0,206,209,0.6)] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Camera className="w-5 h-5" />
                <span>CAPTURE PHOTO TO DISMISS ALARM & LOG DOSE</span>
              </button>
            )}
          </motion.div>

          {/* Interaction Safety Prompt Banner */}
          <div
            onClick={() => onNavigateTab('warnings')}
            className="bg-[#4A3728] rounded-3xl p-6 border border-[#FF4500]/30 relative overflow-hidden cursor-pointer hover:border-[#FF4500]/60 transition-all group"
          >
            <div className="absolute -right-8 -bottom-8 opacity-10 text-[#FF4500]">
              <AlertCircle className="w-32 h-32" />
            </div>
            <h4 className="text-[#FF4500] font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Stomach Sensitivity & GI Guard
            </h4>
            <p className="text-sm text-[#F5F5DC] leading-relaxed max-w-xl">
              Active GI guard monitors <span className="font-bold text-[#00CED1]">NSAID + Aspirin/Steroid</span> risks and provides real-time meal buffering advice before intake.
            </p>
          </div>
        </div>

        {/* Right Column: Visualization & Stat Ring */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-[#1F140D] rounded-3xl p-6 border border-[#00CED1]/10 flex flex-col items-center justify-center text-center shadow-xl">
            <div className="relative w-40 h-40 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-[#F5F5DC]/10"/>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="263.8"
                  strokeDashoffset={`${263.8 - (263.8 * adherencePercent) / 100}`}
                  className="text-[#00CED1] transition-all duration-1000"
                  style={{ strokeLinecap: 'round' }}
                />
              </svg>
              <div>
                <p className="text-4xl font-serif italic font-bold text-[#F5F5DC]">{logs.length}</p>
                <p className="text-[10px] uppercase opacity-60 tracking-widest text-[#F5F5DC]">Verified Doses</p>
              </div>
            </div>
            <h5 className="text-[#00CED1] font-bold mb-1 flex items-center space-x-1">
              <Flame className="w-4 h-4 fill-[#00CED1]" />
              <span>Weekly Streak: {streakDays} Days</span>
            </h5>
            <p className="text-xs text-[#F5F5DC]/50 px-4">Keep taking verified photos to preserve your clinical log history.</p>
          </div>

          <div className="bg-[#3D2B1F] rounded-3xl p-6 border border-[#F5F5DC]/5 space-y-3">
            <h4 className="text-xs uppercase font-bold text-[#00CED1] tracking-wider">All Scheduled Time Slots</h4>
            <div className="space-y-2.5">
              {schedules.map((s) => {
                const log = getLogForSlot(s.id);
                const isTaken = log && log.status === 'taken';

                return (
                  <div key={s.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#1F140D]/60 border border-[#F5F5DC]/5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${isTaken ? 'bg-[#00CED1]' : 'bg-amber-500'}`} />
                      <span className="font-semibold text-[#F5F5DC]">{s.time} {s.label}</span>
                    </div>
                    {isTaken ? (
                      <span className="text-[10px] text-[#00CED1] font-bold uppercase">Verified ✓</span>
                    ) : (
                      <span className="text-[10px] text-[#F5F5DC]/40 uppercase">Pending</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Slot Cards Timeline */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#00CED1]" />
            <h3 className="text-xl font-serif italic text-[#F5F5DC]">All Schedule Slots</h3>
          </div>

          <button
            onClick={() => onNavigateTab('schedules')}
            className="flex items-center space-x-1 text-xs font-semibold text-[#00CED1] hover:text-[#40E0D0] transition-colors"
          >
            <span>Manage Slots</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {schedules.map((slot) => {
            const slotMeds = getMedsForSlot(slot.medicationIds);
            const log = getLogForSlot(slot.id);
            const isTaken = log && log.status === 'taken';

            return (
              <motion.div
                key={slot.id}
                whileHover={{ y: -2 }}
                className={`p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden ${
                  isTaken
                    ? 'bg-[#1F140D]/90 border-[#00CED1]/30 shadow-md'
                    : 'bg-[#3D2B1F] border-[#F5F5DC]/10 hover:border-[#00CED1]/40'
                }`}
              >
                {/* Accent spine */}
                <div className={`absolute top-0 left-0 w-1 h-full ${isTaken ? 'bg-[#00CED1]' : 'bg-[#F5F5DC]/20'}`} />

                <div className="flex flex-col justify-between space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1.5 rounded-xl bg-[#1F140D] border border-[#00CED1]/20 font-mono font-bold text-[#00CED1] text-sm">
                        {slot.time}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-[#F5F5DC]">{slot.label}</h4>
                        <p className="text-xs text-[#F5F5DC]/50">
                          {slotMeds.length} medication{slotMeds.length === 1 ? '' : 's'} assigned
                        </p>
                      </div>
                    </div>

                    {isTaken ? (
                      <span className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verified ✓</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/30 text-xs font-bold uppercase">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Pills List */}
                  <div className="flex flex-wrap gap-1.5">
                    {slotMeds.map((m) => (
                      <span
                        key={m.id}
                        className="px-3 py-1 rounded-xl bg-[#1F140D] border border-[#F5F5DC]/10 text-xs text-[#F5F5DC]/80 flex items-center space-x-1"
                      >
                        <Pill className="w-3 h-3 text-[#00CED1]" />
                        <span>{m.name} ({m.dosage})</span>
                      </span>
                    ))}
                  </div>

                  {/* Verification CTA */}
                  {!isTaken && (
                    <button
                      onClick={() => onTriggerDoseVerification(slot)}
                      className="w-full py-3 bg-[#00CED1] text-[#1F140D] rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#40E0D0] transition-all flex items-center justify-center space-x-2"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Photo Verification</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
