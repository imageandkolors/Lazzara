import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Utensils, Bike, CheckCircle2, ChevronLeft, MapPin, Clock, MessageCircle } from 'lucide-react';
import { getWhatsAppLink } from '../lib/whatsapp';

type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered';

export const OrderTracking = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!orderId) return;

    const unsub = onSnapshot(doc(db, 'orders', orderId), (doc) => {
      if (doc.exists()) {
        const data = doc.id ? { id: doc.id, ...doc.data() } : null;
        setOrder(data);
      }
      setLoading(false);
    });

    return () => unsub();
  }, [orderId]);

  useEffect(() => {
    if (!order || order.status === 'delivered') return;

    const interval = setInterval(() => {
      const start = order.createdAt?.toMillis() || Date.now();
      const now = Date.now();
      const estimatedTotal = 30 * 60 * 1000; // 30 minutes estimate
      const elapsed = now - start;
      const remaining = Math.max(0, estimatedTotal - elapsed);

      if (remaining === 0) {
        setTimeLeft("Quasi pronto!");
        setProgress(100);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        setProgress(Math.min(100, (elapsed / estimatedTotal) * 100));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [order]);

  if (loading) return (
    <div className="pt-40 pb-20 text-center min-h-screen bg-brand-cream">
      <div className="w-12 h-12 border-4 border-brand-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
      <p className="text-xs uppercase tracking-widest text-brand-ink/40">Recupero informazioni ordine...</p>
    </div>
  );

  if (!order) return (
    <div className="pt-40 pb-20 text-center min-h-screen bg-brand-cream">
      <h2 className="text-4xl font-serif italic text-brand-ink mb-6">Ordine non trovato</h2>
      <Link to="/menu" className="btn-primary px-8 py-4">Torna al Menu</Link>
    </div>
  );

  const steps = [
    { id: 'pending', label: 'Inviato', icon: Package, desc: 'Abbiamo ricevuto il tuo ordine' },
    { id: 'preparing', label: 'In Cucina', icon: Utensils, desc: 'I nostri chef stanno preparando le tue specialità' },
    { id: 'delivering', label: 'In Consegna', icon: Bike, desc: 'Il tuo ordine è sulla strada per casa tua' },
    { id: 'delivered', label: 'Consegnato', icon: CheckCircle2, desc: 'Buon appetito!' }
  ];

  const currentStatusIndex = steps.findIndex(s => s.id === (order.status || 'pending'));

  return (
    <div className="pt-40 pb-20 bg-brand-cream min-h-screen">
      <div className="max-w-3xl mx-auto px-4">
        <Link to="/menu" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-brand-ink/40 hover:text-brand-terracotta mb-12 transition-colors">
          <ChevronLeft className="w-4 h-4" /> Torna al Menu
        </Link>

        <header className="mb-16">
          <span className="text-brand-terracotta font-display text-[10px] uppercase tracking-[0.3em] font-bold block mb-4">Tracking Ordine</span>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-5xl font-serif italic text-brand-ink mb-4">Ordine #{order.id.slice(-6).toUpperCase()}</h1>
              <div className="flex items-center gap-6 text-brand-ink/60 italic">
                <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString()}</span>
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {order.address}</span>
              </div>
            </div>
            
            <a 
              href={getWhatsAppLink(`Ciao! Vorrei aggiornamenti sul mio ordine #${order.id.slice(-6).toUpperCase()}.`)}
              target="_blank"
              rel="noreferrer"
              className="bg-[#25D366] text-white px-6 py-3 rounded-full font-display uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 hover:bg-[#128C7E] transition-all shadow-lg shadow-green-500/10"
            >
              <MessageCircle className="w-4 h-4" />
              Chiedi su WhatsApp
            </a>
          </div>
        </header>

        <div className="bg-white rounded-[40px] p-12 shadow-xl shadow-brand-ink/5 border border-brand-ink/5 mb-12">
          {timeLeft && order.status !== 'delivered' && (
            <div className="mb-12 p-8 bg-brand-cream/50 rounded-[32px] border border-brand-ink/5 flex flex-col items-center text-center">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/40 mb-4 font-display">Tempo stimato all'arrivo</span>
              <div className="text-6xl font-serif italic text-brand-terracotta mb-6 flex items-baseline gap-2">
                {timeLeft}
                <span className="text-xs uppercase tracking-widest text-brand-ink/20 non-italic font-bold">min</span>
              </div>
              <div className="w-full h-2 bg-brand-ink/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-brand-terracotta"
                />
              </div>
            </div>
          )}
          
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-brand-ink/5" />
            <motion.div 
              initial={{ height: 0 }}
              animate={{ height: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }}
              className="absolute left-[23px] top-4 w-0.5 bg-brand-terracotta transition-all duration-1000"
            />

            <div className="space-y-12 relative">
              {steps.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex gap-8 items-start">
                    <motion.div 
                      initial={false}
                      animate={{ 
                        backgroundColor: isCompleted ? '#D2691E' : '#F5F5DC',
                        scale: isCurrent ? 1.2 : 1
                      }}
                      className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-brand-cream shadow-lg`}
                    >
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-brand-ink/20'}`} />
                    </motion.div>
                    <div className={isCompleted ? 'opacity-100' : 'opacity-40'}>
                      <h3 className={`font-serif italic text-2xl ${isCurrent ? 'text-brand-terracotta' : 'text-brand-ink'}`}>{step.label}</h3>
                      <p className="text-sm text-brand-ink/60 mt-1">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-brand-ink text-brand-cream rounded-[40px] p-12">
          <h3 className="text-2xl font-serif italic mb-8">Riepilogo dell'Ordines</h3>
          <div className="space-y-4 mb-8">
            {order.items?.map((item: any) => (
              <div key={item.id} className="flex justify-between items-center text-sm border-b border-brand-cream/10 pb-4">
                <span>{item.quantity}x {item.name}</span>
                <span className="italic">€{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center text-2xl font-serif italic pt-4">
            <span>Totale</span>
            <span className="text-brand-terracotta">€{order.total?.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
