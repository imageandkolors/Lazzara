
import React, { useEffect, useState } from 'react';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, ShoppingBag } from 'lucide-react';
import { getWhatsAppLink } from '../lib/whatsapp';

export const AbandonedCartNudge = () => {
  const { items, total } = useCart();
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Show nudge if cart has items and user has been on the site for 2 minutes
    // and hasn't checked out yet.
    if (items.length > 0 && !hasShown) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        setHasShown(true);
      }, 120000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [items.length, hasShown]);

  if (!isVisible || items.length === 0) return null;

  const whatsappMessage = `Ciao! Ho visto che ho alcuni piatti nel carrello (${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}). Avrei bisogno di assistenza per completare l'ordine.`;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-24 right-8 z-[90] max-w-sm"
      >
        <div className="bg-white rounded-[32px] p-6 shadow-2xl border border-brand-ink/5 relative">
          <button 
            onClick={() => setIsVisible(false)}
            className="absolute top-4 right-4 text-brand-ink/20 hover:text-brand-ink transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-brand-terracotta/10 text-brand-terracotta rounded-full flex items-center justify-center">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta">Hai lasciato qualcosa!</p>
              <h4 className="font-serif italic text-lg text-brand-ink">Completiamo l'ordine?</h4>
            </div>
          </div>

          <p className="text-sm text-brand-ink/60 mb-6 italic">
            I tuoi piatti preferiti ti aspettano nel carrello. Hai dubbi o preferisci ordinare direttamente tramite WhatsApp?
          </p>

          <a 
            href={getWhatsAppLink(whatsappMessage)}
            target="_blank"
            rel="noreferrer"
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-4 rounded-full font-display uppercase tracking-widest text-[10px] font-bold hover:bg-[#128C7E] transition-all shadow-lg shadow-green-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            Assistenza WhatsApp
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
