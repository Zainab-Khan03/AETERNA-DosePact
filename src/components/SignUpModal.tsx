import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Calendar, 
  Phone, 
  ShieldAlert, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  HeartPulse, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpSuccess: (profile: UserProfile, token: string) => void;
}

const STOMACH_CONDITIONS_LIST = [
  'Acid Reflux / GERD',
  'Gastritis',
  'Peptic Ulcer History',
  'Sensitive Gastric Mucosa',
  'Irritable Bowel Syndrome (IBS)',
  'None / Healthy Stomach',
];

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen = true,
  onClose,
  onSignUpSuccess,
}) => {
  const [authMode, setAuthMode] = useState<'signup' | 'signin'>('signup');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign Up Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1995-06-15');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Acid Reflux / GERD']);

  if (isOpen === false) return null;

  const toggleCondition = (cond: string) => {
    if (cond === 'None / Healthy Stomach') {
      setSelectedConditions(['None / Healthy Stomach']);
      return;
    }
    const filtered = selectedConditions.filter(c => c !== 'None / Healthy Stomach');
    if (filtered.includes(cond)) {
      setSelectedConditions(filtered.filter(c => c !== cond));
    } else {
      setSelectedConditions([...filtered, cond]);
    }
  };

  // Password strength checker
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-gray-600' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score, label: 'Good', color: 'bg-blue-500' };
    return { score, label: 'Strong', color: 'bg-[#00CED1]' };
  };

  const passwordStrength = getPasswordStrength(password);

  // Calculate age from Date of Birth
  const calculateAge = (dobString: string) => {
    if (!dobString) return 30;
    const dob = new Date(dobString);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const handleSubmitSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Validation
    if (!firstName || !lastName || !email || !password || !dateOfBirth) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const age = calculateAge(dateOfBirth);
    if (age < 18) {
      setErrorMessage('You must be at least 18 years of age to register.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          dateOfBirth,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccessMessage('Account registered successfully! Loading your Hub...');

      const newProfile: UserProfile = {
        name: `${firstName} ${lastName}`,
        email,
        phoneNumber,
        age,
        stomachConditions: selectedConditions.length > 0 ? selectedConditions : ['None / Healthy Stomach'],
        physicianName: 'Dr. Marcus Vance, M.D.',
        emergencyContact: emergencyContactName 
          ? `${emergencyContactName} (${emergencyContactPhone || 'N/A'})` 
          : '+1 (555) 392-8811',
        onboardingCompleted: true,
      };

      setTimeout(() => {
        setIsLoading(false);
        onSignUpSuccess(newProfile, data.accessToken || 'token_registered');
        onClose();
      }, 1000);

    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'An error occurred during registration.');
    }
  };

  const handleSubmitSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      setSuccessMessage('Welcome back! Loading your adherence schedule...');

      const userObj = data.user || {};
      const newProfile: UserProfile = {
        name: `${userObj.firstName || 'Eleanor'} ${userObj.lastName || 'Vance'}`,
        email: userObj.email || email,
        phoneNumber: userObj.phoneNumber || '',
        age: 48,
        stomachConditions: ['Acid Reflux / GERD'],
        physicianName: 'Dr. Marcus Vance, M.D.',
        emergencyContact: '+1 (555) 392-8811',
        onboardingCompleted: true,
      };

      setTimeout(() => {
        setIsLoading(false);
        onSignUpSuccess(newProfile, data.accessToken || 'token_signed_in');
        onClose();
      }, 1000);

    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Sign in failed. Check email & password.');
    }
  };

  return (
    <div className="min-h-screen bg-[#1F140D] text-[#F5F5DC] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#00CED1] selection:text-[#1F140D]">
      {/* Background Glowing Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00CED1]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-[#FF4500]/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Page Header */}
      <header className="w-full border-b border-[#00CED1]/15 bg-[#170E09]/80 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00CED1] to-[#40E0D0] flex items-center justify-center text-[#1F140D] shadow-[0_0_20px_rgba(0,206,209,0.4)]">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#00CED1]">
                AETERNA <span className="text-[#F5F5DC] font-serif italic font-normal text-base sm:text-lg">DosePact</span>
              </h1>
              <p className="text-[11px] text-[#A89888] hidden sm:block">
                Precision Medication Adherence & GI Safety Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Switch Pills */}
            <div className="flex bg-[#2A1B12] p-1 rounded-2xl border border-[#00CED1]/20">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#00CED1] text-[#1F140D] shadow-md'
                    : 'text-[#F5F5DC]/70 hover:text-[#F5F5DC]'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#00CED1] text-[#1F140D] shadow-md'
                    : 'text-[#F5F5DC]/70 hover:text-[#F5F5DC]'
                }`}
              >
                Sign In
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#3D2B1F] text-[#00CED1] hover:bg-[#00CED1] hover:text-[#1F140D] text-xs font-bold transition-all border border-[#00CED1]/30 cursor-pointer hidden md:flex items-center space-x-1"
            >
              <span>Guest Preview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Platform Feature Highlights */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#00CED1]/15 text-[#7FFFD4] border border-[#00CED1]/30 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#00CED1]" />
              <span>Next-Gen Adherence Security</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F5F5DC] leading-tight font-serif italic">
              Never Miss a Dose. <br />
              <span className="text-[#00CED1] not-italic font-sans">Protect Your Stomach Health.</span>
            </h2>

            <p className="text-sm text-[#A89888] leading-relaxed">
              AETERNA DosePact pairs real-time photo dose verification with gastric risk intelligence, persistent escalation alarms, and custom audio sound tracks to keep your medication schedule flawless.
            </p>

            {/* Feature Cards Grid */}
            <div className="space-y-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-[#2A1B12] border border-[#00CED1]/20 flex items-start space-x-3.5 hover:border-[#00CED1]/40 transition-all">
                <div className="p-2.5 rounded-xl bg-[#00CED1]/15 text-[#00CED1] shrink-0">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5DC]">Stomach & GI Risk Protection</h3>
                  <p className="text-xs text-[#A89888] mt-0.5">Automated detection for NSAID mucosal risks, gastritis warnings, and food timing constraints.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#2A1B12] border border-[#00CED1]/20 flex items-start space-x-3.5 hover:border-[#00CED1]/40 transition-all">
                <div className="p-2.5 rounded-xl bg-[#00CED1]/15 text-[#00CED1] shrink-0">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5DC]">Vision Photo Dose Verification</h3>
                  <p className="text-xs text-[#A89888] mt-0.5">Native camera capture with EXIF anti-tamper guards to confirm pills in palm before clearing alarms.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#2A1B12] border border-[#00CED1]/20 flex items-start space-x-3.5 hover:border-[#00CED1]/40 transition-all">
                <div className="p-2.5 rounded-xl bg-[#00CED1]/15 text-[#00CED1] shrink-0">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#F5F5DC]">Persistent Escalation Alarms</h3>
                  <p className="text-xs text-[#A89888] mt-0.5">Custom MP3/WAV alarm audio support with 3-tier persistent escalation until photo proof is logged.</p>
                </div>
              </div>
            </div>

            {/* Guest button for mobile/tablet */}
            <div className="pt-2 md:hidden">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 px-4 rounded-2xl bg-[#2A1B12] text-[#00CED1] border border-[#00CED1]/30 font-bold text-xs text-center"
              >
                Explore Hub in Guest Mode →
              </button>
            </div>
          </div>

          {/* Right Column: Authentication Form Card */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#2A1B12] border border-[#00CED1]/30 rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)] text-[#F5F5DC] relative overflow-hidden"
            >
              {/* Decorative Teal Spine Accent */}
              <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-[#00CED1] via-[#40E0D0] to-[#00CED1]" />

              <div className="flex items-center justify-between border-b border-[#00CED1]/15 pb-4 mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F5F5DC] font-sans">
                    {authMode === 'signup' ? 'Create Patient Account' : 'Sign In to DosePact'}
                  </h2>
                  <p className="text-xs text-[#00CED1] font-semibold mt-1">
                    {authMode === 'signup' 
                      ? 'Step 1 of 3: Personal Credentials & GI Health Profile' 
                      : 'Access your persistent medication schedules & photo logs'}
                  </p>
                </div>

                <div className="hidden sm:block">
                  <span className="px-3 py-1 rounded-full bg-[#00CED1]/15 text-[#00CED1] border border-[#00CED1]/30 text-xs font-bold uppercase tracking-wider">
                    {authMode === 'signup' ? 'New Patient' : 'Returning Patient'}
                  </span>
                </div>
              </div>

              {/* Error & Success Messages */}
              {errorMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#FF4500]/15 border border-[#FF4500]/40 text-[#FF6347] text-xs flex items-center space-x-2.5 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#FF4500]" />
                  <span className="font-medium">{errorMessage}</span>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 p-3.5 rounded-2xl bg-[#00CED1]/15 border border-[#00CED1]/40 text-[#00CED1] text-xs flex items-center space-x-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#00CED1]" />
                  <span className="font-bold">{successMessage}</span>
                </div>
              )}

              {/* SIGN UP FORM */}
              {authMode === 'signup' ? (
                <form onSubmit={handleSubmitSignUp} className="space-y-5">
                  <div className="bg-[#1F140D]/80 p-4 sm:p-5 rounded-2xl border border-[#00CED1]/15 space-y-4">
                    <h3 className="text-xs font-bold text-[#00CED1] uppercase tracking-wider flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>1. Personal Credentials</span>
                    </h3>

                    {/* Name Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Eleanor"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Vance"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#A89888]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none transition-colors"
                        />
                      </div>
                    </div>

                    {/* Password with Strength Indicator */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                        Password * (min. 8 characters)
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A89888]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-[#A89888] hover:text-[#F5F5DC]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {password && (
                        <div className="mt-2 flex items-center space-x-2">
                          <div className="flex-1 h-1.5 bg-[#2A1B12] rounded-full overflow-hidden flex space-x-1">
                            <div className={`h-full ${passwordStrength.color} transition-all duration-300`} style={{ width: `${(passwordStrength.score / 4) * 100}%` }} />
                          </div>
                          <span className="text-[10px] text-[#A89888] uppercase font-bold">
                            {passwordStrength.label}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* DOB & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                          Date of Birth * (Must be 18+)
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 absolute left-3.5 top-3 text-[#A89888]" />
                          <input
                            type="date"
                            required
                            value={dateOfBirth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 absolute left-3.5 top-3 text-[#A89888]" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+1 (555) 392-8811"
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stomach & Health Preferences */}
                  <div className="bg-[#1F140D]/80 p-4 sm:p-5 rounded-2xl border border-[#00CED1]/15 space-y-3">
                    <h3 className="text-xs font-bold text-[#00CED1] uppercase tracking-wider flex items-center space-x-2">
                      <HeartPulse className="w-4 h-4" />
                      <span>2. Stomach & GI Risk Profile</span>
                    </h3>

                    <p className="text-xs text-[#A89888]">
                      Select any stomach or GI conditions to customize interaction safety rules:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {STOMACH_CONDITIONS_LIST.map((cond) => {
                        const isSelected = selectedConditions.includes(cond);
                        return (
                          <button
                            key={cond}
                            type="button"
                            onClick={() => toggleCondition(cond)}
                            className={`px-3 py-2.5 rounded-xl text-xs font-medium border text-left transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? 'bg-[#00CED1]/15 border-[#00CED1] text-[#00CED1] font-bold'
                                : 'bg-[#2A1B12] border-[#4A3225] text-[#A89888] hover:border-[#00CED1]/40 hover:text-[#F5F5DC]'
                            }`}
                          >
                            <span>{cond}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#00CED1] shrink-0 ml-1" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Emergency Contact Optional */}
                  <div className="bg-[#1F140D]/80 p-4 sm:p-5 rounded-2xl border border-[#00CED1]/15 space-y-3">
                    <h3 className="text-xs font-bold text-[#A89888] uppercase tracking-wider">
                      3. Emergency Contact / Physician (Optional)
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <input
                        type="text"
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="Physician Name (e.g. Dr. Vance)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none"
                      />
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="Emergency Phone"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-5 py-3 text-xs text-[#00CED1] font-bold hover:underline transition-all cursor-pointer text-center"
                    >
                      Skip & Enter Guest Mode →
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00A8A8] via-[#00CED1] to-[#40E0D0] text-[#120B07] font-bold text-sm shadow-[0_0_25px_rgba(0,206,209,0.4)] hover:shadow-[0_0_35px_rgba(0,206,209,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <span className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-[#120B07] border-t-transparent rounded-full animate-spin" />
                          <span>Creating Account...</span>
                        </span>
                      ) : (
                        <>
                          <span>Complete Sign Up</span>
                          <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                /* SIGN IN FORM */
                <form onSubmit={handleSubmitSignIn} className="space-y-5 pt-2">
                  <div className="bg-[#1F140D]/80 p-5 rounded-2xl border border-[#00CED1]/15 space-y-4">
                    <h3 className="text-xs font-bold text-[#00CED1] uppercase tracking-wider flex items-center space-x-2">
                      <UserCheck className="w-4 h-4" />
                      <span>Patient Authorization</span>
                    </h3>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                        Registered Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#A89888]" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#A89888] font-bold mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#A89888]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#2A1B12] border border-[#4A3225] text-xs text-[#F5F5DC] focus:border-[#00CED1] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-3 text-[#A89888] hover:text-[#F5F5DC]"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between pt-3 gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="w-full sm:w-auto px-5 py-3 text-xs text-[#00CED1] font-bold hover:underline transition-all cursor-pointer text-center"
                    >
                      Skip & Enter Guest Mode →
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00A8A8] via-[#00CED1] to-[#40E0D0] text-[#120B07] font-bold text-sm shadow-[0_0_25px_rgba(0,206,209,0.4)] hover:shadow-[0_0_35px_rgba(0,206,209,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <span className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-[#120B07] border-t-transparent rounded-full animate-spin" />
                          <span>Signing In...</span>
                        </span>
                      ) : (
                        <>
                          <span>Sign In to Hub</span>
                          <ArrowRight className="w-4 h-4 stroke-[3]" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#00CED1]/15 bg-[#170E09]/90 py-4 px-4 sm:px-8 text-center text-xs text-[#A89888] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>AETERNA DosePact Adherence Platform &copy; 2026. All Rights Reserved.</span>
          <span className="text-[#00CED1]">Encrypted MongoDB & Auth Token Session Secured</span>
        </div>
      </footer>
    </div>
  );
};

