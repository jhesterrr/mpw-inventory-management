import { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Check,
  Layers,
  Sparkles,
  TrendingUp,
  BarChart3,
  Activity,
  Box,
} from 'lucide-react';
import { useAppStore } from '@/store';
import { seedUsers } from '@/data/seed';
import type { UserRole } from '@/types';
import { cn } from '@/utils';
import TiltedCard from '@/components/common/TiltedCard';
import TypewriterText from '@/components/common/TypewriterText';
import AnimatedInput from '@/components/common/AnimatedInput';

type AuthMode = 'login' | 'signup';

const demoAccounts = [
  { email: 'GilbertRed@mpw.com', password: 'mpw@123', role: 'Admin / Editor', roleTag: 'editor' as UserRole, username: 'GilbertRed' },
  { email: 'YvesWhite@mpw.com', password: 'mpw@123', role: 'Warehouse Staff', roleTag: 'warehouse' as UserRole, username: 'YvesWhite' },
  { email: 'ThomasCustomer@mpw.com', password: 'mpw@123', role: 'Customer', roleTag: 'customer' as UserRole, username: 'ThomasCustomer' },
];

/**
 * Visual illustration on the left panel closely recreating the reference design:
 * - Rounded badge icon at the top
 * - Bold punchy headline ("One click to go all digital." / "Control inventory in one touch.")
 * - Soft geometric honeycomb / hexagon grid in background
 * - Isometric 3D-styled floating tablet dashboard wrapped in interactive TiltedCard
 * - Stylized character observing the dashboard
 * - Indoor plant & soft drop-shadow stage
 */
