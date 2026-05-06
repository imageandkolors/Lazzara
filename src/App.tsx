import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MenuView } from './pages/MenuView';
import { Reservations } from './pages/Reservations';
import { CartView } from './pages/CartView';
import { OrderTracking } from './pages/OrderTracking';
import { Contact } from './pages/Contact';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { CartProvider } from './hooks/useCart';
import { AnimatePresence, motion } from 'motion/react';

const Placeholder = ({ name }: { name: string }) => (
  <div className="pt-40 pb-20 px-4 min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-8xl font-serif mb-8 italic opacity-20">{name}</h1>
      <p className="text-brand-ink/40 tracking-[0.4em] uppercase font-display text-[10px]">L'esperienza sta arrivando. Riapriremo presto.</p>
    </div>
  </div>
);

import { Toaster } from 'sonner';
import { Profile } from './pages/Profile';

import { UIProvider } from './context/UIContext';
import { ScrollToTop } from './components/ScrollToTop';
import { AbandonedCartNudge } from './components/AbandonedCartNudge';
import { AnnouncementBanner } from './components/AnnouncementBanner';

function App() {
  const location = useLocation();

  return (
    <UIProvider>
      <CartProvider>
        <ScrollToTop />
        <AbandonedCartNudge />
        <div className="min-h-screen flex flex-col selection:bg-brand-terracotta selection:text-brand-cream">
          <Toaster position="bottom-right" expand={false} richColors />
          <AnnouncementBanner />
          <Navbar />
          <main className="flex-grow">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/menu" element={<MenuView />} />
                  <Route path="/reservations" element={<Reservations />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/cart" element={<CartView />} />
                  <Route path="/tracking/:orderId" element={<OrderTracking />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </UIProvider>
  );
}

export default App;
