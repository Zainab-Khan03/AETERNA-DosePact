import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Music, Upload, Play, Square, Trash2, Check, Sparkles, AlertCircle, X, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AlarmSound {
  id: string;
  name: string;
  fileUrl: string;
  duration?: number;
  isCustom?: boolean;
}

interface AlarmCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AlarmCustomizerModal: React.FC<AlarmCustomizerModalProps> = ({ isOpen, onClose }) => {
  const [sounds, setSounds] = useState<AlarmSound[]>([
    { id: 'sound-1', name: 'Gentle Wake Bell', fileUrl: '/sounds/gentle-wake.mp3', duration: 15 },
    { id: 'sound-2', name: 'Medical Chime High Intensity', fileUrl: '/sounds/medical-chime.mp3', duration: 30 },
    { id: 'sound-3', name: 'Urgent Alarm Pulse', fileUrl: '/sounds/urgent-pulse.mp3', duration: 45 },
    { id: 'sound-4', name: 'Soft Harmonic Tone', fileUrl: '/sounds/soft-tone.mp3', duration: 20 },
  ]);

  const [selectedSoundId, setSelectedSoundId] = useState<string>('sound-1');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingSoundId, setEditingSoundId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startRenaming = (sound: AlarmSound) => {
    setEditingSoundId(sound.id);
    setRenameValue(sound.name);
  };

