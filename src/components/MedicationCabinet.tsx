import React, { useState } from 'react';
import { Pill, Plus, AlertTriangle, ShieldCheck, Trash2, Edit3, ShoppingBag, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Medication, MedicationCategory, GIRiskLevel } from '../types';

interface MedicationCabinetProps {
  medications: Medication[];
  onAddMedication: (med: Omit<Medication, 'id'>) => void;
  onDeleteMedication: (id: string) => void;
}

export const MedicationCabinet: React.FC<MedicationCabinetProps> = ({
  medications,
  onAddMedication,
  onDeleteMedication,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // New Med Form State
  const [name, setName] = useState<string>('');
  const [dosage, setDosage] = useState<string>('');
  const [category, setCategory] = useState<MedicationCategory>('prescription');
  const [instructions, setInstructions] = useState<string>('');
  const [foodReq, setFoodReq] = useState<'with_food' | 'empty_stomach' | 'no_restriction'>('with_food');
  const [giRisk, setGiRisk] = useState<GIRiskLevel>('low');
  const [sideEffects, setSideEffects] = useState<string>('');
  const [stockCount, setStockCount] = useState<number>(30);

  const filteredMeds = medications.filter((m) => {
    if (selectedCategory === 'all') return true;
    return m.category === selectedCategory;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    onAddMedication({
      name,
      dosage,
      category,
      instructions: instructions || 'Take as directed by healthcare provider.',
      foodRequirement: foodReq,
      giRisk,
      color: category === 'prescription' ? '#00CED1' : category === 'over-the-counter' ? '#E0A96D' : '#7FFFD4',
      shape: 'capsule',
      sideEffects: sideEffects ? sideEffects.split(',').map((s) => s.trim()) : [],
      stockCount: Number(stockCount) || 30,
    });

    // Reset & Close
    setName('');
    setDosage('');
    setInstructions('');
    setSideEffects('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic text-[#F5F5DC]">Medication Cabinet</h2>
          <p className="text-xs text-[#F5F5DC]/60 mt-1">
            Manage your prescription, over-the-counter, and supplement inventory with GI safety tags.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-6 rounded-2xl bg-[#00CED1] text-[#1F140D] font-black text-xs uppercase tracking-wider shadow-[0_4px_20px_rgba(0,206,209,0.3)] hover:bg-[#40E0D0] transition-all flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Custom Medication</span>
        </button>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2.5">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'prescription', label: 'Prescription' },
          { id: 'over-the-counter', label: 'Over-the-Counter' },
          { id: 'supplement', label: 'Supplements' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
              selectedCategory === cat.id
                ? 'bg-[#00CED1] text-[#1F140D] border-[#00CED1] shadow-md'
                : 'bg-[#1F140D] text-[#F5F5DC]/70 border-[#00CED1]/20 hover:text-[#F5F5DC]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Medication Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeds.map((med) => (
          <motion.div
            key={med.id}
            whileHover={{ y: -3 }}
            className="p-6 rounded-3xl bg-[#3D2B1F] border border-[#F5F5DC]/10 hover:border-[#00CED1]/40 transition-all flex flex-col justify-between space-y-4 relative overflow-hidden shadow-lg"
          >
            {/* Book spine accent */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#00CED1]" />

            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-0.5 rounded-full bg-[#1F140D] text-[#00CED1] border border-[#00CED1]/30">
                    {med.category}
                  </span>
                  <h3 className="text-xl font-bold text-[#F5F5DC] mt-2.5">{med.name}</h3>
                  <div className="text-xs font-mono font-bold text-[#00CED1] mt-0.5">{med.dosage}</div>
                </div>

                <button
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-2 rounded-xl text-[#F5F5DC]/40 hover:text-[#FF4500] hover:bg-[#1F140D] transition-all"
                  title="Remove Medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Instructions */}
              <p className="text-xs text-[#F5F5DC]/80 mt-3 leading-relaxed font-serif italic">
                "{med.instructions}"
              </p>

              {/* GI Risk & Food Requirement Badge */}
              <div className="mt-4 pt-3 border-t border-[#F5F5DC]/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F5F5DC]/50">Stomach GI Risk:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-lg text-[10px] uppercase ${
                      med.giRisk === 'high'
                        ? 'bg-[#FF4500]/20 text-[#FF4500] border border-[#FF4500]/40'
                        : med.giRisk === 'moderate'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/40'
                        : 'bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30'
                    }`}
                  >
                    {med.giRisk} Risk
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#F5F5DC]/50">Food Rule:</span>
                  <span className="text-[#00CED1] font-semibold capitalize font-mono text-[11px]">
                    {med.foodRequirement.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Stock Counter */}
            <div className="p-3 rounded-2xl bg-[#1F140D] border border-[#F5F5DC]/10 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-[#F5F5DC]/60">
                <ShoppingBag className="w-4 h-4 text-[#00CED1]" />
                <span>Stock Remaining:</span>
              </div>
              <span className={`font-bold font-mono ${med.stockCount! <= 10 ? 'text-[#FF4500]' : 'text-[#00CED1]'}`}>
                {med.stockCount || 30} units
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Custom Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg bg-[#2A1B13] border border-[#00CED1]/40 rounded-3xl p-6 shadow-2xl text-[#F7F4EF]"
            >
              <h3 className="text-xl font-bold mb-4 text-[#F7F4EF]">Add Custom Medication</h3>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amoxicillin"
                      className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 500 mg"
                      className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                      required
                    />
                  </div>
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicationCategory)}
                    className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="over-the-counter">Over-the-Counter</option>
                    <option value="supplement">Supplement</option>
                  </select>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">Instructions</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take with food, twice daily"
                    className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                  />
                </div>

                {/* GI Risk & Food Req */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">Food Rule</label>
                    <select
                      value={foodReq}
                      onChange={(e) => setFoodReq(e.target.value as any)}
                      className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                    >
                      <option value="with_food">Must take with food</option>
                      <option value="empty_stomach">Empty stomach</option>
                      <option value="no_restriction">No restriction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#A89888] mb-1 uppercase">Stomach GI Risk</label>
                    <select
                      value={giRisk}
                      onChange={(e) => setGiRisk(e.target.value as GIRiskLevel)}
                      className="w-full p-3 rounded-2xl bg-[#1A110C] border border-[#4A3225] text-sm text-[#F7F4EF] focus:outline-none focus:border-[#00CED1]"
                    >
                      <option value="low">Low Risk</option>
                      <option value="moderate">Moderate Risk</option>
                      <option value="high">High GI Risk (NSAID/Ulcer)</option>
                    </select>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-[#3D2B1F]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-3 rounded-2xl bg-[#1A110C] text-[#A89888] border border-[#3D2B1F] font-semibold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-2xl bg-[#00CED1] text-[#120B07] font-bold text-xs shadow-md hover:bg-[#40E0D0]"
                  >
                    Add Medication
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
