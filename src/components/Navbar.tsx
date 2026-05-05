import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ShoppingBag, UtensilsCrossed, User, Calendar } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import { ReservationSidebar } from './ReservationSidebar';

import { useUI } from '../context/UIContext';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { items } = useCart();
  const location = useLocation();
  const { isReservationOpen, openReservation, closeReservation } = useUI();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/menu' },
    { name: 'Contatti', path: '/contact' },
  ];

  return (
    <>
      <nav className={`fixed w-full z-[60] transition-all duration-500 ${
        isScrolled 
          ? 'bg-brand-cream shadow-xl shadow-brand-ink/5 py-0' 
          : 'bg-transparent backdrop-blur-0 border-transparent py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <UtensilsCrossed className={`w-8 h-8 transition-colors duration-500 ${isScrolled ? 'text-brand-terracotta' : 'text-brand-cream'}`} />
              <span className={`text-2xl font-serif font-bold tracking-tight transition-colors duration-500 ${isScrolled ? 'text-brand-ink' : 'text-brand-cream'}`}>
                LA LAZZARA
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative text-[10px] uppercase tracking-[0.2em] font-display transition-colors duration-500 hover:text-brand-terracotta font-bold ${
                    isScrolled 
                      ? (location.pathname === link.path ? 'text-brand-terracotta' : 'text-brand-ink')
                      : (location.pathname === link.path ? 'text-brand-terracotta' : 'text-brand-cream')
                  }`}
                >
                  {link.name}
                  {location.pathname === link.path && (
                    <motion.div 
                      layoutId="nav-dot"
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-brand-terracotta rounded-full"
                    />
                  )}
                </Link>
              ))}
              
              <div className={`flex items-center space-x-6 border-l pl-8 transition-colors duration-500 ${isScrolled ? 'border-brand-ink/10' : 'border-brand-cream/20'}`}>
                <button 
                  onClick={openReservation}
                  className="flex items-center gap-2 text-[9px] uppercase tracking-[0.2em] font-bold bg-brand-terracotta text-brand-cream px-6 py-3 rounded-full hover:bg-brand-ink transition-all shadow-lg shadow-brand-terracotta/20 active:scale-95"
                >
                  <Calendar className="w-3 h-3" /> Prenota un Tavolo
                </button>

                <Link to="/cart" className={`relative group p-2 transition-colors duration-500 ${isScrolled ? 'text-brand-ink' : 'text-brand-cream'}`}>
                  <ShoppingBag className="w-5 h-5 group-hover:text-brand-terracotta transition-colors" />
                  <AnimatePresence mode="wait">
                    {items.length > 0 && (
                      <motion.span 
                        key={items.length}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1.2, opacity: 1 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 300 }}
                        onAnimationComplete={() => {}}
                        className="absolute -top-1 -right-1 bg-brand-terracotta text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg shadow-brand-terracotta/40"
                      >
                        <motion.span
                          animate={{ scale: [1.2, 1] }}
                          transition={{ duration: 0.2 }}
                        >
                          {items.length}
                        </motion.span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>

                {user ? (
                  <Link 
                    to="/profile"
                    className="flex items-center gap-2 group"
                    title={`Profilo: ${user.email}`}
                  >
                    <img src={user.photoURL} alt="" className="w-9 h-9 rounded-full border-2 border-brand-cream group-hover:border-brand-terracotta transition-colors shadow-lg" />
                  </Link>
                ) : (
                  <button 
                    onClick={handleLogin}
                    className={`flex items-center gap-2 group p-2 transition-colors duration-500 hover:text-brand-terracotta ${isScrolled ? 'text-brand-ink' : 'text-brand-cream'}`}
                    title="Accedi"
                  >
                    <User className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <Link to="/cart" className={`relative p-2 transition-colors duration-500 ${isScrolled ? 'text-brand-ink' : 'text-brand-cream'}`}>
                <ShoppingBag className="w-5 h-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-terracotta text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Link>
              <button 
                onClick={() => setIsOpen(!isOpen)} 
                className={`transition-colors duration-500 ${isScrolled ? 'text-brand-ink' : 'text-brand-cream'}`}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-brand-cream border-t border-brand-ink/5 overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-4 text-base font-display uppercase tracking-widest text-brand-ink hover:bg-brand-ink/5"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      
      <ReservationSidebar isOpen={isReservationOpen} onClose={closeReservation} />
    </>
  );
};
