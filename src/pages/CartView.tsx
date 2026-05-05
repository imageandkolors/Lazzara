import React, { useState, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ShoppingBag, ArrowRight, CreditCard, CheckCircle2, Minus, Plus, MessageCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp, getDocs, query, limit, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { onAuthStateChanged } from 'firebase/auth';
import { getWhatsAppLink, formatOrderMessage } from '../lib/whatsapp';

export const CartView = () => {
  const { items, total, removeFromCart, clearCart, addToCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [ordered, setOrdered] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [chefNote, setChefNote] = useState('');
  const [user, setUser] = useState<any>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    orderType: 'takeaway' as 'takeaway' | 'table' | 'delivery'
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        setCustomerInfo(prev => ({
          ...prev,
          name: u.displayName || prev.name,
          email: u.email || prev.email
        }));

        try {
          const docSnap = await getDoc(doc(db, 'users', u.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCustomerInfo(prev => ({
              ...prev,
              address: data.address || prev.address,
              phone: data.phone || prev.phone
            }));
          }
        } catch (err) {
          console.error(err);
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const snap = await getDocs(query(collection(db, 'menuItems'), limit(10)));
        const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const filtered = all
          .filter(i => !items.find(cartItem => cartItem.id === i.id))
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        setSuggestions(filtered);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSuggestions();
  }, [items.length]);

  const handleApplyDiscount = () => {
    const code = discountCode.trim().toUpperCase();
    if (code === 'LAZZARA10') {
      setDiscountAmount(total * 0.1);
      setAppliedCode('LAZZARA10');
      toast.success('Sconto 10% applicato!');
    } else if (code === 'BENVENUTO20') {
      setDiscountAmount(total * 0.2);
      setAppliedCode('BENVENUTO20');
      toast.success('Sconto 20% applicato!');
    } else {
      toast.error('Codice non valido o scaduto');
    }
  };

  const discountedTotal = total - discountAmount;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const orderData = {
      userId: user?.uid || null,
      items,
      total: discountedTotal + 2.5,
      subtotal: total,
      discount: discountAmount,
      discountCode: appliedCode,
      chefNote,
      customerName: customerInfo.name,
      email: customerInfo.email,
      phone: customerInfo.phone,
      address: customerInfo.address,
      orderType: customerInfo.orderType,
      status: 'received',
      createdAt: serverTimestamp()
    };

    try {
      const docRef = await addDoc(collection(db, 'orders'), orderData);
      setOrderId(docRef.id);
      toast.success("Ordine inviato con successo!", {
        description: "Stiamo già preparando le tue delizie.",
        className: "font-serif"
      });
      setOrdered(true);
      clearCart();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  if (ordered) {
    return (
      <div className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center bg-brand-cream">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-brand-olive/10 text-brand-olive rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-5xl font-serif mb-6 italic">Ordine Ricevuto!</h2>
          <p className="text-brand-ink/60 mb-10 text-lg leading-relaxed">
            Il tuo ordine è stato inviato alla nostra cucina. Inizieremo a preparare il tuo banchetto napoletano immediatamente.
          </p>
          <div className="flex flex-col gap-4">
            <a 
              href={getWhatsAppLink(formatOrderMessage(orderId || 'ORD', items, total, customerInfo))}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-[#25D366] text-white py-5 rounded-full font-display uppercase tracking-widest text-[10px] font-bold flex items-center justify-center gap-3 hover:bg-[#128C7E] transition-all shadow-xl shadow-green-500/10"
            >
              <MessageCircle className="w-5 h-5" />
              Notifica Admin su WhatsApp
            </a>
            <Link to={`/tracking/${orderId}`} className="btn-primary w-full text-center py-5">Traccia il Tuo Ordine</Link>
            <Link to="/" className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 hover:text-brand-ink transition-colors mt-2">Torna alla Home</Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center bg-brand-cream">
        <div className="text-center">
          <ShoppingBag className="w-20 h-20 text-brand-ink/5 mx-auto mb-8" />
          <h2 className="text-5xl font-serif mb-6 italic">Il Carrello è vuoto</h2>
          <p className="text-brand-ink/40 mb-10 uppercase tracking-[0.3em] text-[10px]">Non hai ancora aggiunto nessuna prelibatezza.</p>
          <Link to="/menu" className="btn-primary">Esplora il Menu</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 bg-brand-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20">
          <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.3em] mb-4 block">Il Tuo Ordine</span>
          <h1 className="text-6xl md:text-7xl italic">Il Mio Carrello</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9, transition: { duration: 0.2 } }}
                  className="flex flex-col sm:flex-row items-center gap-6 p-6 sm:p-8 bg-white rounded-[40px] border border-brand-ink/5 shadow-xl shadow-brand-ink/2"
                >
                  <div className="flex-grow text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-serif">{item.name}</h3>
                    <p className="text-brand-ink/40 text-[10px] font-display uppercase tracking-widest mt-2 font-bold">€{item.price.toFixed(2)} / unità</p>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:gap-6 bg-brand-cream rounded-full p-1 sm:p-1.5 px-4 sm:px-6">
                    <button onClick={() => removeFromCart(item.id)} className="text-brand-ink/40 hover:text-brand-terracotta transition-colors">
                      <Minus className="w-4 h-4 sm:w-5 h-5" />
                    </button>
                    <motion.span 
                      key={item.quantity}
                      initial={{ scale: 1.5, color: '#D2691E' }}
                      animate={{ scale: 1, color: '#1A1A1A' }}
                      className="font-display font-medium w-4 sm:w-6 text-center text-base sm:text-lg"
                    >
                      {item.quantity}
                    </motion.span>
                    <button onClick={() => addToCart(item)} className="text-brand-ink/40 hover:text-brand-terracotta transition-colors">
                      <Plus className="w-4 h-4 sm:w-5 h-5" />
                    </button>
                  </div>

                  <div className="text-center sm:text-right min-w-[80px] sm:min-w-[100px]">
                    <motion.span 
                      key={item.price * item.quantity}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-serif text-xl sm:text-2xl italic text-brand-terracotta block"
                    >
                      €{(item.price * item.quantity).toFixed(2)}
                    </motion.span>
                  </div>
                  
                  <button 
                    onClick={() => {
                        removeFromCart(item.id, true);
                        toast.info("Articolo rimosso");
                    }}
                    className="text-brand-ink/10 hover:text-red-500 transition-colors p-2 absolute top-4 right-4 sm:static"
                  >
                    <Trash2 className="w-5 h-5 sm:w-6 h-6" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Chef's Suggestions in Cart */}
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-16 pt-16 border-t border-brand-ink/5"
              >
                <h3 className="text-3xl font-serif italic text-brand-ink mb-8">Completa il tuo banchetto</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {suggestions.map((sugg) => (
                    <div key={sugg.id} className="bg-white p-6 rounded-[32px] flex items-center gap-6 border border-brand-ink/5 hover:border-brand-terracotta/30 transition-all group">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-ink/5">
                        {sugg.imageUrl && (
                          <img 
                            src={sugg.imageUrl} 
                            alt={sugg.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-serif italic text-xl line-clamp-1">{sugg.name}</h4>
                        <p className="text-brand-terracotta font-serif">€{sugg.price.toFixed(2)}</p>
                      </div>
                      <button 
                        onClick={() => addToCart(sugg as any)}
                        className="w-12 h-12 bg-brand-ink text-brand-cream rounded-full flex items-center justify-center hover:bg-brand-terracotta transition-all shadow-lg active:scale-95"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="bg-brand-ink text-brand-cream p-10 md:p-12 rounded-[50px] sticky top-32 shadow-2xl shadow-brand-ink/30">
              <h2 className="text-4xl font-serif mb-10 italic">Riepilogo Ordine</h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between text-brand-cream/40">
                  <span className="font-display text-[10px] uppercase tracking-[0.2em]">Subtotale</span>
                  <span className="font-display font-medium">€{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-brand-cream/40">
                  <span className="font-display text-[10px] uppercase tracking-[0.2em]">Consegna</span>
                  <span className="font-display font-medium">€2.50</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="font-display text-[10px] uppercase tracking-[0.2em]">Sconto ({appliedCode})</span>
                    <span className="font-display font-medium">-€{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Discount Code Input */}
                {!appliedCode ? (
                  <div className="flex gap-2 pt-4">
                    <input
                      placeholder="Codice Sconto"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="flex-grow bg-brand-cream/5 border border-brand-cream/10 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-brand-terracotta outline-none transition-all placeholder:text-brand-cream/20"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyDiscount}
                      className="bg-brand-cream/10 hover:bg-brand-cream/20 px-4 py-2 rounded-xl text-[8px] uppercase tracking-widest font-bold transition-all"
                    >
                      Applica
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-green-400">Codice `{appliedCode}` Applicato</span>
                    <button 
                      onClick={() => { setDiscountAmount(0); setAppliedCode(null); }}
                      className="text-[8px] uppercase tracking-widest font-bold text-brand-cream/40 hover:text-red-400"
                    >
                      Rimuovi
                    </button>
                  </div>
                )}

                <div className="pt-8 border-t border-brand-cream/10 flex justify-between items-end">
                  <span className="font-display text-[10px] uppercase tracking-[0.3em] font-bold">Totale</span>
                  <motion.span 
                    key={discountedTotal}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-4xl font-serif text-brand-terracotta italic"
                  >
                    €{(discountedTotal + 2.5).toFixed(2)}
                  </motion.span>
                </div>
              </div>

              <form onSubmit={handleCheckout} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-cream/40 px-2 italic">Preferenze o Allergie?</label>
                  <textarea
                    placeholder="Esempio: Niente pepe, allergia al glutine, tavolino all'esterno..."
                    value={chefNote}
                    onChange={(e) => setChefNote(e.target.value)}
                    rows={2}
                    className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-brand-terracotta outline-none transition-all placeholder:text-brand-cream/20 resize-none italic"
                  />
                </div>
                
                <input
                  required
                  placeholder="Nome e Cognome"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-brand-terracotta outline-none transition-all placeholder:text-brand-cream/20"
                />

                <div className="space-y-4">
                  <label className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-cream/40 px-2">Tipo di Ordine *</label>
                  <select 
                    value={customerInfo.orderType}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, orderType: e.target.value as any })}
                    className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-2xl px-6 py-5 text-sm focus:ring-1 focus:ring-brand-terracotta outline-none transition-all appearance-none cursor-pointer font-serif italic text-lg"
                  >
                    <option value="takeaway" className="bg-brand-ink">🥡 Ritiro sul posto (Asporto)</option>
                    <option value="table" className="bg-brand-ink">🍽️ Consumazione al Tavolo</option>
                    <option value="delivery" className="bg-brand-ink">🛵 Consegna a Domicilio (Napoli)</option>
                  </select>
                </div>

                <input
                  required
                  type="email"
                  placeholder="Email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-brand-terracotta outline-none transition-all placeholder:text-brand-cream/20"
                />
                <input
                  required
                  placeholder="Indirizzo di Consegna"
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="w-full bg-brand-cream/5 border border-brand-cream/10 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-brand-terracotta outline-none transition-all placeholder:text-brand-cream/20"
                />
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-cream text-brand-ink py-6 rounded-full font-display uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-brand-terracotta hover:text-brand-cream transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 active:scale-95"
                >
                  {loading ? 'Elaborazione...' : (
                    <>
                      Conferma & Ordina <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-[10px] text-brand-cream/20 uppercase tracking-widest font-bold py-2 italic">— Oppure —</p>

                <a
                  href={getWhatsAppLink(`Ciao! Vorrei ordinare questi piatti: ${items.map(i => `${i.quantity}x ${i.name}`).join(', ')}. \nTipo: ${customerInfo.orderType === 'takeaway' ? 'Asporto' : customerInfo.orderType === 'table' ? 'Al Tavolo' : 'Consegna'}. \nTotale: €${total.toFixed(2)}`)}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full border border-brand-cream/10 text-brand-cream py-5 rounded-full font-display uppercase tracking-[0.3em] text-[10px] font-bold hover:bg-[#25D366] hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95 group"
                >
                  <MessageCircle className="w-5 h-5 group-hover:animate-bounce" />
                  Ordina Solo via WhatsApp
                </a>
              </form>

              <div className="mt-12 flex items-center justify-center gap-4 opacity-20">
                <CreditCard className="w-5 h-5" />
                <span className="text-[10px] uppercase tracking-widest font-bold font-display">Pagamento Sicuro via Revolut</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
