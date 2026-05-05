import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar, Users, Clock, Send, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { toast } from 'sonner';

export const Reservations = () => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    notes: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'reservations'), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      toast.success("Prenotazione inviata!", {
        description: "Ti invieremo un'email di conferma a breve.",
        className: "font-serif"
      });
      setSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'guests' ? parseInt(value) : value }));
  };

  if (submitted) {
    return (
      <div className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center bg-brand-cream">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 bg-brand-olive/10 text-brand-olive rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-4xl font-serif mb-4 italic">A Presto!</h2>
          <p className="text-brand-ink/60 mb-8 leading-relaxed">
            La tua richiesta è stata ricevuta. Invieremo un'email di conferma a <span className="text-brand-ink font-medium">{formData.email}</span> a breve.
          </p>
          <button 
            onClick={() => setSubmitted(false)}
            className="btn-primary"
          >
            Nuova prenotazione
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.3em] mb-4 block">Prenotazione Tavoli</span>
            <h1 className="text-6xl md:text-7xl mb-8 italic">Trova il tuo tavolo a <br />La Lazzara</h1>
            <p className="text-brand-ink/60 text-lg mb-12 leading-relaxed">
              Che si tratti di una cena romantica per due o di una festa in famiglia, assicuriamo un'esperienza autenticamente napoletana.
            </p>

            <div className="space-y-8">
               <div className="flex gap-4 items-start">
                 <Calendar className="w-6 h-6 text-brand-terracotta mt-1" />
                 <div>
                   <h4 className="font-serif text-xl mb-1 italic">Prenota in Anticipo</h4>
                   <p className="text-xs uppercase tracking-widest text-brand-ink/40 font-bold">Consigliato per il servizio cena del fine settimana.</p>
                 </div>
               </div>
               <div className="flex gap-4 items-start">
                 <Users className="w-6 h-6 text-brand-terracotta mt-1" />
                 <div>
                   <h4 className="font-serif text-xl mb-1 italic">Gruppi di 6+ persone</h4>
                   <p className="text-xs uppercase tracking-widest text-brand-ink/40 font-bold">Vi preghiamo di chiamarci direttamente per grandi gruppi.</p>
                 </div>
               </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 md:p-12 rounded-[40px] shadow-2xl shadow-brand-ink/5 border border-brand-ink/5"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-display text-brand-ink/40 font-bold px-2">Nome Completo</label>
                  <input
                    required
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-terracotta outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-display text-brand-ink/40 font-bold px-2">Indirizzo Email</label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-terracotta outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-display text-brand-ink/40 font-bold px-2">Data</label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-terracotta outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-display text-brand-ink/40 font-bold px-2">Ora</label>
                  <select
                    required
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full bg-brand-cream/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-terracotta outline-none transition-all appearance-none"
                  >
                    <option value="">Seleziona Ora</option>
                    {['12:00', '12:30', '13:00', '13:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-display text-brand-ink/40 font-bold px-2">Numero di Ospiti</label>
                <div className="flex items-center gap-4">
                  <Users className="w-4 h-4 text-brand-ink/20" />
                  <input
                    type="range"
                    min="1"
                    max="10"
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    className="flex-grow accent-brand-terracotta"
                  />
                  <span className="font-serif text-2xl w-8 italic">{formData.guests}</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest font-display text-brand-ink/40 font-bold px-2">Note Speciali (Opzionale)</label>
                <textarea
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Allergie, compleanni, esigenze particolari..."
                  className="w-full bg-brand-cream/50 border-none rounded-2xl px-4 py-3 focus:ring-2 focus:ring-brand-terracotta outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed py-6 flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                {loading ? 'Elaborazione...' : (
                  <>
                    Completa Prenotazione <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
