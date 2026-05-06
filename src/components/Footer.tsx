import React from 'react';
import { motion } from 'motion/react';

export const Footer = () => {
  return (
    <footer className="bg-brand-ink text-brand-cream py-20 border-t border-brand-cream/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 sm:gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-6">
              <img 
                src="https://firebasestorage.googleapis.com/v0/b/ais-dev-zgzhh3srvjuqxkncze3ggc-434272613748.appspot.com/o/artifacts%2Fla_lazzara_logo.png?alt=media" 
                alt="La Lazzara Logo" 
                className="w-16 h-16 rounded-full border border-brand-cream/10"
                referrerPolicy="no-referrer"
              />
              <h2 className="text-3xl font-serif">La Lazzara</h2>
            </div>
            <p className="text-brand-cream/60 max-w-sm mb-8 leading-relaxed italic">
              Tradizione Napoletana per Palati Sopraffini. Portiamo i sapori autentici di Napoli sulla tua tavola dal 1985.
            </p>
            <div className="flex space-x-4">
              {['Instagram', 'Facebook', 'TripAdvisor'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="text-[10px] uppercase tracking-widest font-bold hover:text-brand-terracotta transition-colors"
                >
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-display text-[10px] uppercase tracking-[0.2em] mb-6 text-brand-terracotta font-bold">Indirizzo</h3>
            <p className="text-brand-cream/80 mb-2">Piazza del Mercato, 12</p>
            <p className="text-brand-cream/80">80133 Napoli (NA), Italy</p>
          </div>

          <div>
            <h3 className="font-display text-[10px] uppercase tracking-[0.2em] mb-6 text-brand-terracotta font-bold">Orari</h3>
            <p className="text-brand-cream/80 mb-2">Lun - Sab: 12:00 - 23:30</p>
            <p className="text-brand-cream/80">Domenica: Chiuso</p>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-brand-cream/10 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-brand-cream/40">
          <p>© 2024 La Lazzara. Tutti i diritti riservati.</p>
          <div className="flex gap-8 font-bold">
            <a href="#" className="hover:text-brand-cream transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-cream transition-colors">Termini di Servizio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
