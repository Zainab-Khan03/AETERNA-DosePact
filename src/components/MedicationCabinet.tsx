import React, { useState } from 'react';
import { Pill, Plus, Trash2, ShoppingBag, X, AlertCircle, ShieldAlert, PackageCheck } from 'lucide-react';
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

  const highGiRiskCount = medications.filter((m) => m.giRisk === 'high').length;
  const lowStockCount = medications.filter((m) => (m.stockCount || 0) <= 10).length;

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
      color: category === 'prescription' ? '#3B7A57' : category === 'over-the-counter' ? '#E07A5F' : '#22577A',
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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A23] tracking-tight">Medication Cabinet</h2>
          <p className="text-xs sm:text-sm text-[#557060] mt-1 font-medium">
            Manage your prescription, over-the-counter, and supplement inventory with food and stomach safety guidelines.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-5 rounded-2xl bg-[#234E35] text-white font-bold text-xs tracking-wide shadow-sm hover:bg-[#1A3D28] transition-all flex items-center justify-center space-x-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Medication</span>
        </button>
      </div>

      {/* Top Inventory Stat Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-[#C3DACB] flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <PackageCheck className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{medications.length}</div>
            <div className="text-xs text-[#557060] font-bold">Total Cabinet Medications</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C3DACB] flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-[#FADEC9] text-[#1B2A23]">
            <ShieldAlert className="w-5 h-5 text-[#E07A5F]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{highGiRiskCount}</div>
            <div className="text-xs text-[#557060] font-bold">High GI Risk Items</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-[#C3DACB] flex items-center space-x-3.5 shadow-sm">
          <div className="p-3 rounded-xl bg-[#E3EFE6] text-[#234E35]">
            <ShoppingBag className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#1B2A23] font-mono">{lowStockCount}</div>
            <div className="text-xs text-[#557060] font-bold">Low Refill Alerts</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="p-2.5 rounded-2xl bg-white border border-[#C3DACB] flex flex-wrap gap-2 shadow-sm">
        {[
          { id: 'all', label: 'All Items' },
          { id: 'prescription', label: 'Prescription' },
          { id: 'over-the-counter', label: 'Over-the-Counter' },
          { id: 'supplement', label: 'Supplements' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`py-2 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer border ${
              selectedCategory === cat.id
                ? 'bg-[#234E35] text-white border-[#234E35] shadow-sm font-bold'
                : 'bg-[#F2F8F4] text-[#1B2A23] border-[#C3DACB] hover:bg-[#E3EFE6]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Medication Cards Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMeds.map((med) => (
          <motion.div
            key={med.id}
            whileHover={{ y: -2 }}
            className="p-6 rounded-3xl bg-white border border-[#C3DACB] hover:border-[#3B7A57] transition-all flex flex-col justify-between space-y-4 relative overflow-hidden shadow-sm"
          >
            {/* Accent spine */}
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#3B7A57]" />

            <div className="pl-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB]">
                    {med.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#1B2A23] mt-2">{med.name}</h3>
                  <div className="text-xs font-bold text-[#234E35] font-mono mt-0.5">{med.dosage}</div>
                </div>

                <button
                  onClick={() => onDeleteMedication(med.id)}
                  className="p-2 rounded-xl text-[#557060] hover:text-[#E07A5F] hover:bg-[#FADEC9]/40 transition-colors cursor-pointer"
                  title="Remove Medication"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Instructions */}
              <p className="text-xs text-[#557060] mt-3 leading-relaxed font-medium">
                "{med.instructions}"
              </p>

              {/* GI Risk & Food Requirement Badge */}
              <div className="mt-4 pt-3 border-t border-[#C3DACB] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#557060] font-semibold">Stomach GI Sensitivity:</span>
                  <span
                    className={`font-bold px-2.5 py-0.5 rounded-lg text-[10px] uppercase ${
                      med.giRisk === 'high'
                        ? 'bg-[#FADEC9] text-[#E07A5F] border border-[#F5C29B]'
                        : med.giRisk === 'moderate'
                        ? 'bg-[#FADEC9]/50 text-[#1B2A23] border border-[#F5C29B]'
                        : 'bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB]'
                    }`}
                  >
                    {med.giRisk} Risk
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#557060] font-semibold">Food Rule:</span>
                  <span className="text-[#1B2A23] font-bold capitalize text-[11px]">
                    {med.foodRequirement ? med.foodRequirement.replace('_', ' ') : 'With Meal'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Stock Counter */}
            <div className="p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] flex items-center justify-between text-xs ml-2">
              <div className="flex items-center space-x-2 text-[#557060]">
                <ShoppingBag className="w-4 h-4 text-[#3B7A57]" />
                <span className="font-semibold">Stock Remaining:</span>
              </div>
              <span className={`font-bold font-mono ${med.stockCount! <= 10 ? 'text-[#E07A5F]' : 'text-[#1B2A23]'}`}>
                {med.stockCount || 30} units
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Add Custom Medication Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-[#1B2A23]/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white border border-[#C3DACB] rounded-3xl p-6 shadow-xl text-[#1B2A23]"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[#C3DACB] pb-3">
                <h3 className="text-lg font-bold text-[#1B2A23]">Add New Medication</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg text-[#557060] hover:text-[#1B2A23] hover:bg-[#E3EFE6] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#557060] mb-1">Medication Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Amoxicillin"
                      className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#557060] mb-1">Dosage</label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 500 mg"
                      className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Category Picker */}
                <div>
                  <label className="block text-xs font-semibold text-[#557060] mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as MedicationCategory)}
                    className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                  >
                    <option value="prescription">Prescription</option>
                    <option value="over-the-counter">Over-the-Counter</option>
                    <option value="supplement">Supplement</option>
                  </select>
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-xs font-semibold text-[#557060] mb-1">Instructions & Guidelines</label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take with food, twice daily"
                    className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                  />
                </div>

                {/* GI Risk & Food Req */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#557060] mb-1">Food Requirement</label>
                    <select
                      value={foodReq}
                      onChange={(e) => setFoodReq(e.target.value as any)}
                      className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                    >
                      <option value="with_food">Must take with food</option>
                      <option value="empty_stomach">Empty stomach</option>
                      <option value="no_restriction">No restriction</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#557060] mb-1">Stomach GI Risk</label>
                    <select
                      value={giRisk}
                      onChange={(e) => setGiRisk(e.target.value as GIRiskLevel)}
                      className="w-full p-3 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] text-sm text-[#1B2A23] focus:outline-none focus:border-[#3B7A57] transition-colors"
                    >
                      <option value="low">Low Sensitivity</option>
                      <option value="moderate">Moderate Sensitivity</option>
                      <option value="high">High GI Sensitivity (NSAID/Ulcer)</option>
                    </select>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex items-center space-x-3 pt-4 border-t border-[#C3DACB]">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="w-1/2 py-3 rounded-2xl bg-[#F2F8F4] text-[#1B2A23] border border-[#C3DACB] hover:bg-[#E3EFE6] font-semibold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 rounded-2xl bg-[#234E35] text-white font-bold text-xs shadow-sm hover:bg-[#1A3D28] cursor-pointer transition-colors"
                  >
                    Save Medication
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