  const handleSaveRename = async (soundId: string) => {
    if (!renameValue.trim()) return;
    try {
      const res = await fetch(`/api/alarm/sound/${soundId}/rename`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      const data = await res.json();
      if (data.sounds) {
        setSounds(data.sounds);
      } else {
        setSounds((prev) => prev.map((s) => (s.id === soundId ? { ...s, name: renameValue.trim() } : s)));
      }
      setUploadMessage(`Sound track renamed to "${renameValue.trim()}"`);
    } catch (err) {
      setSounds((prev) => prev.map((s) => (s.id === soundId ? { ...s, name: renameValue.trim() } : s)));
    } finally {
      setEditingSoundId(null);
    }
  };

  // Fetch sounds from backend on mount
  useEffect(() => {
    fetchSounds();
  }, []);

  const fetchSounds = async () => {
    try {
      const res = await fetch('/api/alarms/sounds');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSounds(data);
        }
      }
    } catch (err) {
      console.warn('Using local default sounds:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|aac)$/i)) {
      setUploadError('Please select a valid audio file (.mp3, .wav, .ogg, .m4a)');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append('audio', file);
    formData.append('name', file.name.replace(/\.[^/.]+$/, ''));

    try {
      const res = await fetch('/api/alarm/upload-sound', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload audio file');
      }

      setUploadMessage(`"${data.sound.name}" uploaded successfully!`);
      if (data.sounds) {
        setSounds(data.sounds);
      } else if (data.sound) {
        setSounds((prev) => [...prev, data.sound]);
      }
      setSelectedSoundId(data.sound.id);
    } catch (err: any) {
      setUploadError(err.message || 'Error uploading custom alarm music');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const togglePreview = (sound: AlarmSound) => {
    if (playingId === sound.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      try {
        const audio = new Audio(sound.fileUrl);
        audio.play().catch(() => {
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, ctx.currentTime);
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          setTimeout(() => {
            osc.stop();
            ctx.close();
            setPlayingId(null);
          }, 2000);
        });
        audioRef.current = audio;
        audio.onended = () => setPlayingId(null);
        setPlayingId(sound.id);
      } catch (err) {
        setPlayingId(null);
      }
    }
  };

  const handleSetDefault = async (soundId: string) => {
    setSelectedSoundId(soundId);
    try {
      await fetch(`/api/alarm/set-default/${soundId}`, { method: 'PUT' });
    } catch (err) {
      console.warn('Set default sound fallback');
    }
  };

  const handleDeleteSound = async (soundId: string) => {
    try {
      const res = await fetch(`/api/alarm/sound/${soundId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.sounds) {
        setSounds(data.sounds);
      } else {
        setSounds((prev) => prev.filter((s) => s.id !== soundId));
      }
      if (selectedSoundId === soundId) {
        setSelectedSoundId(sounds[0]?.id || 'sound-1');
      }
    } catch (err) {
      setSounds((prev) => prev.filter((s) => s.id !== soundId));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2D342E]/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-[#FAF6EE] border border-[#EBDEC0] rounded-3xl p-6 text-[#2D342E] shadow-xl relative overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#EBDEC0] pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-[#EBDEC0] text-[#2D342E] border border-[#C6C09C]">
                <Music className="w-5 h-5 text-[#768E78]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2D342E]">Custom Alarm Sound Manager</h2>
                <p className="text-xs text-[#6B756C] font-semibold">Upload & Personalize Alarm Tones (MP3, WAV, M4A)</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#6B756C] hover:text-[#2D342E] hover:bg-[#EBDEC0]/40 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications */}
          {uploadMessage && (
            <div className="mb-4 p-3 rounded-2xl bg-[#EBDEC0] border border-[#C6C09C] text-[#2D342E] text-xs font-bold flex items-center space-x-2">
              <Sparkles className="w-4 h-4 shrink-0 text-[#768E78]" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="mb-4 p-3 rounded-2xl bg-[#E79897]/20 border border-[#E79897] text-[#B95B5A] text-xs font-bold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {/* Upload Dropzone / Button */}
          <div className="mb-6 p-5 rounded-2xl bg-white border-2 border-dashed border-[#C6C09C] hover:border-[#768E78] transition-all text-center relative cursor-pointer">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,.mp3,.wav,.ogg,.m4a"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-[#768E78] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#2D342E]">Click or Drag custom alarm music here</p>
            <p className="text-xs text-[#6B756C] mt-1 font-medium">Supports MP3, WAV, OGG, M4A up to 10MB</p>

            {isUploading && (
              <div className="mt-3 text-xs text-[#768E78] font-bold flex items-center justify-center space-x-2">
                <div className="w-3.5 h-3.5 border-2 border-[#768E78] border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading and processing audio track...</span>
              </div>
            )}
          </div>

          {/* Sounds List */}
          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            <p className="text-xs uppercase tracking-wider font-bold text-[#6B756C]">Available Sound Tracks</p>
            {sounds.map((sound) => {
              const isSelected = selectedSoundId === sound.id;
              const isPlaying = playingId === sound.id;

              return (
                <div
                  key={sound.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#EBDEC0] border-[#C6C09C]'
                      : 'bg-white border-[#EBDEC0] hover:border-[#C6C09C]'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => togglePreview(sound)}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer ${
                        isPlaying
                          ? 'bg-[#E79897] text-white shadow-sm'
                          : 'bg-[#FAF6EE] text-[#768E78] hover:bg-[#768E78] hover:text-white'
                      }`}
                    >
                      {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <div className="min-w-0 flex-1">
                      {editingSoundId === sound.id ? (
                        <div className="flex items-center space-x-2 my-0.5">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(sound.id);
                              if (e.key === 'Escape') setEditingSoundId(null);
                            }}
                            autoFocus
                            className="text-xs font-bold text-[#2D342E] bg-white border border-[#768E78] rounded-lg px-2 py-1 focus:outline-none w-full"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveRename(sound.id)}
                            className="p-1 rounded bg-[#768E78] text-white hover:bg-[#5C705E] cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSoundId(null)}
                            className="p-1 rounded bg-[#E79897] text-white hover:bg-[#b95b5a] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-[#2D342E] truncate">{sound.name}</span>
                          <button
                            type="button"
                            onClick={() => startRenaming(sound)}
                            className="p-1 rounded text-[#6B756C] hover:text-[#2D342E] hover:bg-white/60 transition-all cursor-pointer"
                            title="Rename alarm track"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {sound.isCustom && (
                            <span className="px-2 py-0.5 rounded-full bg-[#EBDEC0] text-[#2D342E] text-[10px] font-bold border border-[#C6C09C]">
                              Custom
                            </span>
                          )}
                        </div>
                      )}
                      <span className="text-[11px] text-[#6B756C] font-medium block">
                        {sound.duration ? `${sound.duration}s duration` : 'Standard alarm track'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSetDefault(sound.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        isSelected
                          ? 'bg-[#768E78] text-white'
                          : 'bg-white text-[#2D342E] border border-[#EBDEC0] hover:bg-[#FAF6EE]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Selected</span>
                        </>
                      ) : (
                        <span>Set Default</span>
                      )}
                    </button>

                    {sound.isCustom && (
                      <button
                        type="button"
                        onClick={() => handleDeleteSound(sound.id)}
                        className="p-2 rounded-xl text-[#E79897] hover:bg-[#E79897]/20 transition-all cursor-pointer"
                        title="Delete custom sound"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-[#EBDEC0] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-2xl bg-[#768E78] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#5C705E] transition-all cursor-pointer"
            >
              Done & Save Sound
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
