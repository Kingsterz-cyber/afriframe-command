import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, X, Plus, Clock, AlertCircle,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { useApp } from '@/context/AppContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

interface TimeSlot {
  id: string;
  time: string;
  duration: number;
  available: boolean;
}

interface DateBlockout {
  id: string;
  date: Date;
  title: string;
  reason: 'unavailable' | 'maintenance' | 'holiday';
}

export const AvailabilityCalendar: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 0, 1));
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { id: '1', time: '8:00 AM', duration: 120, available: true },
    { id: '2', time: '10:30 AM', duration: 180, available: true },
    { id: '3', time: '2:00 PM', duration: 120, available: false },
    { id: '4', time: '5:00 PM', duration: 90, available: true },
  ]);
  const [blockouts, setBlockouts] = useState<DateBlockout[]>([
    { id: '1', date: new Date(2025, 0, 15), title: 'Maintenance', reason: 'maintenance' },
    { id: '2', date: new Date(2025, 0, 22), title: 'Holiday', reason: 'holiday' },
  ]);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('9:00 AM');
  const [newSlotDuration, setNewSlotDuration] = useState(120);

  // Calculate days in month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get blockouts for specific date
  const getBlockoutForDate = (date: Date) => {
    return blockouts.find(b => isSameDay(b.date, date));
  };

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleToggleSlot = (slotId: string) => {
    setTimeSlots(slots =>
      slots.map(slot =>
        slot.id === slotId ? { ...slot, available: !slot.available } : slot
      )
    );
  };

  const handleAddSlot = () => {
    const newSlot: TimeSlot = {
      id: Date.now().toString(),
      time: newSlotTime,
      duration: newSlotDuration,
      available: true,
    };
    setTimeSlots([...timeSlots, newSlot]);
    setShowAddSlot(false);
  };

  const handleAddBlockout = (date: Date) => {
    if (!getBlockoutForDate(date)) {
      const newBlockout: DateBlockout = {
        id: Date.now().toString(),
        date,
        title: 'Unavailable',
        reason: 'unavailable',
      };
      setBlockouts([...blockouts, newBlockout]);
    }
  };

  const handleRemoveBlockout = (blockoutId: string) => {
    setBlockouts(blockouts.filter(b => b.id !== blockoutId));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-4 md:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}
            style={{ fontFamily: 'Playfair Display, serif' }}>
            Availability Calendar
          </h1>
          <p className={`text-sm ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
            Manage your shooting schedule and time slots
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <GlassCard delay={0.1} className="overflow-hidden">
            {/* Month Header */}
            <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
              <h2 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevMonth}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                >
                  <ChevronLeft size={18} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextMonth}
                  className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
                >
                  <ChevronRight size={18} />
                </motion.button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Week Days */}
              <div className="grid grid-cols-7 gap-2 mb-3">
                {weekDays.map(day => (
                  <div key={day} className={`text-center text-xs font-semibold py-2 ${isDark ? 'text-white/40' : 'text-gray-400'}`}>
                    {day}
                  </div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((date, idx) => {
                  const isToday = isSameDay(date, new Date());
                  const blockout = getBlockoutForDate(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);

                  return (
                    <motion.button
                      key={idx}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!blockout) setSelectedDate(date);
                      }}
                      className={`relative aspect-square rounded-lg transition-all duration-200 flex items-center justify-center text-sm font-medium border ${
                        blockout
                          ? isDark
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed'
                            : 'bg-red-50 border-red-200 text-red-600 cursor-not-allowed'
                          : isSelected
                            ? isDark
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-white'
                              : 'bg-[#FDF6E3] border-[#D4AF37] text-gray-900'
                            : isToday
                              ? isDark
                                ? 'border-emerald-500/40 bg-emerald-500/5 text-white ring-1 ring-emerald-500/20'
                                : 'border-emerald-300 bg-emerald-50 text-gray-900 ring-1 ring-emerald-200'
                              : isDark
                                ? 'border-white/[0.08] text-white/70 hover:bg-white/[0.05]'
                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {format(date, 'd')}
                      {blockout && <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-red-500" />}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right Sidebar - Time Slots & Blockouts */}
        <div className="space-y-4">
          {/* Selected Date Details */}
          <GlassCard delay={0.15} className="p-4">
            <h3 className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
              style={{ fontFamily: 'Playfair Display, serif' }}>
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
            </h3>
            {selectedDate && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleAddBlockout(selectedDate)}
                  className="flex-1 px-3 py-2 rounded-lg bg-red-500/20 text-red-500 text-xs font-medium hover:bg-red-500/30 transition-colors"
                >
                  Mark Unavailable
                </motion.button>
              </div>
            )}
          </GlassCard>

          {/* Time Slots */}
          <GlassCard delay={0.2} className="overflow-hidden">
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}>
                Time Slots
              </h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddSlot(!showAddSlot)}
                className={`p-1.5 rounded-lg transition-colors ${isDark ? 'hover:bg-white/[0.1] text-white/50 hover:text-white' : 'hover:bg-gray-100 text-gray-400 hover:text-gray-900'}`}
              >
                <Plus size={16} />
              </motion.button>
            </div>

            <div className="p-3 space-y-2">
              {showAddSlot && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg border ${isDark ? 'border-white/[0.06] bg-white/[0.02]' : 'border-gray-200 bg-gray-50'} space-y-2`}
                >
                  <div>
                    <label className={`text-[11px] font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Time</label>
                    <input
                      type="text"
                      value={newSlotTime}
                      onChange={(e) => setNewSlotTime(e.target.value)}
                      className={`w-full mt-1 px-2 py-1.5 rounded text-xs outline-none border transition-all ${
                        isDark
                          ? 'bg-white/[0.03] border-white/[0.08] text-white placeholder-white/30'
                          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-[11px] font-medium ${isDark ? 'text-white/60' : 'text-gray-500'}`}>Duration (min)</label>
                    <input
                      type="number"
                      value={newSlotDuration}
                      onChange={(e) => setNewSlotDuration(parseInt(e.target.value))}
                      className={`w-full mt-1 px-2 py-1.5 rounded text-xs outline-none border transition-all ${
                        isDark
                          ? 'bg-white/[0.03] border-white/[0.08] text-white placeholder-white/30'
                          : 'bg-white border-gray-200 text-gray-800 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleAddSlot}
                      className="flex-1 px-2 py-1.5 rounded bg-emerald-500/20 text-emerald-500 text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                    >
                      Add
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setShowAddSlot(false)}
                      className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-colors ${isDark ? 'bg-white/[0.05] text-white/60 hover:bg-white/[0.08]' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      Cancel
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {timeSlots.map((slot, idx) => (
                <motion.div
                  key={slot.id}
                  initial={{ opacity: 0, x: -4 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + idx * 0.03 }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg transition-colors cursor-pointer ${
                    slot.available
                      ? isDark
                        ? 'bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10'
                        : 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                      : isDark
                        ? 'bg-gray-500/5 hover:bg-gray-500/10 border border-gray-500/10'
                        : 'bg-gray-100 hover:bg-gray-200 border border-gray-200'
                  }`}
                  onClick={() => handleToggleSlot(slot.id)}
                >
                  <Clock size={13} className={slot.available ? 'text-emerald-500' : isDark ? 'text-white/30' : 'text-gray-400'} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${slot.available ? (isDark ? 'text-emerald-400' : 'text-emerald-700') : (isDark ? 'text-white/40' : 'text-gray-500')}`}>
                      {slot.time}
                    </p>
                    <p className={`text-[10px] ${slot.available ? (isDark ? 'text-white/40' : 'text-gray-500') : (isDark ? 'text-white/25' : 'text-gray-400')}`}>
                      {slot.duration}min
                    </p>
                  </div>
                  <div className={`w-3 h-3 rounded border-2 transition-colors ${
                    slot.available
                      ? 'bg-emerald-500 border-emerald-500'
                      : isDark ? 'border-white/20 bg-transparent' : 'border-gray-300 bg-transparent'
                  }`} />
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Blockout Dates */}
          <GlassCard delay={0.25} className="overflow-hidden">
            <div className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? 'border-white/[0.06]' : 'border-gray-200/60'}`}>
              <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
                style={{ fontFamily: 'Playfair Display, serif' }}>
                Unavailable Dates
              </h3>
            </div>

            <div className="p-3 space-y-2">
              {blockouts.length === 0 ? (
                <div className={`text-center py-4 text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  No blockout dates set
                </div>
              ) : (
                blockouts.map((blockout, idx) => (
                  <motion.div
                    key={blockout.id}
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.03 }}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border ${
                      isDark ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <AlertCircle size={13} className="text-red-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-medium ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {format(blockout.date, 'MMM d')}
                      </p>
                      <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                        {blockout.reason}
                      </p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => handleRemoveBlockout(blockout.id)}
                      className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-red-500/20 text-red-500/60 hover:text-red-500' : 'hover:bg-red-200 text-red-600/60 hover:text-red-600'}`}
                    >
                      <X size={12} />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </motion.div>
  );
};
