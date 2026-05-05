import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, Users, Clock, ArrowRight, CheckCircle2, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { getWhatsAppLink, formatReservationMessage } from '../lib/whatsapp';

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface ReservationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReservationSidebar: React.FC<ReservationSidebarProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    guests: '2',
    occasion: '',
    name: '',
    email: '',
    phone: '',
    specialRequest: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const validatePhone = (phone: string) => {
    const regex = /^((\+|00)39|39)?\s?3\d{2}\s?\d{6,7}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError(null);

    if (!validatePhone(formData.phone)) {
      setPhoneError('Inserisci un numero di cellulare italiano valido (es. +39 333 1234567)');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, 'reservations'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      toast.success('Prenotazione ricevuta! Ti invieremo una conferma a breve.');
    } catch (error) {
      console.error("Reservation failed:", error);
      toast.error('Errore durante la prenotazione. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-brand-ink/60 backdrop-blur-sm z-[100]"
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-lg bg-brand-cream z-[101] shadow-2xl p-8 md:p-12 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-serif italic text-brand-ink">Prenota un Tavolo</h2>
              <button 
                onClick={onClose}
                className="w-12 h-12 rounded-full border border-brand-ink/10 flex items-center justify-center hover:bg-brand-ink hover:text-brand-cream transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20"
              >
                <div className="w-24 h-24 bg-brand-olive/10 text-brand-olive rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h3 className="text-3xl font-serif mb-4 italic">Richiesta Inviata!</h3>
                <p className="text-brand-ink/60 mb-12">Grazie {formData.name}. Abbiamo ricevuto la tua richiesta per {formData.guests} persone il {formData.date} alle {formData.time}. Confermeremo via email a breve.</p>
                
                <div className="space-y-4">
                  <a 
                    href={getWhatsAppLink(formatReservationMessage(formData))}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full bg-[#25D366] text-white px-8 py-5 rounded-full font-display uppercase tracking-widest text-xs font-bold flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all shadow-xl shadow-green-500/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Conferma su WhatsApp
                  </a>
                  <button onClick={onClose} className="btn-primary w-full py-5">Chiudi</button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-10">
                {step === 1 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Data della Visita
                      </label>
                      <input 
                        type="date" 
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-2xl focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 flex items-center gap-2">
                          <Users className="w-3 h-3" /> Ospiti
                        </label>
                        <select 
                          value={formData.guests}
                          onChange={(e) => setFormData({...formData, guests: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-2xl focus:border-brand-terracotta outline-none transition-colors"
                        >
                          {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Persone</option>)}
                          <option value="9+">9+ Persone</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 flex items-center gap-2">
                          <Clock className="w-3 h-3" /> Orario
                        </label>
                        <select 
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-2xl focus:border-brand-terracotta outline-none transition-colors"
                        >
                          <option value="">Seleziona</option>
                          <option value="12:00">12:00</option>
                          <option value="13:00">13:00</option>
                          <option value="19:30">19:30</option>
                          <option value="20:30">20:30</option>
                          <option value="21:30">21:30</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Occasione Speciale (Opzionale)</label>
                      <select 
                        value={formData.occasion}
                        onChange={(e) => setFormData({...formData, occasion: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-xl focus:border-brand-terracotta outline-none transition-colors"
                      >
                        <option value="">Nessuna</option>
                        <option value="Compleanno">Compleanno</option>
                        <option value="Anniversario">Anniversario</option>
                        <option value="Cena di Lavoro">Cena di Lavoro</option>
                        <option value="Altro">Altro</option>
                      </select>
                    </div>

                    <button 
                      type="button" 
                      onClick={nextStep}
                      disabled={!formData.date || !formData.time}
                      className="btn-primary w-full flex items-center justify-center gap-3 py-6 disabled:opacity-50"
                    >
                      Continua <ArrowRight className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-8"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Nome Completo</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Gennaro Esposito"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-xl focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Email</label>
                      <input 
                        type="email" 
                        required
                        placeholder="tuamail@esempio.it"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-xl focus:border-brand-terracotta outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Telefono</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="+39 333 123 4567"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full bg-transparent border-b-2 ${phoneError ? 'border-red-500' : 'border-brand-ink/10'} py-4 font-serif text-xl focus:border-brand-terracotta outline-none transition-colors`}
                      />
                      {phoneError && <p className="text-red-500 text-[10px] italic mt-1">{phoneError}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Richieste Speciali (Opzionale)</label>
                      <textarea 
                        rows={2}
                        placeholder="Allergie, preferenze tavolo, note..."
                        value={formData.specialRequest}
                        onChange={(e) => setFormData({...formData, specialRequest: e.target.value})}
                        className="w-full bg-transparent border-b-2 border-brand-ink/10 py-4 font-serif text-lg focus:border-brand-terracotta outline-none transition-colors resize-none"
                      />
                    </div>

                    <div className="flex gap-4">
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="btn-secondary flex-1 py-6"
                      >
                        Indietro
                      </button>
                      <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="btn-primary flex-[2] py-6 flex items-center justify-center gap-3"
                      >
                        {isSubmitting ? 'Inviando...' : 'Conferma Prenotazione'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            )}

            <div className="mt-20 pt-10 border-t border-brand-ink/5">
              <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/30 mb-4 text-center">Oppure chiamaci direttamente</p>
              <a href="tel:+390815517854" className="block text-center text-2xl font-serif italic text-brand-terracotta hover:text-brand-ink transition-colors">+39 081 551 7854</a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
