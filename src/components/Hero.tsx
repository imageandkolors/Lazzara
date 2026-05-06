import { motion, useScroll, useTransform, AnimatePresence } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useRef, useState, useEffect } from 'react';
import { useUI } from '../context/UIContext';

export const Hero = () => {
  const { openReservation } = useUI();
  const [currentSlide, setCurrentSlide] = useState(0);
  const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop";
  const slides = [
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=2070&auto=format&fit=crop"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scrollScale = useTransform(scrollYProgress, [0, 1], [1, 1.2]);

  return (
    <section ref={ref} className="relative h-screen flex items-center overflow-hidden bg-brand-ink">
      {/* Background Image Overlay with Auto-slide */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1 }}
            animate={{ 
              opacity: 0.8, 
              transition: { duration: 1.5 }
            }}
            exit={{ opacity: 0 }}
            style={{ y }}
            className="absolute inset-0 h-[120%] -top-[10%]"
          >
            <motion.img
              style={{ scale: scrollScale }}
              src={slides[currentSlide]}
              alt="Autentica Pizza Napoletana"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/40 to-transparent z-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          style={{ opacity }}
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block text-brand-terracotta font-display text-xs uppercase tracking-[0.3em] mb-6 font-bold"
          >
            Dal 1985 • Napoli Centrale
          </motion.span>
          
          <h1 className="text-5xl sm:text-6xl md:text-8xl text-brand-cream leading-[0.9] mb-8 font-serif italic">
            L'Arte della <br />
            <span className="text-brand-terracotta not-italic">Vera Pizza</span>
          </h1>
          
          <p className="text-brand-cream/80 text-lg md:text-xl font-sans mb-10 max-w-lg leading-relaxed italic">
            Tradizione Napoletana per Palati Sopraffini
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <Link to="/menu" className="btn-primary flex items-center justify-center gap-3 px-10 py-5">
              Sfoglia il Menu <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={openReservation}
              className="btn-secondary !border-brand-cream !text-brand-cream hover:bg-brand-cream hover:text-brand-ink px-10 py-5 text-center font-display uppercase tracking-widest text-[10px] font-bold"
            >
              Prenota un Tavolo
            </button>
          </div>
        </motion.div>
      </div>

      {/* Decorative vertical text */}
      <div className="absolute right-8 bottom-24 hidden lg:block overflow-hidden">
        <motion.div
          animate={{ y: [0, -100] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="writing-mode-vertical text-[10vw] font-serif italic text-brand-cream/5 select-none whitespace-nowrap"
          style={{ writingMode: 'vertical-rl' }}
        >
          TRATTORIA PIZZERIA LA LAZZARA • NAPOLI CENTRALE • PASSIONE VERA • 
        </motion.div>
      </div>
    </section>
  );
};
