import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Clock, MapPin, User, ChevronRight, RotateCcw, Heart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';

interface Order {
  id: string;
  items: any[];
  total: number;
  status: string;
  createdAt: any;
  address: string;
}

export const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ address: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      if (u) {
        setUser(u);
        fetchOrders(u.email!);
        fetchSettings(u.uid);
      } else {
        navigate('/');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchSettings = async (uid: string) => {
    try {
      const docSnap = await getDoc(doc(db, 'users', uid));
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), settings, { merge: true });
      toast.success("Impostazioni salvate!");
    } catch (err) {
      toast.error("Errore nel salvataggio");
    } finally {
      setSaving(false);
    }
  };

  const fetchOrders = async (email: string) => {
    try {
      const q = query(
        collection(db, 'orders'),
        where('email', '==', email),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const orderList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(orderList);
    } catch (error) {
      console.error("Errore nel recupero ordini:", error);
      // Fallback for list queries if index is missing or rules are tight
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const filtered = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Order))
          .filter(o => (o as any).email === email);
        setOrders(filtered);
      } catch (e) {
        handleFirestoreError(e, OperationType.LIST, 'orders');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleReorder = (order: Order) => {
    order.items.forEach(item => addToCart(item));
    toast.success("Prodotti ri-aggiunti al carrello!", {
      description: "Puoi ora procedere al pagamento.",
      className: "font-serif"
    });
    navigate('/cart');
  };

  if (!user) return null;

  return (
    <div className="pt-32 pb-20 bg-brand-cream min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* User Info Sidebar */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-8 rounded-[40px] border border-brand-ink/5 shadow-xl shadow-brand-ink/5 sticky top-32"
            >
              <div className="flex flex-col items-center text-center">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=D2691E&color=fff`} 
                  alt={user.displayName} 
                  className="w-24 h-24 rounded-full border-4 border-brand-cream mb-6 object-cover"
                />
                <h2 className="text-2xl font-serif mb-1">{user.displayName}</h2>
                <p className="text-xs uppercase tracking-widest text-brand-ink/40 mb-8">{user.email}</p>
                
                <div className="w-full space-y-4 pt-8 border-t border-brand-ink/5">
                  <div className="flex items-center gap-3 text-sm text-brand-ink/60">
                    <User className="w-4 h-4 text-brand-terracotta" />
                    <span>Membro dal 2024</span>
                  </div>
                </div>

                <div className="w-full space-y-4 pt-8 mt-8 border-t border-brand-ink/5 text-left">
                  <h4 className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-4 px-2">Dati Predefiniti</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-[8px] uppercase tracking-widest font-bold text-brand-ink/20 px-2 block mb-1">Indirizzo Rapido</label>
                      <input 
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        placeholder="Via... Napoli"
                        className="w-full bg-brand-cream/50 border border-brand-ink/5 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-brand-terracotta outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] uppercase tracking-widest font-bold text-brand-ink/20 px-2 block mb-1">Telefono</label>
                      <input 
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        placeholder="+39..."
                        className="w-full bg-brand-cream/50 border border-brand-ink/5 rounded-xl px-4 py-2 text-xs focus:ring-1 focus:ring-brand-terracotta outline-none transition-all"
                      />
                    </div>
                    <button 
                      onClick={saveSettings}
                      disabled={saving}
                      className="w-full py-3 bg-brand-ink text-brand-cream rounded-xl text-[10px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all disabled:opacity-50"
                    >
                      {saving ? 'Salvataggio...' : 'Aggiorna Dati'}
                    </button>
                  </div>
                </div>

                <div className="w-full pt-8">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-widest font-display text-red-500 hover:text-red-700 transition-colors pt-4"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Activity / Order History */}
          <div className="lg:col-span-2">
            <header className="mb-12">
              <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.3em] mb-4 block">Il Tuo Storico</span>
              <h1 className="text-5xl font-serif italic">I Miei Ordini</h1>
            </header>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-32 bg-white/50 rounded-3xl animate-pulse" />
                ))}
              </div>
            ) : orders.length > 0 ? (
              <div className="space-y-6">
                {orders.map((order) => (
                  <motion.div 
                    key={order.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white p-6 md:p-8 rounded-[32px] border border-brand-ink/5 hover:border-brand-terracotta/20 transition-all cursor-pointer shadow-lg shadow-brand-ink/2"
                    onClick={() => navigate(`/tracking/${order.id}`)}
                  >
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-4 flex-grow">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-brand-cream rounded-full flex items-center justify-center text-brand-terracotta">
                            <Package className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-brand-ink/40">Ordine #{order.id.slice(-6).toUpperCase()}</p>
                            <h3 className="font-serif text-lg italic">
                              {order.items.map(item => item.name).join(', ')}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-xs text-brand-ink/60">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('it-IT') : 'Recent'}
                          </div>
                          <div className="flex items-center gap-1.5 line-clamp-1 max-w-[200px]">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{order.address}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold text-brand-ink/80">
                            <ChevronRight className="w-3.5 h-3.5" />
                            Dettagli Tracking
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-row md:flex-col justify-between items-end gap-4 shrink-0">
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-brand-ink/5 text-brand-ink/60'
                          }`}>
                            {order.status === 'received' ? 'Ricevuto' : 
                             order.status === 'preparing' ? 'In cucina' :
                             order.status === 'delivering' ? 'In consegna' : 
                            order.status === 'delivered' ? 'Consegnato' : 
                            order.status === 'cancelled' ? 'Annullato' : order.status}
                          </span>
                          <p className="text-2xl font-serif text-brand-terracotta italic font-bold">€{order.total.toFixed(2)}</p>
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleReorder(order); }}
                          className="flex items-center gap-2 px-4 py-2 bg-brand-ink text-brand-cream rounded-full text-[9px] uppercase tracking-widest font-bold hover:bg-brand-terracotta transition-all shadow-lg active:scale-95"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Ri-ordina
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 border border-dashed border-brand-ink/10 rounded-[32px] p-20 text-center">
                <Package className="w-12 h-12 text-brand-ink/10 mx-auto mb-4" />
                <p className="text-brand-ink/40 font-display text-[10px] uppercase tracking-[0.2em]">Non hai ancora effettuato ordini</p>
                <button 
                  onClick={() => navigate('/menu')}
                  className="mt-6 text-brand-terracotta hover:underline font-serif italic text-lg"
                >
                  Sfoglia il Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
