// src/components/DeleteAccountModal.tsx
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
import { Button } from './ui/Button';

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
      // Generate a 6-digit code (100000 - 999999)
      const generatedCode = Math.floor(100000 + Math.random() * 900000);
      
      console.log('[CLIENT] Generated verification code:', generatedCode);
      
      // Store the code in localStorage with expiration
      const codeData = {
        code: generatedCode,
        email: email,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      };
      localStorage.setItem('dosepact_deletion_code', JSON.stringify(codeData));

      // Call the API with the email AND the generated code
      const response = await fetch('/api/account/request-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          code: generatedCode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code.');
      }

      setIsLoading(false);
      setStep(2);
      setStatusMessage({
        type: 'info',
        text: `A 6-digit verification code was sent to ${email}`
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

    // Verify the code from localStorage
    const storedCodeData = localStorage.getItem('dosepact_deletion_code');
    if (!storedCodeData) {
      setStatusMessage({ type: 'error', text: 'No verification code found. Please request a new code.' });
      return;
    }

    const codeData = JSON.parse(storedCodeData);
    
    // Check if code has expired
    if (Date.now() > codeData.expiresAt) {
      localStorage.removeItem('dosepact_deletion_code');
      setStatusMessage({ type: 'error', text: 'Verification code has expired. Please request a new code.' });
      return;
    }

    // Check if code matches
    if (codeData.code !== parseInt(verificationCode)) {
      setStatusMessage({ type: 'error', text: 'Invalid verification code. Please try again.' });
      return;
    }

    setIsLoading(true);

    try {
      // Proceed with account deletion
      const response = await fetch('/api/account/confirm-deletion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: codeData.email, 
          code: verificationCode 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Account deletion failed.');
      }

      // Clear the stored code
      localStorage.removeItem('dosepact_deletion_code');
      
      setIsLoading(false);
      setIsDeleted(true);
      setStatusMessage({
        type: 'success',
        text: 'Account permanently erased! Confirmation email dispatched.'
      });

      setTimeout(() => {
        onAccountDeleted();
        onClose();
      }, 2500);

    } catch (err: any) {
      setIsLoading(false);
      setStatusMessage({ type: 'error', text: err.message || 'Deletion failed. Please try again.' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-[#2D342E]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg bg-[#FAF6EE] border border-[#E79897]/50 rounded-3xl p-6 sm:p-7 shadow-xl text-[#2D342E] relative overflow-hidden"
          >
            {/* Danger Top Spine */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-[#E79897]" />

            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#EBDEC0]">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E79897]/20 border border-[#E79897] flex items-center justify-center text-[#B95B5A]">
                  <Trash2 className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#B95B5A]">Delete Account</h3>
                  <p className="text-xs text-[#6B756C] font-medium">Double Confirmation Email Protocol</p>
                </div>
              </div>

              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-2 rounded-xl text-[#6B756C] hover:text-[#2D342E] hover:bg-[#EBDEC0]/40 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Message */}
            {statusMessage && (
              <div
                className={`mt-4 p-3.5 rounded-2xl text-xs flex items-start space-x-2.5 font-bold ${
                  statusMessage.type === 'error'
                    ? 'bg-[#E79897]/20 border border-[#E79897] text-[#B95B5A]'
                    : statusMessage.type === 'success'
                    ? 'bg-[#EBDEC0] border border-[#C6C09C] text-[#2D342E]'
                    : 'bg-white border border-[#EBDEC0] text-[#768E78]'
                }`}
              >
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* Body Content */}
            {!isDeleted ? (
              <div className="mt-5 space-y-5">
                {/* Warning Notice */}
                <div className="p-4 rounded-2xl bg-white border border-[#E79897]/40 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-[#B95B5A] font-bold">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Irreversible Data Erasure</span>
                  </div>
                  <p className="text-[#6B756C] font-medium leading-relaxed">
                    Deleting your account will permanently wipe your medication schedules, photo verification logs, GI risk sensitivity settings, and physician emergency contacts.
                  </p>
                </div>

                {/* STEP 1 FORM */}
                {step === 1 ? (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#6B756C] font-bold mb-1.5">
                        Confirm Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#6B756C]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EBDEC0] text-xs text-[#2D342E] focus:border-[#768E78] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-end space-x-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-bold text-[#6B756C] hover:text-[#2D342E] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl bg-[#E79897] hover:bg-[#d88786] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Dispatching Code...</span>
                          </>
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
                      <label className="block text-[11px] uppercase tracking-wider text-[#768E78] font-bold mb-1.5">
                        Enter 6-Digit Verification Code
                      </label>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 absolute left-3.5 top-3 text-[#768E78]" />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white border border-[#EBDEC0] text-sm font-mono tracking-widest text-[#2D342E] focus:border-[#768E78] focus:outline-none"
                        />
                      </div>
                      <p className="text-[10px] text-[#6B756C] mt-1 font-medium">
                        Check your inbox at <code className="font-bold">{email}</code> for the verification code.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-xs text-[#768E78] font-bold underline hover:text-[#5C705E] cursor-pointer"
                      >
                        Resend Code / Change Email
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={onClose}
                          className="px-4 py-2 text-xs font-bold text-[#6B756C] hover:text-[#2D342E] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="px-6 py-2.5 rounded-xl bg-[#E79897] hover:bg-[#d88786] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Confirming & Wiping Data...</span>
                            </>
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
                <div className="w-16 h-16 rounded-full bg-[#EBDEC0] border border-[#C6C09C] mx-auto flex items-center justify-center text-[#768E78]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#2D342E]">Account Successfully Erased</h4>
                <p className="text-xs text-[#6B756C] font-medium max-w-sm mx-auto">
                  All records, schedules, and profile data have been purged. A confirmation email has been dispatched.
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};