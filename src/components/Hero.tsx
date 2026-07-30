import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from './Button';

// Assuming the images are stored in assets/images/
import hero1 from '../assets/images/hero_1.png';
import hero2 from '../assets/images/hero_2.png';
import hero3 from '../assets/images/hero_3.png';
import hero4 from '../assets/images/hero_4.png';

const CAROUSEL_INTERVAL = 7000; // 7 seconds

const slides = [
  {
    id: 1,
    image: hero1,
    prefix: 'Protecting your',
    typewriter: 'Home & Family.',
    text: 'Smart home security that watches over what matters most, 24/7.'
  },
  {
    id: 2,
    image: hero2,
    prefix: 'Getting instant',
    typewriter: 'Phone Alerts.',
    text: 'Receive an immediate SMS, Email, or WhatsApp message the moment anything unusual happens.'
  },
  {
    id: 3,
    image: hero3,
    prefix: 'Securing your',
    typewriter: 'Business.',
    text: 'Powerful protection for offices, warehouses, and entire residential communities.'
  },
  {
    id: 4,
    image: hero4,
    prefix: 'Sending help',
    typewriter: 'When You Need It.',
    text: 'Our rapid response team is dispatched immediately to stop threats before they escalate.'
  }
];

const Hero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, CAROUSEL_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden bg-slate-950 text-white flex items-center justify-center">
      {/* Background Carousel */}
      <AnimatePresence mode="popLayout">
        <motion.img
          key={slides[currentSlide].id}
          src={slides[currentSlide].image}
          alt="SNOS Background"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Overlays for legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/20 to-slate-950/80 pointer-events-none" />
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
        
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-8"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          System Status: Online
        </motion.div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-display font-extrabold tracking-tight leading-tight mb-6 h-[140px] md:h-[180px] flex flex-col justify-center">
          <span className="block text-slate-300 font-light tracking-wide text-3xl sm:text-4xl mb-2">
            {slides[currentSlide].prefix}
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={slides[currentSlide].typewriter}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="block bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent"
            >
              {slides[currentSlide].typewriter}
            </motion.span>
          </AnimatePresence>
        </h1>

        <div className="h-[60px] md:h-[40px] mb-10 overflow-hidden relative w-full max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.p
              key={slides[currentSlide].text}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.8 }}
              className="text-lg sm:text-xl text-slate-200 font-sans leading-relaxed absolute inset-0 w-full text-center"
            >
              {slides[currentSlide].text}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link to="/register">
            <Button text="Secure Your Property" variant="primary" size="lg" className="shadow-2xl shadow-blue-500/30 font-bold" />
          </Link>
          <a href="#about">
            <Button text="See How It Works" variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 backdrop-blur-md" />
          </a>
        </motion.div>

        {/* Carousel Indicators */}
        <div className="mt-12 flex items-center gap-3">
          {slides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`transition-all duration-500 rounded-full ${
                currentSlide === idx ? 'w-8 h-2 bg-blue-500' : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
