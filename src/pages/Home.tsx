import React, { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Gallery } from '../components/Gallery';
import { useUI } from '../context/UIContext';

interface Specialty {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

const testimonials = [
  {
    text: "La vera Napoli nel cuore di Piazza Mercato. La Genovese è spaziale, sembra di stare a casa di mia nonna.",
    author: "Luca Esposito",
    date: "Google Review"
  },
  {
    text: "Pizza fritta indimenticabile e personale gentilissimo. Un'atmosfera autentica che non si trova più facilmente.",
    author: "Sarah J.",
    date: "TripAdvisor"
  },
  {
    text: "Ingredienti freschissimi e sapori che ti riportano alle radici. La Lazzara è un tesoro nascosto.",
    author: "Marco R.",
    date: "A tavola con Napoli"
  }
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=2070&auto=format&fit=crop';

const MenuSlider: React.FC<{ items: Specialty[] }> = ({ items }) => {
  const [itemsPerView, setItemsPerView] = useState(1);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [constraints, setConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setItemsPerView(3);
      else if (window.innerWidth >= 768) setItemsPerView(2);
      else setItemsPerView(1);

      if (containerRef.current && contentRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const contentWidth = contentRef.current.scrollWidth;
        setConstraints({ left: -(contentWidth - containerWidth), right: 0 });
      }
    };
    
    handleResize();
    // Use a small timeout to ensure layout is complete
    const timeout = setTimeout(handleResize, 100);
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeout);
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <div className="relative py-10 overflow-hidden" ref={containerRef}>
      <motion.div 
        ref={contentRef}
        drag="x"
        dragConstraints={constraints}
        dragElastic={0.1}
        className="flex gap-8 cursor-grab active:cursor-grabbing px-4"
        style={{ width: "fit-content" }}
      >
        {items.map((item) => (
          <motion.div 
            key={item.id}
            className="w-[300px] md:w-[350px] lg:w-[400px] flex-shrink-0"
          >
            <div className="group bg-white rounded-[40px] overflow-hidden shadow-xl shadow-brand-ink/5 border border-brand-ink/5 h-full flex flex-col transition-all duration-500 hover:shadow-2xl">
              <div className="h-64 overflow-hidden relative">
                <img 
                  src={item.imageUrl || FALLBACK_IMAGE} 
                  alt={item.name} 
                  referrerPolicy="no-referrer"
                  onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                />
                <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-bold uppercase tracking-widest">
                  Specialità
                </div>
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-serif italic text-brand-ink group-hover:text-brand-terracotta transition-colors">{item.name}</h3>
                  <span className="text-brand-terracotta font-serif text-xl italic">€{item.price.toFixed(2)}</span>
                </div>
                <p className="text-brand-ink/60 text-sm leading-relaxed mb-8 h-12 line-clamp-2">{item.description}</p>
                <div className="mt-auto">
                  <Link to="/menu" className="text-[10px] uppercase tracking-widest font-bold text-brand-terracotta border-b border-brand-terracotta pb-1 hover:text-brand-ink hover:border-brand-ink transition-colors translate-y-0 group-hover:-translate-y-1 block w-fit">Ordina Ora</Link>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <div className="mt-12 flex items-center justify-center gap-4 text-[8px] uppercase tracking-[0.3em] font-bold text-brand-ink/20">
        <span>Scorri per esplorare</span>
        <div className="w-12 h-px bg-brand-ink/10" />
      </div>
    </div>
  );
};

const TestimonialsSlider = () => {
  const [index, setIndex] = React.useState(0);
  const containerRef = React.useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section ref={containerRef} className="relative py-48 overflow-hidden">
      <motion.div 
        style={{ y }}
        className="absolute inset-0 z-0"
      >
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
                className="w-full h-[120%] object-cover brightness-50"
                alt="Parallax background"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      </motion.div>

      <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
        <Quote className="w-12 h-12 text-brand-terracotta mx-auto mb-12 opacity-80" />
        <div className="relative h-64 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "anticipate" }}
              className="absolute inset-0 flex flex-col justify-center"
            >
              <p className="text-xl md:text-2xl font-serif italic text-brand-cream leading-relaxed mb-8 px-4 md:px-12">
                "{testimonials[index].text}"
              </p>
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-terracotta mb-1">{testimonials[index].author}</span>
                <span className="text-[8px] uppercase tracking-widest font-bold text-brand-cream/40">{testimonials[index].date}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};

const homeFeatures = [
  {
    title: "Maestria del Forno a Legna",
    description: "Il nostro forno è il cuore del ristorante, raggiunge i 450°C per creare quel cornicione perfetto a macchia di leopardo.",
    icon: <Star className="w-6 h-6 text-brand-terracotta" />
  },
  {
    title: "Tradizione del Lievito Madre",
    description: "Utilizziamo un lento processo di lievitazione di 48 ore con il nostro lievito madre proprietario per un sapore e una digeribilità unici.",
    icon: <Star className="w-6 h-6 text-brand-terracotta" />
  },
  {
    title: "Eccellenze Campane",
    description: "Pomodori San Marzano DOP e Mozzarella di Bufala consegnati freschi ogni mattina direttamente dal casertano.",
    icon: <Star className="w-6 h-6 text-brand-terracotta" />
  }
];

const CountUp = ({ end, duration = 2 }: { end: number, duration?: number }) => {
  const [count, setCount] = React.useState(0);
  const nodeRef = React.useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  React.useEffect(() => {
    if (isInView) {
      let start = 0;
      const endVal = end;
      if (start === endVal) return;

      let totalMilisecondsStep = (duration * 1000) / endVal;
      if (totalMilisecondsStep < 10) totalMilisecondsStep = 10;

      const timer = setInterval(() => {
        start += Math.ceil(endVal / (duration * 100)); // Faster increment
        if (start >= endVal) {
          setCount(endVal);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, 20);

      return () => clearInterval(timer);
    }
  }, [isInView, end, duration]);

  return <span ref={nodeRef}>{count}</span>;
};

const NewsTicker = () => {
  const items = [
    { text: "La Lazzara", icon: "✦" },
    { text: "Tradizione Napoletana per Palati Sopraffini", icon: "" },
    { text: "Dal Cuore di Napoli", icon: "✦" },
    { text: "Ingredienti DOP · Ricette di Famiglia", icon: "" }
  ];

  return (
    <div className="bg-brand-terracotta py-4 border-y border-brand-cream/10 overflow-hidden whitespace-nowrap">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="inline-flex gap-12"
      >
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex gap-12 items-center">
            {items.map((item, idx) => (
              <span key={idx} className="text-brand-cream font-display uppercase tracking-[0.2em] text-xs font-bold flex items-center gap-4">
                {item.text} {item.icon && <span className="text-brand-ink">{item.icon}</span>}
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

export const Home = () => {
  const { openReservation } = useUI();
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.05]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  useEffect(() => {
    const fetchSpecialties = async () => {
      try {
        const q = query(collection(db, 'menuItems'), where('popular', '==', true), limit(8));
        const snap = await getDocs(q);
        let items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Specialty));
        
        if (items.length === 0) {
          const fallbackSnap = await getDocs(query(collection(db, 'menuItems'), limit(8)));
          items = fallbackSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Specialty));
        }
        
        setSpecialties(items);
      } catch (err) {
        console.error("Error fetching specialties:", err);
      }
    };
    fetchSpecialties();
  }, []);

  return (
    <div className="flex flex-col bg-brand-cream overflow-hidden">
      <Hero />
      <NewsTicker />

      {/* About / La Storia */}
      <section id="storia" className="py-32 md:py-48 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              className="relative"
            >
              <img 
                src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1974&auto=format&fit=crop" 
                alt="La Lazzara History" 
                className="rounded-[60px] shadow-2xl transition-all duration-1000"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
              <div className="absolute -bottom-8 -right-4 sm:-bottom-12 sm:-right-12 bg-brand-terracotta p-8 sm:p-12 rounded-full text-brand-cream text-center shadow-2xl">
                <p className="text-3xl sm:text-5xl font-serif italic mb-1"><CountUp end={50} />+</p>
                <p className="text-[8px] sm:text-[10px] uppercase tracking-widest font-bold opacity-60">Anni di Storia</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              className="space-y-8"
            >
              <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.4em] block font-bold">La Nostra Storia</span>
              <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif italic leading-tight text-brand-ink">Tradizione <br />Napoletana.</h2>
              <div className="text-brand-terracotta text-2xl">✦</div>
              <p className="text-brand-ink/60 text-lg leading-relaxed font-sans">
                La vera cucina partenopea per palati sopraffini. Siamo un ristorante a conduzione familiare che offre porzioni generose e una cucina tipica partenopea: saporita, ricca di ingredienti e colorata.
              </p>
              <p className="text-brand-ink/60 text-lg leading-relaxed font-sans">
                Dal piennolo vesuviano al provolone del Monaco fino alla mozzarella di bufala campana: noi di La Lazzara vogliamo enfatizzare tutti i sapori che rendono grande questa regione nel mondo. Seduti ai tavolini esterni non distanti dal porto di Napoli, potrete assaporare tutto il meglio che la terra campana offre, con i suoi sapori forti mischiati a quelli delicati del mare.
              </p>
              <div className="flex items-center gap-12 pt-8 border-t border-brand-ink/10">
                <div>
                  <p className="text-4xl font-serif italic text-brand-terracotta"><CountUp end={6700} duration={3} />+</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Recensioni Google</p>
                </div>
                <div>
                  <p className="text-4xl font-serif italic text-brand-terracotta">4.5</p>
                  <div className="flex gap-1 text-[#FFD700] my-1">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                  </div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-brand-ink/40">Rating Medio</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Menu Slider */}
      <section id="menu" className="py-32 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-20 px-4">
            <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.4em] mb-4 block font-bold">Il Nostro Menu</span>
            <h2 className="text-5xl sm:text-6xl md:text-7xl font-serif italic text-brand-ink">Le Specialità della Casa</h2>
          </header>
          
          <MenuSlider items={specialties} />
          
          <div className="text-center mt-16 font-display">
            <Link to="/menu" className="btn-primary px-12 py-5">Scopri il Menu Completo</Link>
          </div>
        </div>
      </section>

      <Gallery />

      {/* I Nostri Segreti Section */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-brand-terracotta font-display text-[10px] uppercase tracking-[0.5em] font-bold block mb-4"
            >
              Qualità Senza Compromessi
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-7xl font-serif italic text-brand-ink"
            >
              I Segreti della Lazzara
            </motion.h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                title: "Farina di Tipo 0",
                desc: "Selezioniamo solo grani antichi macinati a pietra per una digeribilità superiore e una fragranza che profuma di casa.",
                img: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=1000&auto=format&fit=crop"
              },
              {
                title: "Lievitazione 48h",
                desc: "Nulla è lasciato al caso. Il nostro impasto riposa 48 ore a temperatura controllata per un cornicione alveolato e leggero.",
                img: "https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=1000&auto=format&fit=crop"
              },
              {
                title: "Pomodoro del Piennolo",
                desc: "Usiamo esclusivamente il meglio del territorio: dai pomodori San Marzano DOP ai frutti del Vesuvio essiccati al sole.",
                img: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=1000&auto=format&fit=crop"
              }
            ].map((secret, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="group"
              >
                <div className="aspect-[4/5] rounded-[40px] overflow-hidden mb-8 shadow-2xl relative bg-brand-ink/5">
                  <img 
                    src={secret.img} 
                    alt={secret.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
                  />
                  <div className="absolute inset-0 bg-brand-ink/20 group-hover:bg-brand-ink/0 transition-colors duration-500" />
                </div>
                <h3 className="text-3xl font-serif italic mb-4 text-brand-ink">{secret.title}</h3>
                <p className="text-brand-ink/60 leading-relaxed text-sm">{secret.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Parallax */}
      <TestimonialsSlider />

      {/* Reservation CTA */}
      <section className="py-32 bg-brand-terracotta relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            className="space-y-8"
          >
            <h2 className="text-5xl sm:text-6xl md:text-8xl font-serif italic text-brand-cream leading-tight">Vivi l'Esperienza <br />La Lazzara</h2>
            <p className="text-brand-cream/80 text-xl max-w-xl mx-auto">Prenota il tuo tavolo oggi stesso e lasciati trasportare nel cuore culinario di Napoli.</p>
            <button 
              onClick={openReservation}
              className="mt-8 bg-brand-cream text-brand-terracotta px-12 py-6 rounded-full font-display uppercase tracking-widest text-sm font-bold hover:bg-brand-ink hover:text-brand-cream transition-all shadow-2xl"
            >
              Prenota Ora un Tavolo
            </button>
          </motion.div>
        </div>
      </section>

      {/* Philosophy (already modified but keeping structure) */}
      <section className="py-40 bg-brand-ink text-brand-cream relative">
        {/* Existing philosophy content remains same or similar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
            <motion.div 
              style={{ scale }}
              className="relative aspect-[4/5] lg:aspect-square"
            >
              <img
                src="https://images.unsplash.com/photo-1544333323-537a3910e250?q=80&w=1974&auto=format&fit=crop"
                alt="Involtini Primavera Colorati"
                className="w-full h-full rounded-[60px] object-cover grayscale-0 brightness-100"
                referrerPolicy="no-referrer"
                onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="absolute -bottom-16 -right-16 bg-brand-terracotta p-12 lg:p-16 rounded-full hidden md:flex flex-col items-center justify-center text-center shadow-2xl"
              >
                <span className="text-brand-cream font-serif italic text-6xl block mb-2"><CountUp end={35} />+</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-brand-cream/60 font-bold">Anni di Storia</span>
              </motion.div>
            </motion.div>
            
            <div className="relative">
              <span className="text-brand-terracotta font-display text-xs uppercase tracking-[0.3em] mb-6 block font-bold underline underline-offset-8">La Nostra Filosofia</span>
              <h2 className="text-5xl sm:text-6xl md:text-8xl mb-12 font-serif leading-[0.9] italic">Oltre i Semplici <br /><span className="text-brand-terracotta not-italic">Ingredienti</span></h2>
              
              <div className="space-y-12">
                {homeFeatures.map((feature, idx) => (
                  <motion.div 
                    key={feature.title} 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ delay: idx * 0.15 }}
                    className="flex gap-8 group"
                  >
                    <div className="mt-1 transition-transform duration-500 group-hover:scale-125 group-hover:rotate-12">{feature.icon}</div>
                    <div>
                      <h4 className="text-2xl font-serif mb-3 italic">{feature.title}</h4>
                      <p className="text-brand-cream/40 leading-relaxed max-w-sm text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-20"
              >
                <Link to="/reservations" className="group relative inline-flex items-center gap-4 bg-brand-cream text-brand-ink px-12 py-6 rounded-full font-display uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-brand-terracotta hover:text-brand-cream transition-all duration-300">
                  Prenota un'Esperienza <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
