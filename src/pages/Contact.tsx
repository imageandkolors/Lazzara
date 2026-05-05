import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Instagram, Facebook, Clock } from 'lucide-react';

export const Contact = () => {
  return (
    <div className="bg-brand-cream min-h-screen">
      {/* Hero Banner Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=2070&auto=format&fit=crop" 
            alt="Napoli Street" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-[0.4]"
          />
        </motion.div>
        
        <div className="relative z-10 text-center px-4">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-brand-terracotta font-display text-xs uppercase tracking-[0.5em] mb-6 block font-bold"
          >
            Contattaci
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-6xl md:text-8xl text-brand-cream italic font-serif"
          >
            Ci Vediamo?
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-px bg-brand-terracotta/30 w-32 mx-auto mt-8"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-20 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Cards */}
          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 bg-white rounded-[40px] border border-brand-ink/5 text-center shadow-lg shadow-brand-ink/2"
          >
            <div className="w-16 h-16 bg-brand-terracotta/10 text-brand-terracotta rounded-full flex items-center justify-center mx-auto mb-6">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif mb-2">Chiamaci</h3>
            <p className="text-brand-ink/60 mb-6 uppercase tracking-widest text-[10px] font-bold">Siamo sempre pronti a risponderti</p>
            <a href="tel:+39081234567" className="text-lg font-display font-medium hover:text-brand-terracotta transition-colors">+39 081 234 5678</a>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 bg-brand-ink text-brand-cream rounded-[40px] border border-brand-ink/5 text-center shadow-2xl shadow-brand-ink/20"
          >
            <div className="w-16 h-16 bg-brand-cream/10 text-brand-cream rounded-full flex items-center justify-center mx-auto mb-6">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif mb-2">Visitaci</h3>
            <p className="text-brand-cream/40 mb-6 uppercase tracking-widest text-[10px] font-bold">Nel cuore pulsante di Napoli</p>
            <p className="text-lg leading-relaxed">Piazza del Mercato, 12<br />80133 Napoli (NA), Italy</p>
          </motion.div>

          <motion.div 
            whileHover={{ y: -10 }}
            className="p-10 bg-white rounded-[40px] border border-brand-ink/5 text-center shadow-lg shadow-brand-ink/2"
          >
            <div className="w-16 h-16 bg-brand-olive/10 text-brand-olive rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-serif mb-2">Scrivici</h3>
            <p className="text-brand-ink/60 mb-6 uppercase tracking-widest text-[10px] font-bold">Mandaci un messaggio</p>
            <a href="mailto:ciao@lalazzara.it" className="text-lg font-display font-medium hover:text-brand-terracotta transition-colors">ciao@lalazzara.it</a>
          </motion.div>
        </div>

        {/* Map Placeholder / Secondary Info */}
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-brand-ink/5 p-8 rounded-[40px]">
          <div className="aspect-video bg-brand-ink/10 rounded-3xl overflow-hidden relative group">
             <img 
               src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=2070&auto=format&fit=crop" 
               alt="Mappa di Napoli"
               className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
             />
          </div>
          <div className="p-8">
            <h3 className="text-3xl font-serif mb-6 italic">Ore di Passione</h3>
            <div className="space-y-4">
               {[
                 { day: 'Lunedì - Giovedì', hours: '12:00 - 15:30 / 19:00 - 23:00' },
                 { day: 'Venerdì - Sabato', hours: '12:00 - 00:00' },
                 { day: 'Domenica', hours: 'Chiuso per la Famiglia' },
               ].map((item) => (
                 <div key={item.day} className="flex justify-between items-center border-b border-brand-ink/10 pb-4">
                   <span className="font-display text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">{item.day}</span>
                   <span className="font-serif italic">{item.hours}</span>
                 </div>
               ))}
            </div>
            <div className="mt-10 flex gap-6">
               <Instagram className="w-5 h-5 text-brand-ink/40 hover:text-brand-terracotta cursor-pointer transition-colors" />
               <Facebook className="w-5 h-5 text-brand-ink/40 hover:text-brand-terracotta cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
