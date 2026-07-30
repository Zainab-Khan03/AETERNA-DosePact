import React, { useState } from 'react';
import { 
  Trash2, 
  AlertTriangle, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  X, 
  Send, 
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onAccountDeleted: () => void;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  profile,
  onAccountDeleted,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState(profile.email || 'patient@example.com');
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  if (!isOpen) return null;

  // Step 1: Request account deletion code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!email) {
      setStatusMessage({ type: 'error', text: 'Please provide your registered email address.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/account/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to request deletion code.');
      }

      setIsLoading(false);
      setStep(2);
      setStatusMessage({
        type: 'info',
        text: `Step 1 Complete: A 6-digit verification code was sent to ${email} via Zoho Mail gateway (zainabkhan21033@gmail.com).`
      });
    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Error sending deletion code.' });
    }
  };

  // Step 2: Confirm deletion with 6-digit code
  const handleConfirmDeletion = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (!verificationCode || verificationCode.trim().length !== 6) {
      setStatusMessage({ type: 'error', text: 'Please enter the valid 6-digit confirmation code.' });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/account/confirm-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Account deletion failed.');
      }

      setIsLoading(false);
      setIsDeleted(true);
      setStatusMessage({
        type: 'success',
        text: 'Step 2 Complete: Account permanently erased! Double confirmation email dispatched.'
      });

      setTimeout(() => {
        onAccountDeleted();
        onClose();
      }, 2500);

    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Deletion failed. Check verification code.' });
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-[#3D2B1F] border border-[#FF4500]/50 rounded-3xl p-6 sm:p-7 shadow-2xl text-[#F5F5DC] relative overflow-hidden"
        >
          {/* Danger Top Spine */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FF4500] via-[#FF6347] to-[#FF4500]" />

          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[#F5F5DC]/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF4500]/20 border border-[#FF4500]/40 flex items-center justify-center text-[#FF6347]">
                <Trash2 className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#FF6347] font-sans">Delete Account</h3>
                <p className="text-xs text-[#F5F5DC]/70">Double Confirmation Email Protocol (Zoho Mail)</p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isLoading}
              className="p-2 rounded-xl text-[#F5F5DC]/40 hover:text-[#F5F5DC] hover:bg-[#1F140D] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div
              className={`mt-4 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 ${
                statusMessage.type === 'error'
                  ? 'bg-[#FF4500]/15 border border-[#FF4500]/40 text-[#FF6347]'
                  : statusMessage.type === 'success'
                  ? 'bg-[#00CED1]/15 border border-[#00CED1]/40 text-[#00CED1]'
                  : 'bg-[#1F140D] border border-[#00CED1]/30 text-[#40E0D0]'
              }`}
            >
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium">{statusMessage.text}</span>
            </div>
          )}

          {/* Body Content */}
          {!isDeleted ? (
            <div className="mt-5 space-y-5">
              {/* Warning Notice */}
              <div className="p-4 rounded-2xl bg-[#1F140D]/80 border border-[#FF4500]/30 space-y-2 text-xs">
                <div className="flex items-center space-x-2 text-[#FF6347] font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Irreversible Data Erasure</span>
                </div>
                <p className="text-[#F5F5DC]/80 leading-relaxed">
                  Deleting your account will permanently wipe your medication schedules, photo verification logs, GI risk sensitivity settings, and physician emergency contacts.
                </p>
              </div>

              {/* STEP 1 FORM */}
              {step === 1 ? (
                <form onSubmit={handleRequestCode} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#F5F5DC]/70 font-bold mb-1.5">
                      Confirm Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#F5F5DC]/40" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1F140D] border border-[#F5F5DC]/20 text-xs text-[#F5F5DC] focus:border-[#FF4500] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-[#F5F5DC]/60 hover:text-[#F5F5DC]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2.5 rounded-xl bg-[#FF4500] hover:bg-[#FF6347] text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
                    >
                      {isLoading ? (
                        <span className="flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Dispatching Code...</span>
                        </span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send 6-Digit Deletion Code</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* STEP 2 FORM */
                <form onSubmit={handleConfirmDeletion} className="space-y-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#00CED1] font-bold mb-1.5">
                      Enter 6-Digit Verification Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[#00CED1]" />
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="123456"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#1F140D] border border-[#00CED1]/40 text-sm font-mono tracking-widest text-[#00CED1] focus:border-[#00CED1] focus:outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-[#F5F5DC]/50 mt-1">
                      Check your inbox at <code>{email}</code> for the verification code sent via Zoho Mail.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-[#00CED1] underline hover:text-[#40E0D0]"
                    >
                      Resend Code / Change Email
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-medium text-[#F5F5DC]/60 hover:text-[#F5F5DC]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF4500] to-[#FF6347] text-white font-bold text-xs flex items-center space-x-2 shadow-lg transition-all"
                      >
                        {isLoading ? (
                          <span className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Confirming & Wiping Data...</span>
                          </span>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Confirm Permanent Deletion</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* DELETED SUCCESSFUL STATE */
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#00CED1]/20 border border-[#00CED1] mx-auto flex items-center justify-center text-[#00CED1]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-[#F5F5DC]">Account Successfully Erased</h4>
              <p className="text-xs text-[#F5F5DC]/70 max-w-sm mx-auto">
                All records, schedules, and profile data have been purged. A double confirmation email has been dispatched via Zoho Mail gateway (zainabkhan21033@gmail.com).
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