function VisualShowcasePanel({ isDark, mode }: { isDark: boolean; mode: AuthMode }) {
  return (
    <div
      className={cn(
        'relative w-full lg:w-[50%] min-h-[440px] lg:min-h-[660px] p-8 sm:p-10 lg:p-12 flex flex-col justify-between overflow-hidden select-none',
        'transition-all duration-700 ease-out'
      )}
      style={{
        background: isDark
          ? 'linear-gradient(145deg, #1C050A 0%, #450813 42%, #700E20 78%, #8E162C 100%)'
          : 'linear-gradient(145deg, #4A0815 0%, #680C1E 40%, #831026 78%, #9E1630 100%)',
      }}
    >
      {/* Ambient background glow & honeycomb pattern */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft radial highlights */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-40 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-35 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.25) 0%, transparent 70%)' }}
        />

        {/* Hexagonal geometric motif from reference */}
        <div className="absolute inset-0 opacity-[0.14] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 600 700" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g stroke="#ffffff" strokeWidth="2.5" strokeDasharray="6 8">
              <polygon points="340,160 380,185 380,235 340,260 300,235 300,185" />
              <polygon points="430,130 470,155 470,205 430,230 390,205 390,155" />
              <polygon points="490,230 530,255 530,305 490,330 450,305 450,255" />
              <polygon points="400,280 440,305 440,355 400,380 360,355 360,305" />
              <polygon points="480,360 520,385 520,435 480,460 440,435 440,385" />
            </g>
            <g fill="rgba(255,255,255,0.06)">
              <polygon points="340,160 380,185 380,235 340,260 300,235 300,185" />
              <polygon points="430,130 470,155 470,205 430,230 390,205 390,155" />
              <polygon points="400,280 440,305 440,355 400,380 360,355 360,305" />
            </g>
          </svg>
        </div>
      </div>

      {/* Header section: App emblem + Typography with Typewriter animations */}
      <div className="relative z-10">
        <div className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/15 border border-white/20 backdrop-blur-md rounded-2xl px-3.5 py-2 transition-colors mb-6 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B08A24] flex items-center justify-center shadow-md">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-white font-black text-sm tracking-wider font-sans">MPW SYSTEM</span>
            <span className="text-[10px] text-white/70 block leading-none font-medium">Enterprise Inventory</span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-white tracking-tight leading-[1.15] max-w-sm min-h-[96px] sm:min-h-[105px]">
          {mode === 'login' ? (
            <>
              <TypewriterText text="One click to go" speed={40} delay={150} />
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-[#E8D499]">
                <TypewriterText text="all digital." speed={45} delay={800} cursorClassName="text-[#E8D499]" />
              </span>
            </>
          ) : (
            <>
              <TypewriterText text="Ready to elevate" speed={38} delay={150} />
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-[#E8D499]">
                <TypewriterText text="your operations?" speed={40} delay={800} cursorClassName="text-[#E8D499]" />
              </span>
            </>
          )}
        </h1>
        <p className="mt-3 text-white/75 text-xs sm:text-sm max-w-xs font-normal leading-relaxed">
          {mode === 'login'
            ? 'Real-time telemetry, automated stock requisitions, and end-to-end warehouse tracking.'
            : 'Join departments and teams managing over 2,400+ SKUs with audit-ready accuracy.'}
        </p>
      </div>

      {/* Centerpiece: Interactive 3D Tilted Card Illustration Scene */}
      <div className="relative z-10 my-auto py-6 sm:py-8 flex items-center justify-center">
        <div className="relative w-full max-w-[420px] h-[250px] sm:h-[280px] flex items-center justify-center">
          
          {/* Ground shadow oval */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-4/5 h-8 bg-black/25 rounded-full blur-lg pointer-events-none" />

          {/* Plant pot in corner (from reference) */}
          <div className="absolute bottom-6 left-2 sm:left-4 z-20 flex flex-col items-center pointer-events-none">
            {/* Leaves */}
            <div className="relative w-8 h-10 -mb-1 flex justify-center">
              <div className="absolute bottom-0 w-3 h-9 bg-emerald-400 rounded-full rotate-[-18deg] origin-bottom shadow-sm" />
              <div className="absolute bottom-0 w-3.5 h-10 bg-teal-300 rounded-full rotate-[4deg] origin-bottom shadow-sm" />
              <div className="absolute bottom-0 w-3 h-8 bg-emerald-500 rounded-full rotate-[24deg] origin-bottom shadow-sm" />
            </div>
            {/* Pot */}
            <div className="w-6 h-7 bg-[#E89E38] rounded-b-md rounded-t-sm shadow-md flex items-center justify-center">
              <div className="w-5 h-0.5 bg-[#C98124] -mt-4" />
            </div>
          </div>

          {/* Character standing (from reference) */}
          <div className="absolute bottom-5 left-12 sm:left-14 z-20 flex flex-col items-center select-none pointer-events-none group">
            {/* Head & hair */}
            <div className="relative w-7 h-8 flex flex-col items-center">
              {/* Hair */}
              <div className="w-6 h-5 bg-[#1F2937] rounded-t-full relative">
                {/* Beard */}
                <div className="absolute -bottom-2 left-1.5 w-3.5 h-3 bg-[#1F2937] rounded-b-md" />
                {/* Face skin */}
                <div className="absolute top-2 left-2 w-3 h-3 bg-[#FFCDB2] rounded-full" />
              </div>
            </div>

            {/* Torso / Salmon-pink Shirt */}
            <div className="relative w-9 h-14 bg-[#FF6B6B] rounded-t-lg rounded-b-sm shadow-sm flex flex-col items-center -mt-0.5">
              {/* Crossed arms */}
              <div className="absolute top-4 w-10 h-4 bg-[#E85D5D] rounded-full shadow-inner" />
            </div>

            {/* Legs / Dark Trousers */}
            <div className="w-8 h-16 flex gap-1 -mt-0.5">
              <div className="w-3.5 h-full bg-[#1E293B] rounded-b-sm" />
              <div className="w-3.5 h-full bg-[#1E293B] rounded-b-sm" />
            </div>

            {/* Shoes */}
            <div className="w-9 flex justify-between -mt-0.5">
              <div className="w-4 h-1.5 bg-[#0F172A] rounded-full" />
              <div className="w-4 h-1.5 bg-[#0F172A] rounded-full" />
            </div>
          </div>

          {/* Interactive React Bits TiltedCard wrapping Isometric Tablet Dashboard */}
          <div className="absolute right-0 sm:right-2 top-0 z-10 w-[245px] sm:w-[285px] h-[220px]">
            <TiltedCard
              containerHeight="220px"
              containerWidth="100%"
              imageHeight="200px"
              imageWidth="100%"
              rotateAmplitude={18}
              scaleOnHover={1.06}
              showMobileWarning={false}
              showTooltip={true}
              captionText="MPW Telemetry Hub • 3D Tilt"
            >
              <div
                className="w-full bg-white rounded-2xl p-3.5 shadow-2xl border-[3px] border-white/95 transform rotate-[-2deg] transition-all"
                style={{
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.45), 0 10px 20px -5px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Tablet top browser dots */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="w-6 h-1.5 bg-gray-200 rounded-full" />
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5F56]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FFBD2E]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-[#27C93F]" />
                  </div>
                </div>

                {/* Tablet top row: Chart graphic + lines */}
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div className="bg-gray-50 rounded-lg p-2 flex items-end gap-1 h-16 border border-gray-100">
                    <div className="w-2 h-5 bg-rose-200 rounded-t-sm" />
                    <div className="w-2 h-8 bg-rose-300 rounded-t-sm" />
                    <div className="w-2 h-11 bg-rose-400 rounded-t-sm" />
                    <div className="w-2 h-14 bg-[#800020] rounded-t-sm" />
                    <div className="w-2 h-10 bg-amber-400 rounded-t-sm" />
                    <div className="ml-auto text-[10px] text-rose-700 font-bold flex items-center">
                      <TrendingUp className="w-3 h-3 inline mr-0.5" /> +28%
                    </div>
                  </div>

                  <div className="flex flex-col justify-center space-y-1.5 px-1">
                    <div className="w-full h-2 bg-gray-200 rounded-full" />
                    <div className="w-3/4 h-2 bg-gray-200 rounded-full" />
                    <div className="w-1/2 h-2 bg-[#D4AF37] rounded-full" />
                  </div>
                </div>

                {/* Tablet bottom row: User avatar & Dark analytics card with wave */}
                <div className="grid grid-cols-12 gap-2 mt-2.5 items-center">
                  {/* Mini avatar badge */}
                  <div className="col-span-4 bg-emerald-50 border border-emerald-100 rounded-xl p-1.5 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">
                      MP
                    </div>
                    <div className="w-8 h-1 bg-emerald-200 rounded-full mt-1.5" />
                  </div>

                  {/* Dark analytic chart block with glowing waves (from reference) */}
                  <div className="col-span-8 bg-[#1A1E29] rounded-xl p-2 relative overflow-hidden shadow-inner flex flex-col justify-between h-16">
                    <div className="flex items-center justify-between text-[8px] text-gray-400">
                      <span className="font-mono">STOCK FLOW</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    </div>
                    {/* SVG wave curves */}
                    <svg className="w-full h-8" viewBox="0 0 100 30" fill="none" preserveAspectRatio="none">
                      <path
                        d="M0 22 C 20 8, 45 28, 70 12 C 85 4, 95 18, 100 14"
                        stroke="#FF6B6B"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0 16 C 25 24, 50 10, 75 22 C 88 28, 94 10, 100 8"
                        stroke="#38BDF8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeDasharray="2 2"
                      />
                    </svg>
                  </div>
                </div>

                {/* 3D Circular Dial / Button hanging at bottom right (from reference) */}
                <div className="absolute -bottom-3 left-1/2 -translate-x-6 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border-2 border-white shadow-lg flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-white/40" />
                </div>
              </div>
            </TiltedCard>
          </div>
        </div>
      </div>

      {/* Footer stats bar */}
      <div className="relative z-10 pt-4 border-t border-white/15 flex items-center justify-between text-white/80 text-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <span>Shift-aware enterprise logs</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#E8D499]">
          <Box className="w-3.5 h-3.5" />
          <span>2,400+ Assets</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { loginWithUser, addUser, theme } = useAppStore(s => ({
    loginWithUser: s.loginWithUser,
    addUser: s.addUser,
    theme: s.theme,
  }));
  const isDark = theme === 'dark';

  const [mode, setMode] = useState<AuthMode>('login');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showDemoHint, setShowDemoHint] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Sign-up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupMobile, setSignupMobile] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupRole, setSignupRole] = useState<UserRole>('customer');

  const [signupDept, setSignupDept] = useState('');
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim()) {
      setLoginError('Please enter your email address.');
      return;
    }
    if (!loginPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const storeUsers = useAppStore.getState().users;
      const cleanEmail = loginEmail.trim().toLowerCase();

      let found = storeUsers.find(u => u.email.toLowerCase() === cleanEmail);

      // Check against seed users if not found in current store
      if (!found) {
        found = seedUsers.find(u => u.email.toLowerCase() === cleanEmail);
      }

      // Check against demo accounts if still not found
      if (!found) {
        const demoAcc = demoAccounts.find(d => d.email.toLowerCase() === cleanEmail);
        if (demoAcc) {
          found = {
            id: `u-${demoAcc.roleTag}-001`,
            name: demoAcc.username,
            email: demoAcc.email,
            role: demoAcc.roleTag,
            department: demoAcc.role,
            dept: demoAcc.role,
            active: true,
            password: demoAcc.password,
            avatarInitials: demoAcc.username.slice(0, 2).toUpperCase(),
          };
        }
      }

      if (!found) {
        setLoginError('No account found with this email. Please check your credentials or sign up.');
        setIsSubmitting(false);
        return;
      }

      // Ensure user exists in store
      if (!storeUsers.some(u => u.email.toLowerCase() === found!.email.toLowerCase())) {
        useAppStore.setState(s => ({ users: [...s.users, found!] }));
      }

      // Check password (matching against user's password or default demo password 'mpw@123')
      const expectedPassword = found.password || 'mpw@123';
      if (loginPassword !== expectedPassword) {
        setLoginError('Incorrect password. For demo accounts, the default password is "mpw@123".');
        setIsSubmitting(false);
        return;
      }

      if (!found.active) {
        setLoginError('This account has been deactivated. Please contact an administrator.');
        setIsSubmitting(false);
        return;
      }

      // Log in as the exact user account matching the credentials
      loginWithUser(found);
      setIsSubmitting(false);
    }, 350);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError('Please provide your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setSignupError('Please enter a valid email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 4) {
      setSignupError('Password should be at least 4 characters.');
      return;
    }

    // Check if email already exists
    const users = useAppStore.getState().users;
    if (users.some(u => u.email.toLowerCase() === signupEmail.trim().toLowerCase())) {
      setSignupError('An account with this email already exists. Please log in instead.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newUser = addUser({
        name: signupName.trim(),
        email: signupEmail.trim(),
        role: signupRole,
        dept: signupDept.trim() || (signupRole === 'warehouse' ? 'Warehouse Operations' : 'General Operations'),
        password: signupPassword,
      });

      setSignupSuccess(true);
      setTimeout(() => {
        // Log in directly as the newly created user
        loginWithUser(newUser);
      }, 600);
    }, 400);
  };

  return (
    <div
      className={cn(
        'min-h-screen w-full flex items-center justify-center p-3 sm:p-6 md:p-10 transition-colors duration-500 relative overflow-hidden font-sans',
        isDark ? 'bg-[#0B0C0E] text-[#F5F5F7]' : 'bg-[#EBF1F7] text-[#121212]'
      )}
    >
      {/* Subtle organic page background gradients matching reference */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className={cn(
            'absolute -top-[20%] -left-[10%] w-[650px] h-[650px] rounded-full blur-[120px] transition-opacity duration-700',
            isDark ? 'bg-[#500B18]/25 opacity-40' : 'bg-[#500B18]/10 opacity-70'
          )}
        />
        <div
          className={cn(
            'absolute -bottom-[20%] -right-[10%] w-[700px] h-[700px] rounded-full blur-[140px] transition-opacity duration-700',
            isDark ? 'bg-[#D4AF37]/10 opacity-30' : 'bg-[#B22234]/08 opacity-80'
          )}
        />
      </div>

      {/* Main Container Card — mirrors the rounded corner design from the reference image */}
      <div
        className={cn(
          'relative z-10 w-full max-w-5xl rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-2xl transition-all duration-300 flex flex-col lg:flex-row',
          isDark
            ? 'bg-[#151619] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.7)]'
            : 'bg-white border border-[#E4E9F0] shadow-[0_25px_70px_rgba(20,25,40,0.12)]'
        )}
      >
        {/* Left Side: Illustration & Brand Showcase */}
        <VisualShowcasePanel isDark={isDark} mode={mode} />

        {/* Right Side: Clean Form Container */}
        <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 lg:p-14 relative">
          {/* Header Title & Switcher */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2
                className={cn(
                  'text-2xl sm:text-3xl font-extrabold tracking-tight',
                  isDark ? 'text-white' : 'text-[#1B1F2A]'
                )}
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {mode === 'login' ? 'Welcome back' : 'Sign up'}
              </h2>

              {/* Demo accounts toggle helper */}
              <button
                type="button"
                onClick={() => setShowDemoHint(v => !v)}
                className={cn(
                  'inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all',
                  showDemoHint
                    ? isDark
                      ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                      : 'bg-[#500B18]/10 border-[#500B18] text-[#500B18]'
                    : isDark
                      ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                      : 'bg-gray-100 border-gray-200 text-gray-600 hover:text-gray-900'
                )}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Demo Creds</span>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-normal">
              {mode === 'login'
                ? 'Enter your MPW enterprise credentials to sign in.'
                : 'Create an authorized profile to submit and approve requisitions.'}
            </p>
          </div>

          {/* Quick Demo Credentials Dropdown Drawer */}
          {showDemoHint && (
            <div
              className={cn(
                'mb-6 p-3.5 rounded-2xl border transition-all text-xs space-y-2.5 animate-fadeIn',
                isDark ? 'bg-white/5 border-white/10' : 'bg-stone-50 border-stone-200'
              )}
            >
              <div className="flex items-center justify-between pb-1 border-b border-gray-200/50 dark:border-white/10">
                <span className="font-bold text-[11px] uppercase tracking-wider text-[#D4AF37]">
                  Instant Autofill Profiles
                </span>
                <span className="text-[10px] text-gray-400">Default PW: mpw@123</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {demoAccounts.map(acc => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => {
                      setLoginEmail(acc.email);
                      setLoginPassword(acc.password);
                      if (mode !== 'login') setMode('login');
                    }}
                    className={cn(
                      'flex flex-col items-start p-2 rounded-xl text-left border transition-all hover:scale-[1.02]',
                      isDark
                        ? 'bg-black/30 border-white/5 hover:border-[#D4AF37]/50'
                        : 'bg-white border-gray-200 shadow-sm hover:border-[#500B18]/40'
                    )}
                  >
                    <span className="text-[10px] font-black uppercase text-[#500B18] dark:text-[#E8D499]">
                      {acc.role.split('/')[0]} ({acc.username})
                    </span>
                    <span className="text-[11px] truncate w-full text-gray-700 dark:text-gray-300 font-mono mt-0.5">
                      {acc.email}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Authentication Forms */}
          {mode === 'login' ? (
            /* ======================= LOG IN FORM ======================= */
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email input with live typing pulse and glow */}
              <AnimatedInput
                label="Email Address"
                id="login-email"
                type="email"
                isDark={isDark}
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="name@mpw.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />

              {/* Password input with live typing animations */}
              <AnimatedInput
                label="Password"
                id="login-password"
                type={showLoginPass ? 'text' : 'password'}
                isDark={isDark}
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                hint={
                  <a
                    href="#forgot"
                    onClick={e => {
                      e.preventDefault();
                      setLoginPassword('mpw@123');
                    }}
                    className="text-xs font-medium text-[#500B18] dark:text-[#D4AF37] hover:underline"
                  >
                    Auto-fill demo pw?
                  </a>
                }
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(v => !v)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                  >
                    {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              {loginError && (
                <div className="text-xs font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                  {loginError}
                </div>
              )}

              {/* Agreement text matching reference design format */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed pt-1">
                By logging in, you agree to MPW's{' '}
                <a href="#terms" onClick={e => e.preventDefault()} className="text-[#500B18] dark:text-[#E8D499] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={e => e.preventDefault()} className="text-[#500B18] dark:text-[#E8D499] hover:underline">
                  Security Protocol
                </a>.
              </p>

              {/* Primary Call to Action Button - matching rounded vibrant pill button from reference */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isSubmitting}
                className={cn(
                  'w-full h-12 rounded-xl text-sm font-bold text-white tracking-wider uppercase transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-3',
                  'active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed',
                  isDark
                    ? 'bg-gradient-to-r from-[#7B1123] to-[#A31D34] hover:from-[#8B1428] hover:to-[#B3233B] shadow-[0_4px_20px_rgba(163,29,52,0.35)]'
                    : 'bg-gradient-to-r from-[#500B18] to-[#800020] hover:from-[#600D1D] hover:to-[#940026] shadow-[0_4px_20px_rgba(80,11,24,0.25)]'
                )}
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Log In to Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Footer Switcher */}
              <div className="text-center pt-3 text-xs text-gray-500 dark:text-gray-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setLoginError('');
                  }}
                  className="font-bold text-[#500B18] dark:text-[#D4AF37] hover:underline ml-1"
                >
                  Sign up
                </button>
              </div>
            </form>
          ) : (
            /* ======================= SIGN UP FORM ======================= */
            <form onSubmit={handleSignup} className="space-y-3.5">
              {/* Full Name input with typing animations */}
              <AnimatedInput
                label="Full Name"
                id="signup-name"
                type="text"
                isDark={isDark}
                value={signupName}
                onChange={e => setSignupName(e.target.value)}
                placeholder="Juan Dela Cruz"
                required
                icon={<User className="w-4 h-4" />}
              />

              {/* Email Address with typing animations */}
              <AnimatedInput
                label="Email Address"
                id="signup-email"
                type="email"
                isDark={isDark}
                value={signupEmail}
                onChange={e => setSignupEmail(e.target.value)}
                placeholder="juan@mpw.com"
                required
                icon={<Mail className="w-4 h-4" />}
              />

              {/* Mobile No with typing animations */}
              <AnimatedInput
                label="Mobile No"
                id="signup-mobile"
                type="tel"
                isDark={isDark}
                value={signupMobile}
                onChange={e => setSignupMobile(e.target.value)}
                placeholder="+63 912 345 6789"
              />

              {/* Password & Department grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AnimatedInput
                  label="Password"
                  id="signup-password"
                  type={showSignupPass ? 'text' : 'password'}
                  isDark={isDark}
                  value={signupPassword}
                  onChange={e => setSignupPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowSignupPass(v => !v)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showSignupPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  }
                />

                <AnimatedInput
                  label="Department"
                  id="signup-dept"
                  type="text"
                  isDark={isDark}
                  value={signupDept}
                  onChange={e => setSignupDept(e.target.value)}
                  placeholder="e.g. Operations"
                  icon={<Building2 className="w-4 h-4" />}
                />
              </div>

              {/* Account Role Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
                  Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'customer' as UserRole, label: 'Customer', desc: 'Orders & Reqs' },
                    { id: 'warehouse' as UserRole, label: 'Warehouse', desc: 'Stock & Issues' },
                    { id: 'editor' as UserRole, label: 'Admin', desc: 'Full System' },
                  ].map(r => {
                    const active = signupRole === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSignupRole(r.id)}
                        className={cn(
                          'p-2.5 rounded-xl border text-left transition-all duration-200 outline-none',
                          active
                            ? 'bg-royal-primary/10 dark:bg-royal-primary/20 border-royal-primary text-primary font-bold ring-1 ring-royal-primary/30'
                            : 'border-black/10 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                        )}
                      >
                        <p className="text-xs font-bold leading-tight">{r.label}</p>
                        <p className="text-[10px] text-muted truncate mt-0.5">{r.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {signupError && (
                <div className="text-xs font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                  {signupError}
                </div>
              )}

              {/* Exact disclaimer text from reference */}
              <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed pt-1">
                You are agreeing to the{' '}
                <a href="#terms" onClick={e => e.preventDefault()} className="text-royal-primary dark:text-[#E8D499] hover:underline font-medium">
                  Terms of Services
                </a>{' '}
                and{' '}
                <a href="#privacy" onClick={e => e.preventDefault()} className="text-royal-primary dark:text-[#E8D499] hover:underline font-medium">
                  Privacy Policy
                </a>.
              </p>

              {/* Reference-accurate "Get Started" button in royal brand tone */}
              <button
                type="submit"
                id="signup-submit-btn"
                disabled={isSubmitting || signupSuccess}
                className={cn(
                  'w-full h-12 rounded-xl text-sm font-bold text-white tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 mt-2',
                  'active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed',
                  isDark
                    ? 'bg-gradient-to-r from-[#7B1123] to-[#A31D34] hover:from-[#8B1428] hover:to-[#B3233B] shadow-[0_4px_20px_rgba(163,29,52,0.35)]'
                    : 'bg-gradient-to-r from-[#500B18] to-[#800020] hover:from-[#600D1D] hover:to-[#940026] shadow-[0_4px_20px_rgba(80,11,24,0.25)]'
                )}
              >
                {signupSuccess ? (
                  <span className="flex items-center gap-2">
                    <Check className="w-4 h-4" /> Account Created!
                  </span>
                ) : isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Get Started</span>
                )}
              </button>

              {/* Footer Switcher matching reference */}
              <div className="text-center pt-2 text-xs text-gray-500 dark:text-gray-400">
                Already a member?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSignupError('');
                  }}
                  className="font-bold text-[#500B18] dark:text-[#D4AF37] hover:underline ml-1"
                >
                  Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

