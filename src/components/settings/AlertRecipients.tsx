import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Mail, MessageCircle, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { fetchStudioSettings, updateStudioSettings } from '@/lib/availability';

/**
 * Where studio alerts are delivered. Saved to studio_settings so the
 * server-side notifier knows who to email / WhatsApp.
 */
export function AlertRecipients() {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  const [email, setEmail] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetchStudioSettings().then((s) => {
      if (!alive) return;
      setEmail(s.admin_email ?? '');
      setWhatsapp(s.admin_whatsapp ?? '');
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const save = async () => {
    setSaving(true);
    setError(null);
    const { error: err } = await updateStudioSettings({
      admin_email: email.trim() || null,
      admin_whatsapp: whatsapp.trim() || null,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const cardBg = isDark ? 'bg-white/[0.03]' : 'bg-black/[0.02]';
  const inputCls = `w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-colors ${
    isDark
      ? 'bg-white/[0.04] text-white placeholder:text-white/30 border border-white/10 focus:border-[#D4AF37]/60'
      : 'bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-[#D4AF37]'
  }`;
  const labelCls = `mb-1.5 flex items-center gap-1.5 text-[11px] font-medium ${
    isDark ? 'text-white/60' : 'text-gray-500'
  }`;

  return (
    <div className={`p-5 rounded-2xl ${cardBg}`}>
      <h4
        className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
        style={{ fontFamily: 'Playfair Display, serif' }}
      >
        Alert Recipients
      </h4>
      <p className={`text-[11px] mb-4 ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
        New booking alerts are emailed here, and client confirmations are sent automatically when
        you confirm a booking.
      </p>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-xs text-white/40">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label htmlFor="admin-email" className={labelCls}>
              <Mail size={12} /> Admin email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="studio@afriframestudio.com"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="admin-whatsapp" className={labelCls}>
              <MessageCircle size={12} /> Studio WhatsApp number
            </label>
            <input
              id="admin-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="+233 55 000 0000"
              className={inputCls}
            />
          </div>

          {error && <p className="text-[11px] text-[#E5533D]">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E8C87A] px-4 py-2 text-xs font-semibold text-black disabled:opacity-60"
          >
            {saving ? (
              <Loader2 size={13} className="animate-spin" />
            ) : saved ? (
              <Check size={13} />
            ) : null}
            {saved ? 'Saved' : 'Save recipients'}
          </motion.button>
        </div>
      )}
    </div>
  );
}
