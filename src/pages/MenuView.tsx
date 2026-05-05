import React, { useEffect, useState } from 'react';
import Fuse from 'fuse.js';
import { collection, getDocs, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Plus, Info, ChevronRight, Share2, Facebook, MessageCircle, Twitter, X, Maximize2, MessageSquare } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { toast } from 'sonner';
import { getWhatsAppLink, formatProductInquiryMessage } from '../lib/whatsapp';

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  popular?: boolean;
  isVegetarian?: boolean;
  isSpicy?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isAvailable?: boolean;
}

const DIETARY_FILTERS = [
  { id: 'vegetarian', name: 'Vegetariano', icon: '🌿' },
  { id: 'vegan', name: 'Vegano', icon: '🌱' },
  { id: 'glutenFree', name: 'Senza Glutine', icon: '🌾' },
  { id: 'spicy', name: 'Piccante', icon: '🌶️' },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop';

const MenuItemCard: React.FC<{
  item: MenuItem;
  onAdd: (qty: number) => void;
  onShare: (platform: string) => void;
  onOpen: () => void;
}> = ({ item, onAdd, onOpen, onShare }) => {
  const [quantity, setQuantity] = useState(1);
  const displayDescription = item.description || `Un delizioso piatto della tradizione napoletana: ${item.name}, preparato con ingredienti freschi e amore.`;
  const isAvailable = item.isAvailable !== false;

  return (
    <motion.div
      id={`item-${item.id}`}
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      layout
      className={`group flex flex-col sm:flex-row gap-6 p-6 items-start bg-white rounded-[40px] shadow-sm hover:shadow-xl transition-all duration-500 border border-brand-ink/5 relative overflow-hidden ${!isAvailable ? 'opacity-70 grayscale-[0.5]' : ''}`}
    >
      {!isAvailable && (
        <div className="absolute top-8 -right-12 bg-red-500 text-white px-12 py-1 transform rotate-45 z-10 text-[8px] uppercase tracking-widest font-bold shadow-lg">
          Terminato
        </div>
      )}
      <div className="relative w-full sm:w-40 aspect-square rounded-[32px] overflow-hidden flex-shrink-0 group/img cursor-pointer" onClick={onOpen}>
        <img 
          src={item.imageUrl || FALLBACK_IMAGE} 
          alt={`Foto di ${item.name}`} 
          referrerPolicy="no-referrer"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
        />
        <div className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
          <Maximize2 className="text-brand-cream w-6 h-6 transform translate-y-2 group-hover/img:translate-y-0 transition-transform" />
          <span className="text-brand-cream text-[8px] uppercase tracking-widest font-bold">Quick View</span>
        </div>
      </div>
      
      <div className="flex-grow py-2 w-full min-w-0">
        <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-2">
          <div className="flex flex-col gap-1 min-w-0">
            <h3 className="text-2xl font-serif text-brand-ink group-hover:text-brand-terracotta transition-colors cursor-pointer truncate" onClick={onOpen}>{item.name}</h3>
            <div className="flex flex-wrap gap-2">
              {item.popular && (
                <span className="text-[8px] uppercase tracking-[0.2em] w-fit px-2 py-0.5 border border-brand-terracotta text-brand-terracotta rounded-full font-bold whitespace-nowrap">
                  Popolare
                </span>
              )}
              {item.isGlutenFree && <span className="text-[8px] uppercase tracking-[0.2em] w-fit px-2 py-0.5 border border-brand-terracotta text-brand-terracotta rounded-full font-bold whitespace-nowrap">🌾 GF</span>}
            </div>
          </div>
          <span className="text-xl font-serif italic text-brand-terracotta whitespace-nowrap">€{item.price.toFixed(2)}</span>
        </div>
        
        <p className="text-sm text-brand-ink/60 mb-6 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {displayDescription}
        </p>

        <div className="flex flex-col 2xl:flex-row gap-6 items-start 2xl:items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onOpen}
              className="group/info flex items-center gap-2 text-brand-ink/40 hover:text-brand-ink transition-colors"
            >
              <Info className="w-4 h-4" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Dettagli</span>
            </button>

            <a 
              href={getWhatsAppLink(formatProductInquiryMessage(item))}
              target="_blank"
              rel="noreferrer"
              title="Chiedi su WhatsApp"
              className="text-brand-ink/20 hover:text-[#25D366] transition-colors p-1"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            <button 
              onClick={() => onShare('whatsapp')}
              title="Condividi"
              className="text-brand-ink/20 hover:text-brand-terracotta transition-colors p-1"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-brand-ink/5 rounded-full px-2 py-1">
              <button 
                disabled={!isAvailable}
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-8 h-8 flex items-center justify-center text-brand-ink/40 hover:text-brand-ink transition-colors disabled:opacity-20"
              >-</button>
              <span className="w-8 text-center text-xs font-bold text-brand-ink">{quantity}</span>
              <button 
                disabled={!isAvailable}
                onClick={() => setQuantity(q => q + 1)}
                className="w-8 h-8 flex items-center justify-center text-brand-ink/40 hover:text-brand-ink transition-colors disabled:opacity-20"
              >+</button>
            </div>

            <button 
              disabled={!isAvailable}
              onClick={() => onAdd(quantity)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-ink/10 ${
                isAvailable 
                  ? 'bg-brand-ink text-brand-cream hover:bg-brand-terracotta' 
                  : 'bg-gray-100 text-brand-ink/20 cursor-not-allowed shadow-none'
              }`}
            >
              <Plus className="w-4 h-4" /> {isAvailable ? 'Aggiungi' : 'Terminato'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export const MenuView = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDietaryFilters, setActiveDietaryFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [modalQuantity, setModalQuantity] = useState(1);
  const { addToCart, items: cartItems, total } = useCart();

  const handleAddToCart = (item: MenuItem, quantity: number = 1) => {
    for (let i = 0; i < quantity; i++) {
      addToCart(item);
    }
    toast.success(`${quantity}x ${item.name} aggiunti al carrello!`, {
      icon: <ShoppingBag className="w-4 h-4 text-brand-olive" />,
      className: "font-serif italic text-lg"
    });
  };

  const handleShare = (item: MenuItem, platform: string) => {
    const text = `🍽️ Eccellenza Napoletana da La Lazzara!\n\n✨ *${item.name.toUpperCase()}*\n\n📜 ${item.description || "Un'esperienza di gusto autentica."}\n\n💰 Prezzo: €${item.price.toFixed(2)}\n\n🖼️ Guarda l'immagine: ${item.imageUrl || FALLBACK_IMAGE}\n\n📍 Ordina qui:`;
    const url = `${window.location.origin}/menu#item-${item.id}`;
    let shareUrl = '';

    if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`;
    if (platform === 'whatsapp') shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`;
    if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    if (platform === 'copy') {
      navigator.clipboard.writeText(`${text} ${url}`);
      toast.success("Link copiato negli appunti!");
      return;
    }

    if (shareUrl) window.open(shareUrl, '_blank');
  };

  const toggleDietaryFilter = (id: string) => {
    setActiveDietaryFilters(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const categoriesQuery = query(collection(db, 'categories'), orderBy('order'));
    const unsubCats = onSnapshot(categoriesQuery, (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'categories');
    });

    const itemsQuery = query(collection(db, 'menuItems'));
    const unsubItems = onSnapshot(itemsQuery, (snap) => {
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'menuItems');
    });

    return () => {
      unsubCats();
      unsubItems();
    };
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<MenuItem[]>([]);

  const fuse = new Fuse(items, {
    keys: ['name', 'description'],
    threshold: 0.4,
    includeScore: true
  });

  const filteredItems = searchTerm 
    ? fuse.search(searchTerm).map(result => result.item)
    : items;

  const finalFilteredItems = filteredItems.filter(item => {
    const catMatch = activeCategory === 'all' || categories.find(c => c.slug === activeCategory)?.id === item.categoryId;
    
    const dietaryMatch = activeDietaryFilters.every(filter => {
      const f = filter.toLowerCase();
      if (f.includes('vegetarian')) return item.isVegetarian;
      if (f.includes('vegan')) return item.isVegan;
      if (f.includes('spicy')) return item.isSpicy;
      if (f.includes('gluten')) return item.isGlutenFree;
      return true;
    });

    return catMatch && dietaryMatch;
  });

  useEffect(() => {
    if (searchTerm.length > 1) {
      const results = fuse.search(searchTerm).slice(0, 5).map(r => r.item);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const getSuggestedItems = (currentItem: MenuItem) => {
    const otherCategories = categories.filter(c => c.id !== currentItem.categoryId);
    const suggested: MenuItem[] = [];
    
    otherCategories.slice(0, 3).forEach(cat => {
      const itemFromCat = items.find(i => i.categoryId === cat.id);
      if (itemFromCat) suggested.push(itemFromCat);
    });

    if (suggested.length < 3) {
      const remaining = items
        .filter(i => i.id !== currentItem.id && !suggested.find(s => s.id === i.id))
        .sort(() => 0.5 - Math.random());
      suggested.push(...remaining.slice(0, 3 - suggested.length));
    }

    return suggested.slice(0, 3);
  };

  if (loading) {
    return (
      <div className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center text-center">
         <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-terracotta/20 border-t-brand-terracotta rounded-full animate-spin" />
          <p className="text-xs uppercase tracking-widest text-brand-ink/40 italic font-bold">Un attimo di pazienza, stiamo preparando la nostra carta...</p>
        </div>
      </div>
    );
  }

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
            src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=2070&auto=format&fit=crop" 
            alt="Authentic Neapolitan Pizza" 
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
            Delizie Napoletane
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-6xl md:text-8xl text-brand-cream italic font-serif"
          >
            La Nostra Carta
          </motion.h1>
          <motion.div 
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="h-px bg-brand-terracotta/30 w-32 mx-auto mt-8"
          />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pb-20">

        <div className="max-w-xl mx-auto mb-16 relative">
          <input 
            type="text"
            placeholder="Cerca un piatto o un ingrediente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-brand-ink/10 rounded-full px-8 py-4 text-sm focus:outline-none focus:border-brand-terracotta transition-all shadow-sm italic"
          />
          <Plus className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-ink/20 transform rotate-45" />
          
          <AnimatePresence>
            {suggestions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 bg-white mt-2 rounded-[32px] shadow-2xl z-[50] overflow-hidden border border-brand-ink/5"
              >
                {suggestions.map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setSelectedItem(item); setSearchTerm(''); }}
                    className="w-full flex items-center gap-4 p-4 hover:bg-brand-cream/50 transition-colors text-left border-b border-brand-ink/5 last:border-0"
                  >
                    <img src={item.imageUrl || FALLBACK_IMAGE} className="w-12 h-12 rounded-xl object-cover" alt="" />
                    <div>
                      <p className="font-serif italic text-brand-ink">{item.name}</p>
                      <p className="text-[10px] uppercase tracking-widest text-brand-terracotta">€{item.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-8 px-4">
          {DIETARY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => toggleDietaryFilter(filter.id)}
              className={`flex items-center gap-2 px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-display transition-all border ${
                activeDietaryFilters.includes(filter.id)
                  ? 'bg-brand-terracotta border-brand-terracotta text-brand-cream'
                  : 'bg-white border-brand-ink/10 text-brand-ink hover:border-brand-terracotta'
              }`}
            >
              <span>{filter.icon}</span> {filter.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-20 px-4">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-display transition-all ${
              activeCategory === 'all' 
                ? 'bg-brand-ink text-brand-cream shadow-xl shadow-brand-ink/20' 
                : 'bg-brand-ink/5 text-brand-ink hover:bg-brand-ink/10'
            }`}
          >
            Tutti i piatti
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-8 py-3 rounded-full text-[10px] uppercase tracking-widest font-display transition-all ${
                activeCategory === cat.slug 
                  ? 'bg-brand-ink text-brand-cream shadow-xl shadow-brand-ink/20' 
                  : 'bg-brand-ink/5 text-brand-ink hover:bg-brand-ink/10'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <motion.div layout className="space-y-32">
          <AnimatePresence mode="popLayout">
            {(activeCategory === 'all' ? categories : categories.filter(c => c.slug === activeCategory)).map((cat) => {
              const catItems = finalFilteredItems.filter(item => item.categoryId === cat.id);
              if (catItems.length === 0) return null;

              return (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-10%" }}
                  className="space-y-12"
                >
                  <div className="flex items-center gap-6 px-4">
                    <h2 className="text-4xl font-serif italic text-brand-ink">{cat.name}</h2>
                    <div className="h-px bg-brand-ink/10 flex-grow" />
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-8 px-4">
                    {catItems.map((item) => (
                      <MenuItemCard 
                        key={item.id} 
                        item={item} 
                        onAdd={(qty) => handleAddToCart(item, qty)}
                        onShare={(p) => handleShare(item, p)}
                        onOpen={() => setSelectedItem(item)}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>

        {finalFilteredItems.length === 0 && (
          <div className="py-24 text-center">
            <ShoppingBag className="w-16 h-16 text-brand-ink/5 mx-auto mb-6" />
            <p className="text-brand-ink/40 font-display text-[10px] uppercase tracking-[0.2em]">Nessun piatto trovato con questi filtri.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { setSelectedItem(null); setModalQuantity(1); }}
            className="fixed inset-0 bg-brand-ink/95 z-[100] flex items-center justify-center p-4 cursor-pointer overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-brand-cream w-full max-w-5xl rounded-[40px] overflow-hidden shadow-2xl relative flex flex-col md:flex-row cursor-default my-auto"
            >
            <button 
              onClick={() => { setSelectedItem(null); setModalQuantity(1); }}
              className="absolute top-6 right-6 text-brand-ink/40 hover:text-brand-ink transition-colors p-2 z-10"
            >
              <X className="w-8 h-8" />
            </button>

            <div className="absolute top-6 left-6 z-10 flex gap-2">
              <button 
                onClick={() => handleShare(selectedItem, 'whatsapp')}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-brand-cream hover:bg-[#25D366] transition-all"
                title="Condividi su WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleShare(selectedItem, 'facebook')}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-brand-cream hover:bg-[#1877F2] transition-all"
                title="Condividi su Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button 
                onClick={() => handleShare(selectedItem, 'copy')}
                className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-brand-cream hover:bg-brand-terracotta transition-all"
                title="Copia Link"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

              <div className="w-full md:w-1/2 min-h-[400px] md:min-h-0 bg-brand-ink flex-shrink-0">
                <img 
                  src={selectedItem.imageUrl || FALLBACK_IMAGE} 
                  alt={selectedItem.name} 
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 md:p-12 w-full md:w-1/2 flex flex-col max-h-[90vh] overflow-y-auto">
                <div className="mb-6">
                  <span className="text-brand-terracotta font-display text-[10px] uppercase tracking-widest mb-2 block font-bold">Dettagli Piatto</span>
                  <h2 className="text-5xl font-serif italic text-brand-ink mb-4 leading-tight">{selectedItem.name}</h2>
                  <p className="text-brand-ink/60 leading-relaxed text-lg italic mb-6">
                    {selectedItem.description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {selectedItem.isVegetarian && <span title="Vegetariano" className="text-brand-olive text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-brand-olive/10 rounded-full flex items-center gap-2">🌿 Vegetariano</span>}
                    {selectedItem.isVegan && <span title="Vegano" className="text-brand-olive text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-brand-olive/10 rounded-full flex items-center gap-2">🌱 Vegano</span>}
                    {selectedItem.isSpicy && <span title="Piccante" className="text-red-500 text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-red-500/10 rounded-full flex items-center gap-2">🌶️ Piccante</span>}
                    {selectedItem.isGlutenFree && <span title="Gluten Free" className="text-brand-terracotta text-[10px] uppercase tracking-widest font-bold px-3 py-1 bg-brand-terracotta/10 rounded-full flex items-center gap-2">🌾 GF</span>}
                  </div>
                </div>

                <div className="space-y-6 pt-6 border-t border-brand-ink/10 mb-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <span className="text-3xl font-serif italic text-brand-terracotta">€{selectedItem.price.toFixed(2)}</span>
                    <div className="flex flex-wrap items-center gap-6">
                      <div className="flex items-center bg-brand-ink/5 rounded-full px-2 py-1">
                        <button 
                          onClick={() => setModalQuantity(q => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center text-brand-ink/40 hover:text-brand-ink transition-colors text-xl"
                        >-</button>
                        <span className="w-10 text-center font-bold text-brand-ink">{modalQuantity}</span>
                        <button 
                          onClick={() => setModalQuantity(q => q + 1)}
                          className="w-10 h-10 flex items-center justify-center text-brand-ink/40 hover:text-brand-ink transition-colors text-xl"
                        >+</button>
                      </div>

                      <button 
                        onClick={() => { handleAddToCart(selectedItem, modalQuantity); setSelectedItem(null); setModalQuantity(1); }}
                        className="btn-primary px-8 py-4 shadow-xl shadow-brand-terracotta/20 flex items-center gap-3"
                      >
                        <ShoppingBag className="w-5 h-5" />
                        Aggiungi al Carrello
                      </button>

                      <a 
                        href={getWhatsAppLink(formatProductInquiryMessage(selectedItem))}
                        target="_blank"
                        rel="noreferrer"
                        className="border border-[#25D366] text-[#25D366] px-8 py-4 rounded-full text-[10px] uppercase tracking-widest font-bold flex items-center gap-3 hover:bg-[#25D366] hover:text-white transition-all shadow-xl shadow-green-500/5 group"
                      >
                        <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Chiedi su WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs uppercase tracking-[0.3em] text-brand-ink mb-6 font-bold flex items-center gap-4">
                    Pairings Consigliati
                    <div className="h-px bg-brand-ink/10 flex-grow" />
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {getSuggestedItems(selectedItem).map((item) => (
                      <div 
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-white rounded-2xl border border-brand-ink/5 hover:border-brand-terracotta/30 transition-all group/sugg cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img 
                            src={item.imageUrl || FALLBACK_IMAGE} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                            className="w-full h-full object-cover transition-transform group-hover/sugg:scale-110" 
                          />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-serif text-brand-ink">{item.name}</p>
                          <p className="text-xs text-brand-terracotta italic">€{item.price.toFixed(2)}</p>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleAddToCart(item); }}
                          className="bg-brand-ink/5 text-brand-ink p-2 rounded-full hover:bg-brand-terracotta hover:text-brand-cream transition-all"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {cartItems.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 z-50 px-6 md:hidden"
          >
            <Link 
              to="/cart" 
              className="bg-brand-ink text-brand-cream w-full py-5 rounded-full flex items-center justify-between px-10 shadow-2xl shadow-brand-ink/40 border border-brand-cream/10 active:scale-95 transition-transform"
            >
              <div className="flex items-center gap-4">
                <div className="bg-brand-terracotta w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shadow-lg">
                  {cartItems.length}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Vedi Ordine</span>
                  <span className="text-[9px] text-brand-cream/40 uppercase tracking-widest">Procedi al Carrello</span>
                </div>
              </div>
              <span className="font-serif italic text-xl">€{total.toFixed(2)}</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
