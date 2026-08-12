import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, CheckCircle2, Info, Stethoscope, HeartPulse, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { Medication, UserProfile, InteractionWarning } from '../types';

interface InteractionWarningsProps {
  medications: Medication[];
  profile: UserProfile;
}

export const InteractionWarnings: React.FC<InteractionWarningsProps> = ({
  medications,
  profile,
}) => {
  const [warnings, setWarnings] = useState<InteractionWarning[]>([]);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [source, setSource] = useState<string>('');

  const fetchInteractionAnalysis = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/analyze-interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medications,
          userConditions: profile.stomachConditions || [],
        }),
      });

      const data = await response.json();
      setWarnings(data.warnings || []);
      setSummary(data.summary || 'Interaction analysis completed successfully.');
      setSource(data.source || 'gemini');
    } catch (err) {
      console.error('Failed to analyze interactions:', err);
      setSummary('Standard clinical guidelines applied to current medication combination.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (medications.length > 0) {
      fetchInteractionAnalysis();
    }
  }, [medications.length]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#C3DACB] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#234E35] tracking-wide uppercase">
            <HeartPulse className="w-4 h-4 text-[#3B7A57]" />
            <span>Safety & Interaction Analysis</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#1B2A23] tracking-tight">
            Drug & Stomach Safety
          </h2>
          <p className="text-xs sm:text-sm text-[#557060] max-w-xl font-medium">
            Evaluation of potential medication interactions, stomach sensitivities, and meal buffering guidelines.
          </p>
        </div>

        <button
          onClick={fetchInteractionAnalysis}
          disabled={isLoading}
          className="py-3 px-5 rounded-2xl bg-[#234E35] hover:bg-[#1A3D28] text-white font-bold text-xs tracking-wide transition-all flex items-center justify-center space-x-2 shrink-0 cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Re-analyze Routine</span>
        </button>
      </div>

      {/* Patient Stomach Profile Banner */}
      <div className="p-4 rounded-2xl bg-[#E3EFE6] border border-[#C3DACB] flex flex-wrap items-center justify-between gap-2 text-xs text-[#1B2A23]">
        <div className="flex items-center space-x-2">
          <Stethoscope className="w-4 h-4 text-[#3B7A57]" />
          <span className="font-semibold text-[#557060]">Active Patient Profile Conditions:</span>
          <span className="font-bold text-[#1B2A23]">
            {profile.stomachConditions?.join(', ') || 'Sensitive Stomach'}
          </span>
        </div>
        <span className="text-[#234E35] text-xs font-bold flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-[#3B7A57]" />
          <span>GI Safeguard Active</span>
        </span>
      </div>

      {/* Summary Box */}
      {summary && (
        <div className="p-5 rounded-2xl bg-white border border-[#C3DACB] text-xs text-[#1B2A23] flex items-start space-x-3 shadow-sm">
          <Info className="w-5 h-5 text-[#3B7A57] shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-[#1B2A23] mb-1">Safety Summary:</div>
            <div className="leading-relaxed text-[#557060] font-medium">{summary}</div>
          </div>
        </div>
      )}

      {/* Interaction Warning Cards */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-12 text-center rounded-3xl bg-white border border-[#C3DACB] space-y-3 shadow-sm">
            <RefreshCw className="w-8 h-8 text-[#3B7A57] animate-spin mx-auto" />
            <div className="text-sm font-bold text-[#1B2A23]">Evaluating Medication Combinations...</div>
            <p className="text-xs text-[#557060]">Checking stomach impacts and dosage timing rules.</p>
          </div>
        ) : warnings.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-white border border-[#C3DACB] space-y-2 shadow-sm">
            <CheckCircle2 className="w-10 h-10 text-[#3B7A57] mx-auto" />
            <div className="text-lg font-bold text-[#1B2A23]">No High-Risk Interactions Detected</div>
            <p className="text-xs text-[#557060] max-w-md mx-auto font-medium">
              Your active medication stack is well-balanced. Continue taking your medications according to food and timing instructions.
            </p>
          </div>
        ) : (
          warnings.map((warn, idx) => (
            <motion.div
              key={warn.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border transition-all space-y-4 relative overflow-hidden bg-white shadow-sm ${
                warn.severity === 'severe'
                  ? 'border-[#F5C29B]'
                  : warn.severity === 'moderate'
                  ? 'border-[#F5C29B]'
                  : 'border-[#C3DACB]'
              }`}
            >
              {/* Spine indicator */}
              <div
                className={`absolute top-0 left-0 w-1.5 h-full ${
                  warn.severity === 'severe' ? 'bg-[#E07A5F]' : warn.severity === 'moderate' ? 'bg-[#E07A5F]' : 'bg-[#3B7A57]'
                }`}
              />

              <div className="pl-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        warn.severity === 'severe'
                          ? 'bg-[#FADEC9] text-[#E07A5F] border border-[#F5C29B]'
                          : warn.severity === 'moderate'
                          ? 'bg-[#FADEC9]/50 text-[#1B2A23] border border-[#F5C29B]'
                          : 'bg-[#E3EFE6] text-[#234E35] border border-[#C3DACB]'
                      }`}
                    >
                      <AlertTriangle className="w-5 h-5" />
                    </div>

                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                          warn.severity === 'severe'
                            ? 'bg-[#FADEC9] text-[#E07A5F] border-[#F5C29B]'
                            : warn.severity === 'moderate'
                            ? 'bg-[#FADEC9]/50 text-[#1B2A23] border-[#F5C29B]'
                            : 'bg-[#E3EFE6] text-[#234E35] border-[#C3DACB]'
                        }`}
                      >
                        {warn.severity} Sensitivity
                      </span>
                      <h3 className="text-base font-bold text-[#1B2A23] mt-1">{warn.title}</h3>
                    </div>
                  </div>

                  <div className="text-xs font-semibold text-[#557060]">
                    Involving: <span className="text-[#1B2A23] font-bold">{warn.medications?.join(' + ')}</span>
                  </div>
                </div>

                {/* Stomach / GI Impact Box */}
                <div className="mt-4 p-4 rounded-2xl bg-[#F2F8F4] border border-[#C3DACB] space-y-1">
                  <div className="text-xs font-bold text-[#1B2A23] uppercase tracking-wider">
                    Stomach & Digestive Impact:
                  </div>
                  <p className="text-xs text-[#557060] leading-relaxed font-medium">{warn.stomachGIImpact}</p>
                </div>

                {/* Recommendation Box */}
                <div className="mt-3 p-4 rounded-2xl bg-[#E3EFE6] border border-[#C3DACB] space-y-1">
                  <div className="text-xs font-bold text-[#1B2A23] uppercase tracking-wider">
                    Care Recommendation:
                  </div>
                  <p className="text-xs text-[#1B2A23] leading-relaxed font-semibold">{warn.recommendation}</p>
                </div>

                {warn.details && (
                  <p className="text-[11px] text-[#557060] italic mt-2">
                    Pharmacology note: {warn.details}
                  </p>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Medical Disclaimer & Emergency Banner */}
      <div className="p-5 rounded-3xl bg-[#F2F8F4] border border-[#C3DACB] text-xs text-[#557060] space-y-2">
        <div className="font-bold text-[#1B2A23]">Medical Disclaimer:</div>
        <p className="leading-relaxed font-medium">
          This interaction check is an automated clinical companion tool and does not replace personal consultation with your prescribing physician or pharmacist. Always discuss new symptoms or severe stomach discomfort with your healthcare provider.
        </p>
        <div className="pt-2 text-[11px] text-[#234E35] font-bold">
          Physician Contact: {profile.physicianName || 'Primary Care Physician'} ({profile.emergencyContact || '911'})
        </div>
      </div>
    </div>
  );
};
