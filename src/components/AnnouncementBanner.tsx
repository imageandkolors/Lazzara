import React, { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Megaphone, X } from 'lucide-react';

export const AnnouncementBanner = () => {
  const [settings, setSettings] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'restaurant'), (snap) => {
      if (snap.exists()) setSettings(snap.data());
    });
    return () => unsub();
  }, []);

  if (!settings?.announcement || !isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-brand-terracotta text-brand-cream relative z-[60]"
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3">
          <Megaphone className="w-4 h-4 animate-bounce" />
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold text-center">
            {settings.announcement}
          </p>
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
