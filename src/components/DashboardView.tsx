// src/components/DashboardView.tsx
import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Camera, 
  Flame, 
  ChevronRight,
  Pill,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  CalendarCheck,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { ScheduleSlot, Medication, DoseLog, UserProfile } from '../types';
import { CTABanner } from './CTABanner';

interface DashboardViewProps {
  schedules: ScheduleSlot[];
  medications: Medication[];
  logs: DoseLog[];
  onTriggerDoseVerification: (slot: ScheduleSlot) => void;
  onNavigateTab: (tab: string) => void;
  streakDays: number;
  adherencePercent: number;
  profile?: UserProfile;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  schedules,
  medications,
  logs,
  onTriggerDoseVerification,
  onNavigateTab,
  streakDays,
  adherencePercent,
  profile,
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
  const recentVerifiedLogs = logs.filter((l) => l.photoUrl).slice(0, 3);

  return (
    <div className="space-y-8 pb-12">
      {/* CTA Banner Above the Fold */}
      <CTABanner
        onGetStarted={() => onNavigateTab('cabinet')}
        onLearnMore={() => onNavigateTab('warnings')}
        userName={profile?.name || 'Patient'}
      />

      {/* Bento Grid Header Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Bento Card (7 cols): Primary Next Intake Hero */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-white rounded-3xl p-6 sm:p-8 border border-[#C3DACB] shadow-sm relative overflow-hidden group">
          {/* Subtle accent bar in Fern green */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#3B7A57]" />

          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#E3EFE6] text-[#234E35] text-xs font-bold border border-[#C3DACB] mb-2">
                  <Clock className="w-3.5 h-3.5 text-[#3B7A57]" />
                  <span>Next Scheduled Intake</span>
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A23] tracking-tight">
                  {nextSlot ? nextSlot.label : "Today's Intake"}
                </h2>
              </div>

              <div className="text-left sm:text-right bg-[#E3EFE6]/60 px-4 py-2.5 rounded-2xl border border-[#C3DACB]">
                <p className="text-2xl sm:text-3xl font-bold font-mono text-[#234E35]">{nextSlot ? nextSlot.time : '08:30'}</p>
                <p className="text-[11px] text-[#557060] font-bold">Scheduled Time</p>
              </div>
            </div>

            {/* List of Medications for next slot */}
            {nextSlot && (
              <div className="space-y-3 mb-6">
                {getMedsForSlot(nextSlot.medicationIds).map((med) => (
                  <div
                    key={med.id}
                    className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#F2F8F4] rounded-2xl border border-[#C3DACB] hover:bg-[#E3EFE6] transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-[#3B7A57] text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1B2A23] text-sm">{med.name}</p>
                        <p className="text-xs text-[#557060] font-medium">{med.dosage} • {med.instructions}</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#1B2A23] px-3 py-1 rounded-xl bg-[#FADEC9] border border-[#F5C29B]">
                      {med.foodRequirement ? med.foodRequirement.replace('_', ' ') : 'With Meal'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Button */}
          {nextSlot && (
            <button
              onClick={() => onTriggerDoseVerification(nextSlot)}
              className="w-full py-4 px-6 bg-[#234E35] hover:bg-[#1A3D28] text-white rounded-2xl font-bold text-sm tracking-wide shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer transform active:scale-[0.99]"
            >
              <Camera className="w-5 h-5 stroke-[2.5]" />
              <span>Take Photo to Verify Dose & Clear Alarm</span>
            </button>
          )}
        </div>

        {/* Right Bento Card (5 cols): Routine Adherence Gauge & Flame Streak */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#C3DACB] flex flex-col items-center justify-center text-center shadow-sm relative overflow-hidden">
            <div className="relative w-36 h-36 flex items-center justify-center mb-4">
              <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" stroke="#E3EFE6" strokeWidth="8" fill="transparent"/>
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="#3B7A57"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray="263.8"
                  strokeDashoffset={`${263.8 - (263.8 * adherencePercent) / 100}`}
                  className="transition-all duration-1000"
                  style={{ strokeLinecap: 'round' }}
                />
              </svg>
              <div>
                <p className="text-3xl font-bold text-[#1B2A23] font-mono">{adherencePercent}%</p>
                <p className="text-[10px] uppercase font-bold text-[#557060] tracking-wider">Compliance Rate</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-xs font-bold text-[#1B2A23] bg-[#FADEC9] px-4 py-1.5 rounded-full border border-[#F5C29B] mb-2 shadow-sm">
              <Flame className="w-4 h-4 fill-[#E07A5F] text-[#E07A5F]" />
              <span>{streakDays} Day Routine Streak</span>
            </div>
            <p className="text-xs text-[#557060] px-2 font-medium">Consistent photo verification keeps your physician log accurate.</p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#C3DACB] space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-[#557060] tracking-wider">Today's Schedule Summary</h3>
              <span className="text-[11px] font-bold text-[#234E35] bg-[#E3EFE6] px-2.5 py-0.5 rounded-md border border-[#C3DACB]">
                {schedules.length} Slots
              </span>
            </div>

            <div className="space-y-2">
              {schedules.map((s) => {
                const log = getLogForSlot(s.id);
                const isTaken = log && log.status === 'taken';

                return (
                  <div key={s.id} className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F2F8F4] border border-[#C3DACB]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${isTaken ? 'bg-[#3B7A57]' : 'bg-[#E07A5F]'}`} />
                      <span className="font-bold text-[#1B2A23]">{s.time} {s.label}</span>
                    </div>
                    {isTaken ? (
                      <span className="text-[11px] text-[#234E35] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#3B7A57]" />
                        <span>Verified</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#557060] font-semibold">Scheduled</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Stomach GI Protection Advisory Banner Card */}
      <div
        onClick={() => onNavigateTab('warnings')}
        className="bg-white hover:bg-[#F2F8F4] rounded-3xl p-6 border border-[#C3DACB] relative overflow-hidden cursor-pointer transition-all group shadow-sm"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB] shrink-0 shadow-sm">
              <HeartPulse className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-[#1B2A23] font-bold text-base flex items-center gap-1.5">
                  <span>Stomach & GI Protection Guard Active</span>
                  <ChevronRight className="w-4 h-4 text-[#3B7A57] group-hover:translate-x-1 transition-transform" />
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#E3EFE6] text-[#234E35] text-[10px] font-bold border border-[#C3DACB]">
                  Active Protection
                </span>
              </div>
              <p className="text-xs text-[#557060] leading-relaxed max-w-2xl font-medium mt-1">
                Automated checks monitor NSAID and stomach sensitivities, recommending proper food buffering before dose intake.
              </p>
            </div>
          </div>

          <span className="px-4 py-2.5 rounded-2xl bg-[#E3EFE6] text-[#234E35] font-bold text-xs border border-[#C3DACB] shrink-0 self-start sm:self-center">
            View GI Guidelines →
          </span>
        </div>
      </div>

      {/* Routine Timeline Cards Grid */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarCheck className="w-5 h-5 text-[#3B7A57]" />
            <h2 className="text-xl font-bold text-[#1B2A23]">Today's Routine Timeline</h2>
          </div>

          <button
            onClick={() => onNavigateTab('schedules')}
            className="flex items-center space-x-1 text-xs font-bold text-[#234E35] hover:text-[#1A3D28] transition-colors cursor-pointer"
          >
            <span>Manage Schedule</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedules.map((slot) => {
            const slotMeds = getMedsForSlot(slot.medicationIds);
            const log = getLogForSlot(slot.id);
            const isTaken = log && log.status === 'taken';

            return (
              <motion.div
                key={slot.id}
                whileHover={{ y: -3 }}
                className={`p-6 rounded-3xl border transition-all duration-200 relative overflow-hidden bg-white shadow-sm flex flex-col justify-between space-y-4 ${
                  isTaken ? 'border-[#C3DACB] bg-[#F2F8F4]' : 'border-[#C3DACB]'
                }`}
              >
                {/* Accent line */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${isTaken ? 'bg-[#3B7A57]' : 'bg-[#C3DACB]'}`} />

                <div className="pl-2 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="px-3 py-1.5 rounded-xl bg-[#E3EFE6] font-mono font-bold text-[#234E35] text-sm border border-[#C3DACB]">
                        {slot.time}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#1B2A23]">{slot.label}</h3>
                        <p className="text-xs text-[#557060] font-medium">
                          {slotMeds.length} medication{slotMeds.length === 1 ? '' : 's'} assigned
                        </p>
                      </div>
                    </div>

                    {isTaken ? (
                      <span className="flex items-center space-x-1 px-3 py-1 rounded-full bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB] text-xs font-bold shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#3B7A57]" />
                        <span>Verified ✓</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-[#FADEC9] text-[#1B2A23] border border-[#F5C29B] text-xs font-bold shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Pills List */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {slotMeds.map((m) => (
                      <span
                        key={m.id}
                        className="px-3 py-1.5 rounded-xl bg-[#F2F8F4] border border-[#C3DACB] text-xs text-[#1B2A23] flex items-center space-x-1.5"
                      >
                        <Pill className="w-3.5 h-3.5 text-[#3B7A57]" />
                        <span className="font-semibold">{m.name} ({m.dosage})</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Verification CTA */}
                {!isTaken && (
                  <button
                    onClick={() => onTriggerDoseVerification(slot)}
                    className="w-full py-3 bg-[#3B7A57] hover:bg-[#234E35] text-white rounded-xl font-bold text-xs tracking-wide transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer ml-2"
                  >
                    <Camera className="w-4 h-4 stroke-[2.5]" />
                    <span>Take Photo Verification</span>
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Photo Verification Log Feed Card */}
      {recentVerifiedLogs.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-[#C3DACB] space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-[#3B7A57]" />
              <h3 className="text-base font-bold text-[#1B2A23]">Recently Verified Dose Logs</h3>
            </div>
            <span className="text-xs text-[#557060] font-bold">Audit Trail Active</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {recentVerifiedLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] flex items-center space-x-3">
                {log.photoUrl && (
                  <img src={log.photoUrl} alt="Verified Dose" className="w-12 h-12 rounded-xl object-cover border border-[#C3DACB] shrink-0" />
                )}
                <div className="truncate">
                  <div className="text-xs font-bold text-[#1B2A23] truncate">{log.scheduleLabel}</div>
                  <div className="text-[10px] text-[#557060] font-medium">{new Date(log.takenAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-[10px] text-[#234E35] font-bold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-[#3B7A57]" />
                    <span>Photo Verified</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};