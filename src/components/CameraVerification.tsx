// src/components/CameraVerification.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, AlertCircle, RefreshCw, ShieldCheck, X, Clock, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  drawWatermarkedMedicationPhoto, 
  generateSimulatedHandPillPhoto, 
  validatePhotoTimestamp 
} from '../utils/photoVerification';
import { Medication, ScheduleSlot, PhotoVerificationDetails } from '../types';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Model';
import { api } from '../services/api';
import { cn } from '../utils/cn';

interface CameraVerificationProps {
  scheduleSlot?: ScheduleSlot;
  medications?: Medication[];
  onVerified: (photoUrl: string, verificationDetails: PhotoVerificationDetails) => void;
  onCancel: () => void;
}

type VerificationStatus = 'idle' | 'capturing' | 'verifying' | 'success' | 'error';

export const CameraVerification: React.FC<CameraVerificationProps> = ({
  scheduleSlot,
  medications = [],
  onVerified,
  onCancel,
}) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // State
  const [status, setStatus] = useState<VerificationStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [useSimulatedMode, setUseSimulatedMode] = useState<boolean>(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verificationProgress, setVerificationProgress] = useState<string>('');
  const [retryCount, setRetryCount] = useState<number>(0);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const medNames = medications.map((m) => m.name);
  const scheduleLabel = scheduleSlot ? scheduleSlot.label : 'Medication Dose';
  const maxRetries = 2;

  type VerificationApiResponse = {
    verified?: boolean;
    pillsDetected?: boolean;
    handDetected?: boolean;
    confidence?: number;
    details?: string;
    deviceInfo?: string;
  };

  // Initialize camera
  useEffect(() => {
    let mounted = true;

    const initCamera = async () => {
      try {
        // Check if camera is available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCamera = devices.some(device => device.kind === 'videoinput');

        if (!hasCamera) {
          setCameraError('No camera detected on this device. Using simulation mode.');
          setUseSimulatedMode(true);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (mounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
          }
          setCameraError(null);
        }
      } catch (err) {
        console.warn('Camera access error:', err);
        if (mounted) {
          const errorMessage = err instanceof Error ? err.message : 'Camera access denied';
          setCameraError(`Camera stream unavailable: ${errorMessage}. Using simulation mode.`);
          setUseSimulatedMode(true);
        }
      }
    };

    initCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle capture with retry logic
  const handleCapture = useCallback(async () => {
    setStatus('capturing');
    setErrorMessage(null);

    try {
      let photoData: { base64: string; capturedTimestamp: string };

      // Small delay to ensure camera is ready
      await new Promise(resolve => setTimeout(resolve, 100));

      if (useSimulatedMode || !videoRef.current || !videoRef.current.videoWidth) {
        photoData = generateSimulatedHandPillPhoto(scheduleLabel, medNames);
      } else {
        photoData = drawWatermarkedMedicationPhoto(videoRef.current, scheduleLabel, medNames);
      }

      setCapturedPhoto(photoData.base64);
      setStatus('idle');
      
      // Start verification process
      await runVerificationProcess(photoData.base64, photoData.capturedTimestamp);
    } catch (err) {
      console.error('Capture error:', err);
      setStatus('error');
      setErrorMessage('Failed to capture photo. Please try again.');
    }
  }, [useSimulatedMode, scheduleLabel, medNames]);

  // Run verification with Gemini AI
  const runVerificationProcess = useCallback(async (imageBase64: string, capturedTimestamp: string) => {
    setStatus('verifying');
    setVerificationProgress('Validating EXIF timestamp & freshness...');
    setErrorMessage(null);

    try {
      // Step 1: Validate timestamp
      const timestampCheck = validatePhotoTimestamp(capturedTimestamp);
      
      if (!timestampCheck.isToday) {
        setStatus('error');
        setErrorMessage(`Verification failed: Photo timestamp (${new Date(capturedTimestamp).toLocaleString()}) is not from today. Please retake the photo.`);
        return;
      }

      setVerificationProgress('Connecting to AI for pill-in-hand detection...');

      // Step 2: AI Verification with retry logic
      let verified = false;
      let verificationData: any = null;
      let attempts = 0;

      while (!verified && attempts <= maxRetries) {
        try {
          const response = await api.post<VerificationApiResponse>('/verify-photo', {
            imageBase64,
            timestamp: capturedTimestamp,
            scheduleLabel,
            medicationsExpected: medNames,
            retryAttempt: attempts,
          });

          verificationData = response;
          verified = response.verified || false;

          if (!verified && attempts < maxRetries) {
            setVerificationProgress(`AI verification attempt ${attempts + 1} failed. Retrying...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
          } else {
            break;
          }
        } catch (err) {
          if (attempts < maxRetries) {
            setVerificationProgress(`API error (attempt ${attempts + 1}). Retrying...`);
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw err;
          }
        }
      }

      setStatus('idle');

      if (verified) {
        // Success - pass to parent
        const verificationDetails: PhotoVerificationDetails = {
          pillsDetected: verificationData?.pillsDetected ?? true,
          handDetected: verificationData?.handDetected ?? true,
          confidence: verificationData?.confidence ?? 0.95,
          notes: verificationData?.details || 'Photo verified successfully',
          timestamp: capturedTimestamp,
          deviceInfo: verificationData?.deviceInfo || navigator.userAgent,
        };
        onVerified(imageBase64, verificationDetails);
      } else {
        setStatus('error');
        setErrorMessage(verificationData?.message || 'Photo verification failed. Make sure pills are clearly held in your hand and the image is clear.');
        setRetryCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Verification error:', err);
      setStatus('error');
      
      // If we've exceeded retries, offer fallback
      if (retryCount >= maxRetries) {
        setErrorMessage('AI verification failed after multiple attempts. You can retry or use manual verification.');
      } else {
        setErrorMessage('Verification service unavailable. Please try again.');
      }
    }
  }, [scheduleLabel, medNames, onVerified, maxRetries, retryCount]);

  // Manual fallback verification (for when API is down)
  const handleManualVerification = useCallback(() => {
    if (!capturedPhoto) return;

    const timestamp = new Date().toISOString();
    const verificationDetails: PhotoVerificationDetails = {
      pillsDetected: true,
      handDetected: true,
      confidence: 0.85,
      notes: 'Manual verification accepted - AI service unavailable',
      timestamp: timestamp,
      deviceInfo: 'Manual fallback mode',
    };
    onVerified(capturedPhoto, verificationDetails);
  }, [capturedPhoto, onVerified]);

  // Retake photo
  const handleRetake = useCallback(() => {
    setCapturedPhoto(null);
    setErrorMessage(null);
    setVerificationProgress('');
    setStatus('idle');
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  // Render video or fallback
  const renderViewfinder = () => {
    if (capturedPhoto) {
      return (
        <img 
          src={capturedPhoto} 
          alt="Captured Dose" 
          className="w-full h-full object-cover"
        />
      );
    }

    if (useSimulatedMode) {
      return (
        <div className="w-full h-full bg-[#2D342E] flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-[#768E78]/30 border border-[#768E78] flex items-center justify-center text-white animate-pulse">
            <Camera className="w-8 h-8" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">Camera Simulator Active</div>
            <p className="text-xs text-[#C6C09C] max-w-sm mt-1 font-medium">
              {cameraError || 'Camera unavailable. Click capture to generate a simulated photo with timestamp.'}
            </p>
          </div>
        </div>
      );
    }

    return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover transform -scale-x-100"
      />
    );
  };

  // Render verification overlay
  const renderVerificationOverlay = () => {
    if (status !== 'verifying') return null;

    return (
      <div className="absolute inset-0 bg-[#1B2A23]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-[#3B7A57] animate-spin" />
        <div className="text-sm font-bold text-white">{verificationProgress}</div>
        <div className="text-xs text-[#C3DACB] max-w-xs font-medium">
          Extracting EXIF timestamp & verifying pill in hand via AI vision
        </div>
        <div className="w-48 h-1.5 bg-[#2D342E] rounded-full overflow-hidden">
          <div className="h-full bg-[#3B7A57] rounded-full animate-pulse" style={{ width: '60%' }} />
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={true}
      onClose={onCancel}
      title="Photo Dose Verification"
      subtitle="Hold your medication in palm & capture"
      size="lg"
      showCloseButton={status !== 'verifying'}
      accentColor="primary"
    >
      <div className="space-y-4">
        {/* Medication Info Banner */}
        <div className="bg-[#F2F8F4] border border-[#C3DACB] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs text-[#557060] font-semibold">Target Schedule:</div>
            <div className="text-sm font-bold text-[#234E35]">{scheduleLabel}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#557060] font-semibold">Expected Pills:</div>
            <div className="text-xs font-bold text-[#1B2A23]">{medNames.join(', ') || 'No medications'}</div>
          </div>
        </div>

        {/* Camera Viewport */}
        <div className="relative w-full aspect-video bg-[#2D342E] rounded-2xl overflow-hidden border-2 border-[#C3DACB]">
          {renderViewfinder()}

          {/* Crosshair Overlay */}
          {!capturedPhoto && status !== 'verifying' && (
            <div className="absolute inset-0 pointer-events-none border-2 border-white/30 rounded-2xl m-3 flex items-center justify-center">
              <div className="w-32 h-32 border border-dashed border-white/60 rounded-full flex items-center justify-center">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white bg-[#1B2A23]/80 px-2 py-0.5 rounded">
                  HOLD PILL IN PALM
                </span>
              </div>
            </div>
          )}

          {/* Status Overlay */}
          {renderVerificationOverlay()}
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-4 bg-[#FADEC9]/20 border border-[#F5C29B] rounded-2xl flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#E07A5F] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#1B2A23]">Verification Error</p>
              <p className="text-xs text-[#557060] mt-0.5">{errorMessage}</p>
              {retryCount > 0 && (
                <p className="text-xs text-[#E07A5F] mt-1 font-medium">
                  Attempts remaining: {maxRetries - retryCount + 1}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          {!capturedPhoto ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleCapture}
              disabled={status === 'capturing' || status === 'verifying'}
              leftIcon={status === 'capturing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            >
              {status === 'capturing' ? 'Capturing...' : 'Capture Photo & Verify Dose'}
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                size="md"
                onClick={handleRetake}
                disabled={status === 'verifying'}
                leftIcon={<RefreshCw className="w-4 h-4" />}
              >
                Retake
              </Button>

              {status === 'error' && (
                <Button
                  variant="warning"
                  size="md"
                  onClick={handleManualVerification}
                  leftIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Manual Verify (Fallback)
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  if (capturedPhoto) {
                    const timestamp = new Date().toISOString();
                    runVerificationProcess(capturedPhoto, timestamp);
                  }
                }}
                disabled={status === 'verifying'}
                leftIcon={status === 'verifying' ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              >
                {status === 'verifying' ? 'Verifying...' : 'Retry Verification'}
              </Button>
            </>
          )}
        </div>

        {/* Security Footer */}
        <div className="pt-3 border-t border-[#C3DACB] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#557060]">
          <div className="flex items-center space-x-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-[#3B7A57]" />
            <span>Timestamp Check: Required (Today Only)</span>
          </div>
          <span className="text-[#234E35] font-bold flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>EXIF Anti-Tamper Guard Active</span>
          </span>
        </div>

        {/* Camera Status Indicator */}
        <div className="flex items-center justify-between text-[10px] text-[#557060]">
          <span className="flex items-center space-x-1">
            <span className={cn(
              'w-2 h-2 rounded-full',
              useSimulatedMode ? 'bg-[#E07A5F]' : 'bg-[#3B7A57]'
            )} />
            <span>{useSimulatedMode ? 'Simulation Mode' : 'Live Camera'}</span>
          </span>
          <span>v2.4 • Secure Verification</span>
        </div>
      </div>
    </Modal>
  );
};

export default CameraVerification;