import React from 'react';
import { motion } from 'framer-motion';
import { BellRing, BellOff, Loader2, Smartphone, Send } from 'lucide-react';

import { useApp } from '@/context/AppContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushDevices: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const { status, busy, error, success, diagnostic, enable, disable, test } = usePushNotifications();

  const copy: Record<string, string> = {
    loading: 'Checking this device…',
    unsupported: 'This browser does not support push notifications.',
    blocked: 'Open the installed app (or the published site in its own tab) to enable notifications.',
    denied: 'Notifications are blocked in your browser settings for this site.',
    off: 'Turn on push alerts to be notified of new bookings even when the CMS is closed.',
    on: 'This device receives Afriframe push alerts.',
  };

  return (
    <div
      className={`rounded-[24px] p-6 backdrop-blur-2xl ${
        isDark
          ? 'bg-white/[0.03] border border-white/[0.07]'
          : 'bg-white border border-gray-200/70 shadow-sm'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[#D4AF37]/15 border border-[#D4AF37]/25 text-[#E8C87A]">
          <Smartphone size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-semibold ${isDark ? 'text-white/90' : 'text-gray-900'}`}>
            Device push notifications
          </h3>
          <p className={`mt-1 text-xs leading-relaxed ${isDark ? 'text-white/45' : 'text-gray-500'}`}>
            {copy[status]}
          </p>

          {error && <p className="mt-2 text-xs text-[#FCA311]">{error}</p>}
          {success && <p role="status" className="mt-2 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">{success}</p>}

          {diagnostic && (
            <div className={`mt-4 rounded-xl border p-3 text-[11px] ${isDark ? 'border-white/[0.08] bg-black/20' : 'border-gray-200 bg-gray-50'}`}>
              <p className={`mb-2 text-xs font-semibold ${isDark ? 'text-white/80' : 'text-gray-800'}`}>Push diagnostic</p>
              <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                {Object.entries({
                  'Service Worker': diagnostic.serviceWorker,
                  'Notification Permission': diagnostic.permission.toUpperCase(),
                  PushManager: diagnostic.pushManager,
                  'Push Subscription': diagnostic.subscription,
                  'Supabase Save': diagnostic.supabaseSave,
                  'Database Record': diagnostic.databaseRecord,
                  'Subscription Role': diagnostic.role,
                  'VAPID Configuration': diagnostic.vapid,
                  'Push Delivery': diagnostic.delivery,
                  'Admin Device Count': String(diagnostic.adminDeviceCount),
                }).map(([label, value]) => <div key={label} className="flex justify-between gap-2"><span className={isDark ? 'text-white/45' : 'text-gray-500'}>{label}</span><span className={value === 'PASS' || value === 'GRANTED' || value === 'FOUND' || value === 'ADMIN' || value === 'SENT' || value === 'CREATED' || value === 'EXISTING' ? 'text-emerald-500' : 'text-[#FCA311]'}>{value}</span></div>)}
              </div>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {status === 'on' ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={busy}
                  onClick={test}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FCA311] px-4 py-2 text-xs font-semibold text-[#0B0B0B] disabled:opacity-60"
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                  Send test
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={busy}
                  onClick={disable}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium disabled:opacity-60 ${
                    isDark
                      ? 'bg-white/[0.05] border border-white/[0.08] text-white/70'
                      : 'bg-gray-100 border border-gray-200 text-gray-600'
                  }`}
                >
                  <BellOff size={13} />
                  Turn off
                </motion.button>
              </>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={busy || status === 'unsupported' || status === 'blocked' || status === 'denied'}
                onClick={enable}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#FCA311] px-4 py-2 text-xs font-semibold text-[#0B0B0B] disabled:opacity-40"
              >
                {busy ? <Loader2 size={13} className="animate-spin" /> : <BellRing size={13} />}
                Enable notifications
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushDevices;
