import React, { useState } from 'react';
import { Clock, Plus, Trash2, Edit2, Check, Calendar, AlertCircle, CheckSquare, Square } from 'lucide-react';
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

// Generate 15-minute increment time options ("00:00", "00:15", ... "23:45")
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic text-[#F5F5DC]">Schedule Management</h2>
          <p className="text-xs text-[#F5F5DC]/60 mt-1">
            Configure recurring dose times in 15-minute increments for accurate photo alarms.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="py-3 px-6 rounded-2xl bg-[#00CED1] text-[#1F140D] font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(0,206,209,0.3)] hover:bg-[#40E0D0] transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Time Slot</span>
        </button>
      </div>

      {/* Schedule Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {schedules.map((slot) => {
          const slotMeds = medications.filter((m) => slot.medicationIds.includes(m.id));

          return (
            <div
              key={slot.id}
              className="p-6 rounded-3xl bg-[#3D2B1F] border border-[#F5F5DC]/10 hover:border-[#00CED1]/40 transition-all space-y-4 relative overflow-hidden shadow-lg"
            >
              {/* Book spine accent bar */}
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00CED1]" />

              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-[#1F140D] border border-[#00CED1]/20 font-mono font-bold text-[#00CED1] text-base">
                    {slot.time}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#F5F5DC]">{slot.label}</h3>
                    <p className="text-xs text-[#F5F5DC]/50">
                      {slot.recurringDays.length === 7
                        ? 'Every Day'
                        : `${slot.recurringDays.length} days/week`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(slot)}
                    className="p-2 rounded-xl text-[#F5F5DC]/40 hover:text-[#00CED1] hover:bg-[#1F140D] transition-all"
                    title="Edit Slot"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteSchedule(slot.id)}
                    className="p-2 rounded-xl text-[#F5F5DC]/40 hover:text-[#FF4500] hover:bg-[#1F140D] transition-all"
                    title="Delete Slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recurring Days Badges */}
              <div className="flex items-center space-x-1">
                {DAYS_MAP.map((d) => {
                  const active = slot.recurringDays.includes(d.value);
                  return (
                    <span
                      key={d.value}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                        active
                          ? 'bg-[#00CED1]/20 text-[#00CED1] border-[#00CED1]/40'
                          : 'bg-[#1F140D] text-[#F5F5DC]/30 border-[#F5F5DC]/5'
                      }`}
                    >
                      {d.label}
                    </span>
                  );
                })}
              </div>

              {/* Assigned Medications */}
              <div className="space-y-1.5 pt-3 border-t border-[#F5F5DC]/10">
                <div className="text-[11px] font-bold text-[#00CED1] uppercase tracking-wider">Assigned Medications:</div>
                <div className="flex flex-wrap gap-1.5">
                  {slotMeds.map((med) => (
                    <span
                      key={med.id}
                      className="text-xs px-3 py-1 rounded-xl bg-[#1F140D] text-[#F5F5DC]/80 border border-[#F5F5DC]/10"
                    >
                      {med.name} ({med.dosage})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Schedule Slot Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#2A1B13] border border-[#00CED1]/40 rounded-3xl p-6 shadow-2xl text-[#F7F4EF]"
            >
              <h3 className="text-xl font-bold mb-4 text-[#F7F4EF]">
                {editingId ? 'Edit Schedule Slot' : 'Add New Schedule Slot'}
              </h3>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Slot Label */}
                <div>
                  <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">
                    Slot Label
                  </label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Morning Dose, Pre-Lunch, Bedtime"
                    className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                    required
                  />
                </div>

                {/* 15-Minute Increment Time Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">
                    Scheduled Time (15-Min Increments)
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#00CED1] font-mono font-bold focus:outline-none focus:border-[#00CED1]"
                  >
                    {timeOptions.map((t) => (
                      <option key={t} value={t} className="bg-[#1A110C] text-[#F7F4EF]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Medication Multi-Select */}
                <div>
                  <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">
                    Select Medications for this Slot
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto p-2 rounded-2xl bg-[#1A110C] border border-[#4A3225]">
                    {medications.map((med) => {
                      const isSelected = selectedMeds.includes(med.id);
                      return (
                        <div
                          key={med.id}
                          onClick={() => toggleMed(med.id)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-[#00CED1]/20 border-[#00CED1] text-[#F7F4EF]'
                              : 'bg-[#2A1C14] border-[#3D2B1F] text-[#A89888]'
                          }`}
                        >
                          <span className="text-xs font-bold">{med.name} ({med.dosage})</span>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-[#00CED1]" />
                          ) : (
                            <Square className="w-4 h-4 text-[#5A4B3D]" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Recurring Days */}
                <div>
                  <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">
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
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                            active
                              ? 'bg-[#00CED1] text-[#120B07] border-[#00CED1]'
                              : 'bg-[#1A110C] text-[#A89888] border-[#3D2B1F]'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex items-center space-x-3 pt-4 border-t border-[#3D2B1F]">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-3 rounded-2xl bg-[#1A110C] text-[#A89888] border border-[#3D2B1F] font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-2xl bg-[#00CED1] text-[#120B07] font-bold text-xs shadow-md hover:bg-[#40E0D0]"
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
