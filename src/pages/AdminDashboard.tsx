import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Utensils, Bike, CheckCircle2, Search, Filter, Clock, Calendar, ChefHat, Bell } from 'lucide-react';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'preparing' | 'delivering' | 'delivered';

export const AdminDashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'reservations' | 'menu' | 'settings'>('orders');
  const [systemSettings, setSystemSettings] = useState<any>({ isOpen: true, announcement: '' });
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubOrders = onSnapshot(ordersQuery, (snap) => {
      setOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const resQuery = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
    const unsubRes = onSnapshot(resQuery, (snap) => {
      setReservations(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const menuQuery = query(collection(db, 'menuItems'), orderBy('name', 'asc'));
    const unsubMenu = onSnapshot(menuQuery, (snap) => {
      setMenuItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const settingsDoc = doc(db, 'settings', 'restaurant');
    const unsubSettings = onSnapshot(settingsDoc, (snap) => {
      if (snap.exists()) setSystemSettings(snap.data());
    });

    return () => {
      unsubOrders();
      unsubRes();
      unsubMenu();
      unsubSettings();
    };
  }, []);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Ordine aggiornato a ${newStatus}`);
    } catch (error) {
      toast.error("Errore durante l'aggiornamento");
    }
  };

  const toggleAvailability = async (itemId: string, current: boolean) => {
    try {
      await updateDoc(doc(db, 'menuItems', itemId), { isAvailable: !current });
      toast.success('Disponibilità aggiornata');
    } catch (error) {
      toast.error("Errore");
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return Package;
      case 'preparing': return Utensils;
      case 'delivering': return Bike;
      case 'delivered': return CheckCircle2;
      default: return Package;
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'preparing': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'delivering': return 'bg-purple-100 text-purple-600 border-purple-200';
      case 'delivered': return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Admin Sidebar */}
      <aside className="w-72 bg-brand-ink text-brand-cream hidden lg:flex flex-col p-8 fixed h-full z-20">
        <div className="flex items-center gap-4 mb-16 px-4">
          <img 
            src="https://firebasestorage.googleapis.com/v0/b/ais-dev-zgzhh3srvjuqxkncze3ggc-434272613748.appspot.com/o/artifacts%2Fla_lazzara_logo.png?alt=media" 
            alt="La Lazzara Logo" 
            className="w-12 h-12 rounded-full border border-white/10"
            referrerPolicy="no-referrer"
          />
          <span className="font-serif italic text-2xl">La Lazzara</span>
        </div>

        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'orders' ? 'bg-brand-terracotta text-white shadow-lg shadow-brand-terracotta/20' : 'hover:bg-white/5'}`}
          >
            <Package className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Ordini</span>
            {orders.filter(o => o.status === 'pending').length > 0 && (
              <span className="ml-auto bg-white text-brand-terracotta w-5 h-5 rounded-full text-[10px] flex items-center justify-center">
                {orders.filter(o => o.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('reservations')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'reservations' ? 'bg-brand-terracotta text-white shadow-lg shadow-brand-terracotta/20' : 'hover:bg-white/5'}`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Prenotazioni</span>
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'menu' ? 'bg-brand-terracotta text-white shadow-lg shadow-brand-terracotta/20' : 'hover:bg-white/5'}`}
          >
            <Utensils className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Menu Live</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'settings' ? 'bg-brand-terracotta text-white shadow-lg shadow-brand-terracotta/20' : 'hover:bg-white/5'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-sm font-bold uppercase tracking-widest">Stato App</span>
          </button>
        </nav>

        <div className="mt-auto p-6 bg-white/5 rounded-3xl border border-white/5">
          <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-cream/40 mb-2">Stato Sistema</p>
          <div className="flex items-center gap-2 text-emerald-400">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
            <span className="text-xs font-bold">Online & Live</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow lg:pl-72">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 p-8 flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-3xl font-serif italic text-brand-ink">
              {activeTab === 'orders' ? 'Gestione Ordini' : 'Prenotazioni Tavoli'}
            </h1>
            <p className="text-xs text-brand-ink/40 uppercase tracking-widest font-bold mt-1">
              {activeTab === 'orders' ? `${orders.length} ordini totali` : `${reservations.length} prenotazioni`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-3 bg-gray-50 border border-gray-100 rounded-2xl text-brand-ink/40 hover:text-brand-terracotta transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-terracotta rounded-full" />
            </button>
            <div className="h-10 w-px bg-gray-100 mx-2" />
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-2xl border border-gray-100">
              <div className="w-8 h-8 rounded-full bg-brand-terracotta/20 text-brand-terracotta flex items-center justify-center font-bold text-xs uppercase">
                AD
              </div>
              <span className="text-xs font-bold text-brand-ink">Admin Mod</span>
            </div>
          </div>
        </header>

        <div className="p-8">
          {activeTab === 'orders' ? (
            <div className="space-y-6">
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
                {['all', 'pending', 'preparing', 'delivering', 'delivered'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-6 py-2.5 rounded-full text-[10px] uppercase tracking-widest font-bold border transition-all whitespace-nowrap ${
                      filter === f 
                        ? 'bg-brand-ink text-white border-brand-ink' 
                        : 'bg-white text-brand-ink/40 border-gray-100 hover:border-brand-terracotta/30'
                    }`}
                  >
                    {f === 'all' ? 'Tutti gli Ordini' : f === 'pending' ? 'Ricevuti' : f === 'preparing' ? 'In Cucina' : f === 'delivering' ? 'In Consegna' : 'Consegnati'}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-20 text-center bg-white border border-dashed border-gray-200 rounded-[40px]"
                    >
                      <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-brand-ink/40 italic">Nessun ordine trovato per questo filtro.</p>
                    </motion.div>
                  ) : (
                    filteredOrders.map((order) => (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-gray-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all duration-500 group"
                      >
                        <div className="flex flex-col lg:flex-row gap-8">
                          <div className="flex-grow">
                            <div className="flex items-start justify-between mb-6">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-2xl font-serif text-brand-ink">Ordine #{order.id.slice(-6).toUpperCase()}</h3>
                                  <span className={`px-4 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${getStatusColor(order.status)}`}>
                                    {order.status === 'pending' ? 'Ricevuto' : order.status === 'preparing' ? 'In Cucina' : order.status === 'delivering' ? 'In Consegna' : 'Consegnato'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-brand-ink/40 font-bold uppercase tracking-widest">
                                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(order.createdAt?.seconds * 1000).toLocaleTimeString()}</span>
                                  <span>•</span>
                                  <span>{order.customerName}</span>
                                </div>
                              </div>
                              <span className="text-3xl font-serif italic text-brand-terracotta">€{order.total?.toFixed(2)}</span>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-6 border-t border-b border-gray-50 mb-6">
                              {order.items?.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-col">
                                  <span className="text-[10px] text-brand-ink/40 uppercase tracking-widest font-bold">{item.quantity}x</span>
                                  <span className="text-sm font-medium text-brand-ink">{item.name}</span>
                                </div>
                              ))}
                            </div>

                            {order.chefNote && (
                              <div className="p-4 bg-brand-cream/50 rounded-2xl border border-brand-ink/5 italic text-sm text-brand-ink/60 mb-6">
                                " {order.chefNote} "
                              </div>
                            )}

                            <div className="flex items-center gap-3">
                              <span className="text-[10px] uppercase font-bold text-brand-ink/40 italic">Indirizzo:</span>
                              <span className="text-sm text-brand-ink/60">{order.address} ({order.phone})</span>
                            </div>
                          </div>

                          <div className="w-full lg:w-72 flex flex-col gap-3 justify-center border-l border-gray-50 pl-0 lg:pl-8">
                            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-ink/20 text-center mb-2">Aggiorna Stato</p>
                            <button 
                              onClick={() => updateStatus(order.id, 'preparing')}
                              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-xs uppercase tracking-widest ${order.status === 'preparing' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-50 text-brand-ink hover:bg-blue-100'}`}
                            >
                              <Utensils className="w-4 h-4" /> Preparazione
                            </button>
                            <button 
                              onClick={() => updateStatus(order.id, 'delivering')}
                              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-xs uppercase tracking-widest ${order.status === 'delivering' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-50 text-brand-ink hover:bg-purple-100'}`}
                            >
                              <Bike className="w-4 h-4" /> In Consegna
                            </button>
                            <button 
                              onClick={() => updateStatus(order.id, 'delivered')}
                              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-bold text-xs uppercase tracking-widest ${order.status === 'delivered' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-gray-50 text-brand-ink hover:bg-emerald-100'}`}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Completato
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : activeTab === 'reservations' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reservations.map((res) => (
                <motion.div
                  key={res.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="w-12 h-12 bg-brand-terracotta/10 text-brand-terracotta rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-brand-ink/20">#{res.id.slice(-4).toUpperCase()}</span>
                  </div>
                  
                  <h3 className="text-2xl font-serif italic mb-2 text-brand-ink">{res.name}</h3>
                  <div className="space-y-3 mb-8">
                    <p className="text-sm flex items-center gap-3 text-brand-ink/60">
                      <Calendar className="w-4 h-4 text-brand-terracotta" /> {res.date} alle {res.time}
                    </p>
                    <p className="text-sm flex items-center gap-3 text-brand-ink/60">
                      <Utensils className="w-4 h-4 text-brand-terracotta" /> Tavolo per {res.guests} persone
                    </p>
                    <p className="text-sm flex items-center gap-3 text-brand-ink/60 underline decoration-brand-terracotta/30">
                      <Filter className="w-4 h-4 text-brand-terracotta" /> {res.phone}
                    </p>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-50">
                    <a 
                      href={`tel:${res.phone}`}
                      className="flex-grow py-3 bg-brand-ink text-brand-cream rounded-2xl text-[10px] uppercase tracking-widest font-bold text-center hover:bg-brand-terracotta transition-colors"
                    >
                      Chiama
                    </a>
                    <button className="flex-grow py-3 border border-gray-100 text-brand-ink/40 rounded-2xl text-[10px] uppercase tracking-widest font-bold hover:bg-gray-50 transition-colors">
                      Elimina
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : activeTab === 'menu' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {menuItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                  <div className="aspect-video rounded-2xl overflow-hidden mb-4 bg-brand-ink/5">
                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <h4 className="font-serif italic text-xl mb-1 text-brand-ink">{item.name}</h4>
                  <p className="text-brand-terracotta font-serif mb-4">€{item.price.toFixed(2)}</p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
                    <span className={`text-[9px] uppercase tracking-widest font-bold ${item.isAvailable !== false ? 'text-emerald-500' : 'text-red-500'}`}>
                      {item.isAvailable !== false ? 'Disponibile' : 'Terminato'}
                    </span>
                    <button 
                      onClick={() => toggleAvailability(item.id, item.isAvailable !== false)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${item.isAvailable !== false ? 'bg-emerald-500' : 'bg-gray-200'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.isAvailable !== false ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-12">
              <div className="bg-white p-12 rounded-[48px] border border-gray-100 shadow-sm">
                <h3 className="text-3xl font-serif text-brand-ink mb-8 italic">Stato Ristorante</h3>
                
                <div className="flex items-center justify-between p-8 bg-gray-50 rounded-3xl mb-12">
                  <div>
                    <p className="text-lg font-bold text-brand-ink mb-1">
                      {systemSettings.isOpen ? 'Ristorante Aperto' : 'Ristorante Chiuso'}
                    </p>
                    <p className="text-xs text-brand-ink/40 uppercase tracking-widest font-bold">
                      Determina se gli utenti possono ordinare online
                    </p>
                  </div>
                  <button 
                    onClick={async () => {
                      await updateDoc(doc(db, 'settings', 'restaurant'), { isOpen: !systemSettings.isOpen });
                      toast.success("Stato aggiornato");
                    }}
                    className={`relative w-20 h-10 rounded-full transition-colors ${systemSettings.isOpen ? 'bg-emerald-500' : 'bg-red-500'}`}
                  >
                    <div className={`absolute top-1 w-8 h-8 bg-white rounded-full transition-all ${systemSettings.isOpen ? 'left-11' : 'left-1'}`} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40 mb-3 px-2 block">Annuncio Live (Banner)</label>
                    <textarea 
                      value={systemSettings.announcement}
                      onChange={(e) => setSystemSettings({ ...systemSettings, announcement: e.target.value })}
                      placeholder="Esempio: Stasera Jazz dalle 20:30!"
                      className="w-full bg-gray-50 border border-gray-100 rounded-3xl p-6 text-sm focus:ring-2 focus:ring-brand-terracotta outline-none transition-all h-32"
                    />
                  </div>
                  <button 
                    onClick={async () => {
                      await updateDoc(doc(db, 'settings', 'restaurant'), { announcement: systemSettings.announcement });
                      toast.success("Annuncio salvato");
                    }}
                    className="w-full py-5 bg-brand-ink text-white rounded-3xl font-bold text-xs uppercase tracking-widest hover:bg-brand-terracotta transition-all"
                  >
                    Salva Annuncio
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
