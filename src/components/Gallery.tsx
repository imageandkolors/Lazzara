import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

const images = [
  {
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop',
    alt: 'Lo chef prepara l’impasto per la pizza napoletana a mano'
  },
  {
    url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop',
    alt: 'Una pizza appena sfornata dal nostro forno a legna tradizionale'
  },
  {
    url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=2070&auto=format&fit=crop',
    alt: 'Ingredienti freschi: pomodori San Marzano e basilico profumato'
  },
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop',
    alt: 'L’atmosfera calda e accogliente della sala de La Lazzara'
  },
  {
    url: 'https://images.unsplash.com/photo-1574126391957-f1406563768e?q=80&w=1976&auto=format&fit=crop',
    alt: 'Pizza fritta tradizionale, un classico dello street food napoletano'
  },
  {
    url: 'https://images.unsplash.com/photo-1579751626657-72bc17010498?q=80&w=2069&auto=format&fit=crop',
    alt: 'I nostri ziti alla Genovese, cotti lentamente come vuole la tradizione'
  },
  {
    url: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?q=80&w=2076&auto=format&fit=crop',
    alt: 'Un assaggio della nostra mozzarella di bufala campana DOP'
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop';

export const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const galleryRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const updateConstraints = () => {
      if (galleryRef.current && contentRef.current) {
        const containerWidth = galleryRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setConstraints({ left: -(contentWidth - containerWidth), right: 0 });
      }
    };

    updateConstraints();
    const timeout = setTimeout(updateConstraints, 100);
    window.addEventListener('resize', updateConstraints);
    return () => {
      window.removeEventListener('resize', updateConstraints);
      clearTimeout(timeout);
    };
  }, []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutoPlaying && selectedImage === null) {
      interval = setInterval(() => {
        nextImage();
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, selectedImage]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImage === null) return;
      if (e.key === 'ArrowRight') setSelectedImage((curr) => (curr !== null ? (curr + 1) % images.length : 0));
      if (e.key === 'ArrowLeft') setSelectedImage((curr) => (curr !== null ? (curr - 1 + images.length) % images.length : 0));
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  return (
    <section id="gallery" className="py-32 bg-brand-ink relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-20 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-xl">
            <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.4em] mb-4 block font-bold">L'Atmosfera</span>
            <h2 className="text-6xl md:text-7xl font-serif italic text-brand-cream leading-tight">Scatti di <br />Passione Vera.</h2>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => { prevImage(); setIsAutoPlaying(false); }} 
              className="w-14 h-14 rounded-full border border-brand-cream/10 flex items-center justify-center text-brand-cream hover:bg-brand-cream hover:text-brand-ink transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => { nextImage(); setIsAutoPlaying(false); }} 
              className="w-14 h-14 rounded-full border border-brand-cream/10 flex items-center justify-center text-brand-cream hover:bg-brand-cream hover:text-brand-ink transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Carousel Slider */}
        <div className="relative overflow-hidden" ref={galleryRef}>
          <motion.div 
            ref={contentRef}
            drag="x"
            dragConstraints={constraints}
            dragElastic={0.1}
            className="flex gap-8 cursor-grab active:cursor-grabbing pb-12"
            style={{ width: "fit-content" }}
          >
            {images.map((img, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedImage(idx)}
                className={`flex-shrink-0 w-[300px] md:w-[400px] aspect-[4/5] rounded-[40px] overflow-hidden cursor-pointer relative group transition-opacity duration-500`}
              >
                <motion.img 
                  src={img.url} 
                  alt={img.alt} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                  whileHover={{ scale: 1.1 }}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                />
                <div className="absolute inset-0 bg-brand-ink/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                    <Maximize2 className="w-6 h-6" />
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          <div className="mt-12 flex items-center justify-center gap-4 text-[8px] uppercase tracking-[0.3em] font-bold text-white/10">
            <span>Trascina o usa le frecce</span>
            <div className="w-12 h-px bg-white/10" />
          </div>
        </div>
      </div>

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 bg-brand-ink/95 z-[200] flex items-center justify-center p-4 md:p-12 cursor-pointer"
          >
            <button 
              onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
              className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors p-4 z-[210]"
            >
              <X className="w-10 h-10" />
            </button>
            
            <div className="relative w-full max-w-6xl aspect-video md:aspect-[16/9] cursor-default" onClick={(e) => e.stopPropagation()}>
              <motion.img 
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[selectedImage].url} 
                alt={images[selectedImage].alt}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
              
              <div className="absolute inset-y-0 -left-4 md:-left-20 flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage - 1 + images.length) % images.length); }}
                  className="p-4 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-12 h-12" />
                </button>
              </div>
              
              <div className="absolute inset-y-0 -right-4 md:-right-20 flex items-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedImage((selectedImage + 1) % images.length); }}
                  className="p-4 text-white/40 hover:text-white transition-colors"
                >
                  <ChevronRight className="w-12 h-12" />
                </button>
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white/40 font-display text-xs tracking-widest">
              {selectedImage + 1} / {images.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
