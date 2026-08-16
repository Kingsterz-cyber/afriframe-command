import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Phone, Mail, Globe, Camera,
  Moon, Sun, Shield, Save, Upload,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { MaxBookingsSetting } from '@/components/settings/MaxBookingsSetting';
import { AlertRecipients } from '@/components/settings/AlertRecipients';
import { PushDevices } from '@/components/settings/PushDevices';


const SECTIONS = ['Studio Branding', 'Contact Info', 'Social Links', 'Booking Rules', 'Notifications', 'Appearance', 'Account'];

export const Settings: React.FC = () => {
  const { theme, toggleTheme } = useApp();
  const { session } = useAuth();
  const isDark = theme === 'dark';
  const adminEmail = session?.user?.email ?? '';
  const adminName = session?.user?.user_metadata?.full_name ?? session?.user?.user_metadata?.name ?? adminEmail.split('@')[0] ?? 'Admin';
  const [adminPhoto, setAdminPhoto] = useState<string>(session?.user?.user_metadata?.avatar_url ?? '/icons/icon-192.png');
  const [activeSection, setActiveSection] = useState('Studio Branding');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const cardBg = isDark
    ? 'bg-white/[0.04] border border-white/[0.08]'
    : 'bg-white border border-gray-200/60 shadow-sm';

  const inputBg = isDark
    ? 'bg-white/[0.05] border border-white/[0.08] text-white/80 placeholder-white/20'
    : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400';

  const labelCls = isDark ? 'text-white/50' : 'text-gray-500';
  const titleCls = isDark ? 'text-white/90' : 'text-gray-900';
  const subCls = isDark ? 'text-white/40' : 'text-gray-400';

  const renderSection = () => {
    switch (activeSection) {
      case 'Studio Branding':
        return (
          <div className="space-y-5">
            {/* Logo Upload */}
            <div className={`p-5 rounded-2xl ${cardBg}`}>
              <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Studio Logo</h4>
              <div className="flex items-center gap-5">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden ${isDark ? 'bg-white/[0.08]' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                  <img src={adminPhoto} alt={`${adminName} profile`} className="w-full h-full object-cover" onError={(event) => { event.currentTarget.src = '/icons/icon-192.png'; }} />
                </div>
                <div>
                  <p className={`text-xs font-medium mb-1 ${titleCls}`}>Upload new logo</p>
                  <p className={`text-[11px] mb-3 ${subCls}`}>PNG, SVG or JPG. Max 2MB. Recommended 400×400px.</p>
                  <input id="admin-photo" type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) setAdminPhoto(URL.createObjectURL(file)); }} />
                  <motion.button
                    type="button"
                    onClick={() => document.getElementById('admin-photo')?.click()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition-colors ${isDark ? 'border-white/[0.1] text-white/60 hover:text-white hover:bg-white/[0.06]' : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Upload size={12} />
                    Choose File
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Studio Name & Details */}
            <div className={`p-5 rounded-2xl ${cardBg}`}>
              <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Studio Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Studio Name', value: 'Afriframe Studio', icon: <Building2 size={13} /> },
                  { label: 'Tagline', value: 'Capturing Moments, Creating Memories', icon: <Camera size={13} /> },
                  { label: 'Founded Year', value: '2018', icon: <Camera size={13} /> },
                  { label: 'Studio Location', value: 'East Legon, Accra, Ghana', icon: <Globe size={13} /> },
                ].map((field, i) => (
                  <div key={i}>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1.5 ${labelCls}`}>{field.label}</label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{field.icon}</span>
                      <input
                        defaultValue={field.value}
                        className={`w-full h-9 pl-8 pr-4 rounded-xl text-xs outline-none transition-all ${inputBg}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Color Accent */}
              <div className="mt-4">
                <label className={`block text-[10px] uppercase tracking-wider mb-2 ${labelCls}`}>Primary Accent Color</label>
                <div className="flex items-center gap-3">
                  {['#C8102E', '#1a1a1a', '#D4AF37', '#0070f3', '#8b5cf6', '#059669'].map(color => (
                    <button
                      key={color}
                      className="w-8 h-8 rounded-xl border-2 border-white/20 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] ${subCls}`}>Custom:</span>
                    <input type="color" defaultValue="#C8102E" className="w-8 h-8 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Contact Info':
        return (
          <div className={`p-5 rounded-2xl ${cardBg}`}>
            <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Contact Information</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: 'Primary Phone', value: '+233 24 112 3456', icon: <Phone size={13} /> },
                { label: 'Secondary Phone', value: '+233 50 234 5678', icon: <Phone size={13} /> },
                { label: 'Email Address', value: 'hello@afriframestudio.com', icon: <Mail size={13} /> },
                { label: 'Booking Email', value: 'bookings@afriframestudio.com', icon: <Mail size={13} /> },
                { label: 'Website', value: 'www.afriframestudio.com', icon: <Globe size={13} /> },
                { label: 'Studio Address', value: 'East Legon, Accra, Ghana', icon: <Building2 size={13} /> },
              ].map((field, i) => (
                <div key={i}>
                  <label className={`block text-[10px] uppercase tracking-wider mb-1.5 ${labelCls}`}>{field.label}</label>
                  <div className="relative">
                    <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{field.icon}</span>
                    <input defaultValue={field.value} className={`w-full h-9 pl-8 pr-4 rounded-xl text-xs outline-none transition-all ${inputBg}`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Social Links':
        return (
          <div className={`p-5 rounded-2xl ${cardBg}`}>
            <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Social Media Links</h4>
            <div className="space-y-3">
              {[
                { label: 'Instagram', value: '@afriframestudio', placeholder: '@yourstudio' },
                { label: 'Facebook', value: 'Afriframe Studio', placeholder: 'Facebook page URL' },
                { label: 'Twitter/X', value: '@afriframe', placeholder: '@yourhandle' },
                { label: 'TikTok', value: '@afriframestudio', placeholder: '@yourtiktok' },
                { label: 'YouTube', value: 'Afriframe Studio TV', placeholder: 'YouTube channel URL' },
                { label: 'LinkedIn', value: 'Afriframe Studio Ltd', placeholder: 'LinkedIn URL' },
              ].map((field, i) => (
                <div key={i} className="flex items-center gap-3">
                  <label className={`text-xs flex-shrink-0 w-28 ${labelCls}`}>{field.label}</label>
                  <input
                    defaultValue={field.value}
                    placeholder={field.placeholder}
                    className={`flex-1 h-9 px-4 rounded-xl text-xs outline-none transition-all ${inputBg}`}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'Booking Rules':
        return <MaxBookingsSetting />;

      case 'Notifications':
        return (
          <div className="space-y-4">
          <PushDevices />
          <AlertRecipients />
          <div className={`p-5 rounded-2xl ${cardBg}`}>
            <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Notification Preferences</h4>

            <div className="space-y-4">
              {[
                { label: 'New Booking Request', desc: 'Get notified when a new booking is submitted', enabled: true },
                { label: 'Booking Confirmed', desc: 'Alert when a booking is confirmed or updated', enabled: true },
                { label: 'Payment Received', desc: 'Notify on successful payment transactions', enabled: true },
                { label: 'New Message', desc: 'Alerts for new client messages', enabled: false },
                { label: 'Gallery Upload', desc: 'When new content is uploaded to the gallery', enabled: true },
                { label: 'Storage Alerts', desc: 'Low storage and backup notifications', enabled: false },
                { label: 'Weekly Summary', desc: 'Weekly digest of studio activity', enabled: true },
              ].map((pref, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs font-medium ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{pref.label}</p>
                    <p className={`text-[11px] ${subCls}`}>{pref.desc}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" defaultChecked={pref.enabled} className="sr-only peer" />
                    <div className={`w-10 h-5 rounded-full peer-checked:bg-[#D4AF37] peer-focus:ring-2 peer-focus:ring-[#D4AF37]/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                  </label>
                </div>
              ))}
            </div>
          </div>
          </div>
        );


      case 'Appearance':
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl ${cardBg}`}>
              <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Theme</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'dark', label: 'Dark Mode', icon: <Moon size={18} />, desc: 'Deep black with gold accents' },
                  { id: 'light', label: 'Light Mode', icon: <Sun size={18} />, desc: 'Clean white with gold accents' },
                ].map((opt) => (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={opt.id !== theme ? toggleTheme : undefined}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      theme === opt.id
                        ? isDark
                          ? 'bg-[#D4AF37]/15 border-[#FCA311]/30 text-white'
                          : 'bg-[#FDF6E3] border-[#E8C87A] text-gray-900'
                        : isDark
                          ? 'bg-white/[0.03] border-white/[0.06] text-white/50 hover:bg-white/[0.06]'
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <div className="mb-2">{opt.icon}</div>
                    <p className="text-xs font-semibold">{opt.label}</p>
                    <p className={`text-[10px] mt-0.5 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{opt.desc}</p>
                    {theme === opt.id && (
                      <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#E8C87A] text-[10px] font-medium">
                        Active
                      </div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <div className={`p-5 rounded-2xl ${cardBg}`}>
              <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Typography</h4>
              <div className="space-y-2">
                <p className={`text-xs ${subCls}`}>Heading Font: <span className={`font-semibold ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Playfair Display</span></p>
                <p className={`text-xs ${subCls}`}>Body Font: <span className={`font-semibold ${titleCls}`}>Inter</span></p>
              </div>
            </div>
          </div>
        );

      case 'Account':
        return (
          <div className="space-y-4">
            <div className={`p-5 rounded-2xl ${cardBg}`}>
              <h4 className={`text-sm font-semibold mb-4 ${titleCls}`} style={{ fontFamily: 'Playfair Display, serif' }}>Account Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Full Name', value: adminName, icon: <Shield size={13} /> },
                  { label: 'Email', value: adminEmail, icon: <Mail size={13} /> },
                  { label: 'Role', value: 'Super Administrator', icon: <Shield size={13} /> },
                  { label: 'Last Login', value: 'Today, 8:30 AM', icon: <Shield size={13} /> },
                ].map((field, i) => (
                  <div key={i}>
                    <label className={`block text-[10px] uppercase tracking-wider mb-1.5 ${labelCls}`}>{field.label}</label>
                    <div className="relative">
                      <span className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>{field.icon}</span>
                      <input defaultValue={field.value} className={`w-full h-9 pl-8 pr-4 rounded-xl text-xs outline-none transition-all ${inputBg}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`p-5 rounded-2xl border border-[#FCA311]/20 ${isDark ? 'bg-[#5C4406]/5' : 'bg-[#FDF6E3]/30'}`}>
              <h4 className={`text-sm font-semibold mb-2 text-[#FCA311]`}>Danger Zone</h4>
              <p className={`text-xs mb-4 ${subCls}`}>Irreversible actions for your account.</p>
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded-xl bg-[#D4AF37]/10 text-[#E8C87A] border border-[#FCA311]/20 text-xs font-medium hover:bg-[#D4AF37]/20 transition-colors">
                  Reset Password
                </button>
                <button className="px-4 py-2 rounded-xl bg-[#D4AF37]/10 text-[#E8C87A] border border-[#FCA311]/20 text-xs font-medium hover:bg-[#D4AF37]/20 transition-colors">
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6"
    >
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Section Nav */}
        <div className="lg:w-48 flex-shrink-0">
          <nav className="space-y-1">
            {SECTIONS.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                  activeSection === section
                    ? isDark ? 'bg-[#D4AF37]/15 text-[#E8C87A] border border-[#FCA311]/20' : 'bg-[#FDF6E3] text-[#D4AF37] border border-[#E8C87A]/60'
                    : isDark ? 'text-white/50 hover:text-white hover:bg-white/[0.05] border border-transparent' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                }`}
              >
                {section}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`} style={{ fontFamily: 'Playfair Display, serif' }}>
                {activeSection}
              </h3>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSave}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium shadow-lg transition-all duration-200 ${
                  saved
                    ? 'bg-emerald-600 text-white shadow-emerald-900/30'
                    : 'bg-[#D4AF37] text-[#0B0B0B] hover:bg-[#FCA311] shadow-[#5C4406]/25'
                }`}
              >
                <Save size={13} />
                {saved ? 'Saved!' : 'Save Changes'}
              </motion.button>
            </div>
            {renderSection()}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
