// src/components/SignUpModal.tsx
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
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('Spouse / Partner');
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['Acid Reflux / GERD']);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');

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
    if (!pwd) return { score: 0, label: '', color: 'bg-stone-300' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) return { score, label: 'Weak', color: 'bg-[#E79897]' };
    if (score === 2) return { score, label: 'Fair', color: 'bg-[#FCC88A]' };
    if (score === 3) return { score, label: 'Good', color: 'bg-[#B7CBDB]' };
    return { score, label: 'Strong', color: 'bg-[#768E78]' };
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
          stomachConditions: selectedConditions,
          emergencyContactName,
          emergencyContactPhone,
          emergencyContactRelation,
          physicianName: 'Dr. Marcus Vance, M.D.',
          physicianPhone: '+1 (555) 998-1244',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Registration failed. Please try again.');
      }

      setSuccessMessage('Account registered successfully! Loading your Hub...');

      const newProfile: UserProfile = {
        name: `${firstName} ${lastName}`,
        email,
        phoneNumber,
        age,
        stomachConditions: selectedConditions.length > 0 ? selectedConditions : ['None / Healthy Stomach'],
        physicianName: 'Dr. Marcus Vance, M.D.',
        physicianPhone: '+1 (555) 998-1244',
        emergencyContact: {
          name: emergencyContactName || 'Dr. Arthur Vance',
          phone: emergencyContactPhone || '+1 (555) 998-1244',
          relation: emergencyContactRelation || 'Spouse / Partner',
        },
        onboardingCompleted: true,
      };

      // Store the token for future requests
      if (data.accessToken) {
        localStorage.setItem('dosepact_token', data.accessToken);
        if (data.user?.id) {
          localStorage.setItem('dosepact_user_id', data.user.id);
        }
      }

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

    if (!signInEmail || !signInPassword) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: signInEmail, 
          password: signInPassword 
        }),
        credentials: 'include', // Important for session cookies
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Invalid credentials');
      }

      setSuccessMessage('Welcome back! Loading your adherence schedule...');

      // Store token for future API calls
      if (data.accessToken) {
        localStorage.setItem('dosepact_token', data.accessToken);
        if (data.user?.id) {
          localStorage.setItem('dosepact_user_id', data.user.id);
        }
      }

      const user = data.user || {};
      const newProfile: UserProfile = {
        name: `${user.firstName || 'Eleanor'} ${user.lastName || 'Vance'}`,
        email: user.email || signInEmail,
        phoneNumber: user.phoneNumber || '',
        age: user.age || 48,
        stomachConditions: user.stomachConditions || ['Acid Reflux / GERD'],
        physicianName: user.physicianName || 'Dr. Marcus Vance, M.D.',
        physicianPhone: user.physicianPhone || '+1 (555) 998-1244',
        emergencyContact: {
          name: user.emergencyContact?.name || 'Dr. Arthur Vance',
          phone: user.emergencyContact?.phoneNumber || '+1 (555) 998-1244',
          relation: user.emergencyContact?.relationship || 'Spouse / Partner',
        },
        onboardingCompleted: user.onboardingCompleted || true,
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
    <div className="min-h-screen bg-[#FAF6EE] text-[#2D342E] flex flex-col justify-between relative overflow-x-hidden selection:bg-[#768E78] selection:text-white">
      {/* Top Page Header */}
      <header className="w-full border-b border-[#EBDEC0] bg-white/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-8 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#768E78] flex items-center justify-center text-white shadow-sm">
              <ShieldAlert className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2D342E]">
                AETERNA <span className="text-[#768E78] font-normal text-base sm:text-lg">DosePact</span>
              </h1>
              <p className="text-[11px] text-[#6B756C] font-semibold hidden sm:block">
                Precision Medication Adherence & GI Safety Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Switch Pills */}
            <div className="flex bg-[#FAF6EE] p-1 rounded-2xl border border-[#EBDEC0]">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setErrorMessage(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-[#768E78] text-white shadow-sm'
                    : 'text-[#2D342E] hover:bg-[#EBDEC0]/40'
                }`}
              >
                Sign Up
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('signin'); setErrorMessage(null); }}
                className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  authMode === 'signin'
                    ? 'bg-[#768E78] text-white shadow-sm'
                    : 'text-[#2D342E] hover:bg-[#EBDEC0]/40'
                }`}
              >
                Sign In
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-white text-[#2D342E] hover:bg-[#EBDEC0]/40 text-xs font-bold transition-all border border-[#EBDEC0] cursor-pointer hidden md:flex items-center space-x-1"
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
            <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-[#EBDEC0] text-[#2D342E] border border-[#C6C09C] text-xs font-bold">
              <Sparkles className="w-4 h-4 text-[#768E78]" />
              <span>Next-Gen Adherence Security</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#2D342E] leading-tight">
              Never Miss a Dose. <br />
              <span className="text-[#768E78]">Protect Your Stomach.</span>
            </h2>

            <p className="text-sm text-[#6B756C] leading-relaxed font-medium">
              Aeterna DosePact enforces dose verification using photo timestamps, audio synthesizer alarms, and Gemini AI stomach sensitivity monitoring.
            </p>

            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-[#EBDEC0] shadow-sm flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-[#EBDEC0] text-[#2D342E]">
                  <ShieldAlert className="w-5 h-5 text-[#768E78]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D342E]">Escalating Persistent Alarms</h4>
                  <p className="text-xs text-[#6B756C] font-medium mt-0.5">Continuous web audio chimes that escalate until dose is verified via camera photo.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EBDEC0] shadow-sm flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-[#EBDEC0] text-[#2D342E]">
                  <HeartPulse className="w-5 h-5 text-[#768E78]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D342E]">GI Stomach Safety Engine</h4>
                  <p className="text-xs text-[#6B756C] font-medium mt-0.5">Evaluates NSAIDs, food buffering rules, and ulcer sensitivities automatically.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EBDEC0] shadow-sm flex items-start space-x-3">
                <div className="p-2 rounded-xl bg-[#EBDEC0] text-[#2D342E]">
                  <UserCheck className="w-5 h-5 text-[#768E78]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#2D342E]">Caregiver Escalation Network</h4>
                  <p className="text-xs text-[#6B756C] font-medium mt-0.5">Alerts emergency contacts automatically if a dose remains unverified.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sign Up / Sign In Form Card */}
          <div className="lg:col-span-7 bg-white border border-[#EBDEC0] rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6 pb-4 border-b border-[#EBDEC0] flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#2D342E]">
                  {authMode === 'signup' ? 'Create Patient Profile' : 'Sign In to DosePact'}
                </h3>
                <p className="text-xs text-[#6B756C] font-medium mt-1">
                  {authMode === 'signup' 
                    ? 'Enter your profile details to activate your personalized schedule.'
                    : 'Access your medication log history and provider export reports.'}
                </p>
              </div>
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-[#E79897]/20 border border-[#E79897] text-[#B95B5A] text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-[#EBDEC0] border border-[#C6C09C] text-[#2D342E] text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-[#768E78] shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Form */}
            {authMode === 'signup' ? (
              <form onSubmit={handleSubmitSignUp} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">First Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                        placeholder="Eleanor"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Last Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                        placeholder="Vance"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                        placeholder="patient@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Date of Birth (18+) *</label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                      <input
                        type="date"
                        required
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                        className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-10 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#6B756C] hover:text-[#2D342E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B756C]">
                        <span>Password Strength:</span>
                        <span className="font-bold">{passwordStrength.label}</span>
                      </div>
                      <div className="h-1.5 w-full bg-[#EBDEC0] rounded-full overflow-hidden">
                        <div
                          className={`h-full ${passwordStrength.color} transition-all duration-300`}
                          style={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Primary Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Emergency Contact Name</label>
                    <input
                      type="text"
                      value={emergencyContactName}
                      onChange={(e) => setEmergencyContactName(e.target.value)}
                      className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl px-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                      placeholder="e.g. Dr. Arthur Vance"
                    />
                  </div>
                </div>

                {/* Emergency Contact Phone & Relation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Emergency Contact Phone</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                      <input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                        placeholder="+1 (555) 998-1244"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Emergency Contact Relation</label>
                    <select
                      value={emergencyContactRelation}
                      onChange={(e) => setEmergencyContactRelation(e.target.value)}
                      className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl px-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                    >
                      <option value="Spouse / Partner">Spouse / Partner</option>
                      <option value="Primary Care Physician">Primary Care Physician</option>
                      <option value="Parent / Guardian">Parent / Guardian</option>
                      <option value="Adult Child">Adult Child</option>
                      <option value="Caregiver / Nurse">Caregiver / Nurse</option>
                      <option value="Close Friend">Close Friend / Neighbor</option>
                    </select>
                  </div>
                </div>

                {/* Stomach Conditions Select */}
                <div>
                  <label className="block text-xs font-bold text-[#6B756C] uppercase tracking-wider mb-2">
                    Stomach & GI Conditions (For AI Safety)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {STOMACH_CONDITIONS_LIST.map((cond) => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => toggleCondition(cond)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#EBDEC0] border-[#C6C09C] text-[#2D342E]'
                              : 'bg-[#FAF6EE] border-[#EBDEC0] text-[#6B756C] hover:bg-[#EBDEC0]/30'
                          }`}
                        >
                          {cond}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-[#768E78] hover:bg-[#5C705E] text-white font-bold text-sm tracking-wide shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>Registering Account...</span>
                  ) : (
                    <>
                      <span>Complete Registration & Open Hub</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitSignIn} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                      placeholder="patient@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6B756C] mb-1.5">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B756C] absolute left-3.5 top-3.5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full bg-[#FAF6EE] border border-[#EBDEC0] rounded-2xl pl-10 pr-10 py-3 text-sm text-[#2D342E] focus:outline-none focus:border-[#768E78] transition-colors"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#6B756C] hover:text-[#2D342E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-[#768E78] hover:bg-[#5C705E] text-white font-bold text-sm tracking-wide shadow-sm transition-all flex items-center justify-center space-x-2 cursor-pointer mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span>Signing In...</span>
                  ) : (
                    <>
                      <span>Sign In & Access Patient Portal</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="mt-6 pt-4 border-t border-[#EBDEC0] text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-[#6B756C] hover:text-[#2D342E] cursor-pointer"
              >
                Continue in Guest Preview Mode →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#EBDEC0] bg-white py-4 px-4 text-center text-xs text-[#6B756C] font-semibold">
        <p>© 2026 Aeterna DosePact Health. Photo-verified medication adherence platform.</p>
      </footer>
    </div>
  );
};