import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, CheckSquare, Square, X, BellRing, CalendarDays } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ScheduleSlot, Medication } from '../types';

interface ScheduleBuilderProps {
  schedules: ScheduleSlot[];
  medications: Medication[];
  onAddSchedule: (slot: Omit<ScheduleSlot, 'id'>) => void;
  onUpdateSchedule: (id: string, slot: Partial<ScheduleSlot>) => void;
  onDeleteSchedule: (id: string) => void;
}

const DAYS_MAP = [
  { label: 'Sun', value: 0 },
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const generateTimeIncrements = (): string[] => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      times.push(`${hh}:${mm}`);
    }
  }
  return times;
};

export const ScheduleBuilder: React.FC<ScheduleBuilderProps> = ({
  schedules,
  medications,
  onAddSchedule,
  onUpdateSchedule,
  onDeleteSchedule,
}) => {
  const timeOptions = generateTimeIncrements();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [label, setLabel] = useState<string>('Morning Dose');
  const [time, setTime] = useState<string>('08:00');
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);
  const [recurringDays, setRecurringDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [notes, setNotes] = useState<string>('');

  const openCreateModal = () => {
    setEditingId(null);
    setLabel('New Scheduled Dose');
    setTime('08:00');
    setSelectedMeds(medications.length > 0 ? [medications[0].id] : []);
    setRecurringDays([0, 1, 2, 3, 4, 5, 6]);
    setNotes('');
    setShowModal(true);
  };

  const openEditModal = (slot: ScheduleSlot) => {
    setEditingId(slot.id);
    setLabel(slot.label);
    setTime(slot.time);
    setSelectedMeds(slot.medicationIds);
    setRecurringDays(slot.recurringDays);
    setNotes(slot.notes || '');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || selectedMeds.length === 0) return;

    if (editingId) {
      onUpdateSchedule(editingId, {
        label,
        time,
        medicationIds: selectedMeds,
        recurringDays,
        notes,
      });
    } else {
      onAddSchedule({
        label,
        time,
        medicationIds: selectedMeds,
        recurringDays,
        isEnabled: true,
        notes,
      });
    }

    setShowModal(false);
  };

  const toggleDay = (dayVal: number) => {
    if (recurringDays.includes(dayVal)) {
      setRecurringDays(recurringDays.filter((d) => d !== dayVal));
    } else {
      setRecurringDays([...recurringDays, dayVal].sort());
    }
  };

  const toggleMed = (medId: string) => {
    if (selectedMeds.includes(medId)) {
      setSelectedMeds(selectedMeds.filter((id) => id !== medId));
    } else {
      setSelectedMeds([...selectedMeds, medId]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A23] tracking-tight">Routine Schedule</h2>
          <p className="text-xs sm:text-sm text-[#557060] mt-1 font-medium">
            Configure custom dose times and recurring days for your medication reminders.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-5 rounded-2xl bg-[#234E35] text-white font-bold text-xs tracking-wide shadow-sm hover:bg-[#1A3D28] transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Time Slot</span>
        </button>
      </div>

      {/* Top Schedule Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#C3DACB] flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <Clock className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{schedules.length}</div>
            <div className="text-xs text-[#557060] font-bold">Configured Dose Slots</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C3DACB] flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <BellRing className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">100%</div>
            <div className="text-xs text-[#557060] font-bold">Alarm Chime Active</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C3DACB] flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <CalendarDays className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">Daily</div>
            <div className="text-xs text-[#557060] font-bold">7-Day Recurring Loop</div>
          </div>
        </div>
      </div>

      {/* Schedule Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schedules.map((slot) => {
          const slotMeds = medications.filter((m) => slot.medicationIds.includes(m.id));

          return (
            <div
              key={slot.id}
              className="p-6 rounded-3xl bg-white border border-[#C3DACB] hover:border-[#3B7A57] transition-all space-y-4 relative overflow-hidden shadow-sm"
            >
              {/* Accent bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3B7A57]" />

              <div className="pl-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div className="px-3 py-1.5 rounded-xl bg-[#E3EFE6] font-mono font-bold text-[#234E35] text-sm border border-[#C3DACB]">
                      {slot.time}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-[#1B2A23]">{slot.label}</h3>
                      <p className="text-xs text-[#557060] font-medium">
                        {slot.recurringDays.length === 7
                          ? 'Every Day'
                          : `${slot.recurringDays.length} days / week`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(slot)}
                      className="p-2 rounded-xl text-[#557060] hover:text-[#3B7A57] hover:bg-[#E3EFE6] transition-colors cursor-pointer"
                      title="Edit Slot"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(slot.id)}
                      className="p-2 rounded-xl text-[#557060] hover:text-[#E07A5F] hover:bg-[#FADEC9]/40 transition-colors cursor-pointer"
                      title="Delete Slot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Recurring Days Badges */}
                <div className="flex items-center space-x-1 mt-3">
                  {DAYS_MAP.map((d) => {
                    const active = slot.recurringDays.includes(d.value);
                    return (
                      <span
                        key={d.value}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                          active
                            ? 'bg-[#E3EFE6] text-[#234E35] border-[#C3DACB]'
                            : 'bg-[#F2F8F4] text-[#557060]/50 border-[#C3DACB]/50'
                        }`}
                      >
                        {d.label}
                      </span>
                    );
                  })}
                </div>

                {/* Assigned Medications */}
                <div className="space-y-1.5 pt-3 mt-3 border-t border-[#C3DACB]">
                  <div className="text-[11px] font-bold text-[#557060] uppercase tracking-wider">Assigned Medications:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {slotMeds.map((med) => (
                      <span
                        key={med.id}
                        className="text-xs px-3 py-1 rounded-xl bg-[#F2F8F4] text-[#1B2A23] border border-[#C3DACB] font-semibold"
                      >
                        {med.name} ({med.dosage})
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Schedule Slot Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-[#1B2A23]/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-[#C3DACB] rounded-3xl p-6 shadow-xl text-[#1B2A23]"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[#C3DACB] pb-3">
                <h3 className="text-lg font-bold text-[#1B2A23]">
                  {editingId ? 'Edit Schedule Slot' : 'Add Schedule Slot'}
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-[#557060] hover:text-[#1B2A23] hover:bg-[#E3EFE6] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Slot Label */}
                <div>
                  <label className="block text-xs font-semibold text-[#557060] mb-1">
                    Slot Label
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Morning Dose, Lunchtime, Bedtime"
                    className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                    required
                  />
                </div>

                {/* 15-Minute Increment Time Picker */}
                <div>
                  <label className="block text-xs font-semibold text-[#557060] mb-1">
                    Scheduled Time
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#234E35] font-mono font-bold focus:outline-none focus:border-[#3B7A57] transition-colors"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medication Multi-Select */}
                <div>
                  <label className="block text-xs font-semibold text-[#557060] mb-1">
                    Select Medications for this Slot
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB]">
                    {medications.map((med) => {
                      const isSelected = selectedMeds.includes(med.id);
                      return (
                        <div
                          key={med.id}
                          onClick={() => toggleMed(med.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#E3EFE6] border-[#C3DACB] text-[#1B2A23] font-bold'
                              : 'bg-white border-[#C3DACB] text-[#557060] hover:bg-[#E3EFE6]/50'
                          }`}
                        >
                          <span className="text-xs">{med.name} ({med.dosage})</span>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#3B7A57]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#557060]/40" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recurring Days */}
                <div>
                  <label className="block text-xs font-semibold text-[#557060] mb-1">
                    Recurring Days
                  </label>
                  <div className="flex justify-between gap-1">
                    {DAYS_MAP.map((d) => {
                      const active = recurringDays.includes(d.value);
                      return (
                        <button
                          type="button"
                          key={d.value}
                          onClick={() => toggleDay(d.value)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            active
                              ? 'bg-[#234E35] text-white border-[#234E35]'
                              : 'bg-[#F2F8F4] text-[#1B2A23] border-[#C3DACB] hover:bg-[#E3EFE6]'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-[#C3DACB]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-3 rounded-2xl bg-[#F2F8F4] text-[#1B2A23] border border-[#C3DACB] hover:bg-[#E3EFE6] font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-2xl bg-[#234E35] text-white font-bold text-xs shadow-sm hover:bg-[#1A3D28] cursor-pointer transition-colors"
                  >
                    Save Slot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
