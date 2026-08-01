import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, MessageCircle, ShieldCheck, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import afriframeLogo from '@/assets/afriframe-logo.png.asset.json';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

const WHATSAPP_NUMBER = '233241234567';
const SUPPORT_EMAIL = 'studio@afriframe.com';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [booting, setBooting] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (submitting) {
      const t = setTimeout(() => {
        setSubmitting(false);
        navigate({ to: '/' });
      }, 1800);
      return () => clearTimeout(t);
    }
  }, [submitting, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
  };

  if (booting) {
    return (
      <AnimatePresence>
        <LoadingScreen onComplete={() => setBooting(false)} />
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-dvh grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] bg-[#0B0B0B]">
      {/* Left: brand panel */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 bg-[#080808]">
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            background:
              'radial-gradient(120% 80% at 20% 20%, rgba(212,175,55,0.22), transparent 60%), radial-gradient(90% 70% at 80% 90%, rgba(252,163,17,0.14), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative z-10 flex items-center gap-3">
          <img src={afriframeLogo.url} alt="Afriframe Studio" className="w-11 h-11 object-contain" />
          <span className="text-[#F2ECDD] tracking-[0.35em] text-xs uppercase">Afriframe</span>
        </div>

        <div className="relative z-10 max-w-sm">
          <div className="h-16 w-[2px] bg-gradient-to-b from-[#D4AF37] to-transparent mb-5" />
          <h2
            className="text-4xl leading-tight text-[#F2ECDD]"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            Welcome Back
          </h2>
          <p className="mt-4 text-sm text-[#F2ECDD]/50 leading-relaxed">
            Glad to see you again. Let’s continue where you left off — your studio, bookings and
            galleries are waiting.
          </p>
        </div>

        <p className="relative z-10 text-[11px] text-[#F2ECDD]/25">
          © {new Date().getFullYear()} Afriframe Studio. All rights reserved.
        </p>
      </aside>

      {/* Right: form */}
      <main className="relative flex items-center justify-center px-5 py-10 sm:px-8">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(70% 50% at 50% 0%, rgba(212,175,55,0.10), transparent 70%)',
          }}
          aria-hidden="true"
        />

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
          className="relative z-10 w-full max-w-md rounded-[28px] border border-[#D4AF37]/12 bg-[#151515]/80 p-6 sm:p-9"
          style={{ backdropFilter: 'blur(30px) saturate(150%)', boxShadow: '0 30px 80px rgba(0,0,0,0.55)' }}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/35 bg-[#0F0F0F] flex items-center justify-center">
              <img src={afriframeLogo.url} alt="Afriframe Studio logo" className="w-9 h-9 object-contain" />
            </div>
            <h1
              className="mt-5 text-3xl text-[#F2ECDD]"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Login
            </h1>
            <p className="mt-1.5 text-xs text-[#F2ECDD]/45">Login to your studio account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-medium text-[#F2ECDD]/70">
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" aria-hidden="true" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  maxLength={255}
                  className="w-full h-12 rounded-2xl border border-[#D4AF37]/12 bg-[#0F0F0F] pl-11 pr-4 text-sm text-[#F2ECDD] placeholder-[#F2ECDD]/25 outline-none transition-colors focus:border-[#D4AF37]/55"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-medium text-[#F2ECDD]/70">
                Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#D4AF37]/60" aria-hidden="true" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  maxLength={128}
                  className="w-full h-12 rounded-2xl border border-[#D4AF37]/12 bg-[#0F0F0F] pl-11 pr-12 text-sm text-[#F2ECDD] placeholder-[#F2ECDD]/25 outline-none transition-colors focus:border-[#D4AF37]/55"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 grid h-9 w-9 place-items-center rounded-xl text-[#F2ECDD]/45 transition-colors hover:text-[#D4AF37]"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="flex justify-end">
                <a href={`mailto:${SUPPORT_EMAIL}?subject=Password%20reset%20request`} className="text-[11px] text-[#D4AF37] hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>

            {error && (
              <p role="alert" className="text-[11px] text-[#FF6B6B]">
                {error}
              </p>
            )}

            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#E8C87A] via-[#D4AF37] to-[#FCA311] text-sm font-semibold text-[#0B0B0B] transition-shadow disabled:opacity-70"
              style={{ boxShadow: '0 10px 30px rgba(212,175,55,0.25)' }}
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  <span>Signing you in…</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </>
              )}
            </motion.button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#F2ECDD]/10" />
            <span className="text-[11px] text-[#F2ECDD]/35">or reach the studio</span>
            <span className="h-px flex-1 bg-[#F2ECDD]/10" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=Afriframe%20Studio%20CMS%20access`}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/20 bg-[#0F0F0F] text-xs font-medium text-[#F2ECDD]/80 transition-colors hover:border-[#D4AF37]/55 hover:text-[#F2ECDD]"
            >
              <Mail size={15} className="text-[#D4AF37]" aria-hidden="true" />
              Email us
            </a>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello Afriframe Studio, I need help signing in.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-[#D4AF37]/20 bg-[#0F0F0F] text-xs font-medium text-[#F2ECDD]/80 transition-colors hover:border-[#D4AF37]/55 hover:text-[#F2ECDD]"
            >
              <MessageCircle size={15} className="text-[#25D366]" aria-hidden="true" />
              WhatsApp
            </a>
          </div>

          <p className="mt-7 flex items-center justify-center gap-1.5 text-[11px] text-[#F2ECDD]/30">
            <ShieldCheck size={13} aria-hidden="true" />
            Your data is secure with us
          </p>
        </motion.section>
      </main>
    </div>
  );
};
