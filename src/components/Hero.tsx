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

const CAROUSEL_INTERVAL = 10000; // 10 seconds

const slides = [
  {
    id: 1,
    image: hero1,
    subtext: 'Smart home security that watches over what matters most, 24/7.'
  },
  {
    id: 2,
    image: hero2,
    subtext: 'Receive an immediate SMS, Email, or WhatsApp message the moment anything unusual happens.'
  },
  {
    id: 3,
    image: hero3,
    subtext: 'Powerful protection for Offices, Warehouses, Schools, Estates, Institutions and entire residential communities.'
  },
  {
    id: 4,
    image: hero4,
    subtext: 'Our rapid response team is dispatched immediately to stop threats before they escalate.'
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
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/40 to-slate-950/90 pointer-events-none" />
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center space-y-4">

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-10"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
          System Status: Online
        </motion.div>

        {/* Fixed Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight leading-tight mb-2 text-white"
        >
          SNOSFORTRESS
        </motion.h1>

        {/* Fixed Sub-heading */}
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-3xl sm:text-2xl md:text-3xl font-display font-medium text-slate-300 mb-8 tracking-wide"
        >
          Smart Security Network
        </motion.h2>

        {/* Carousel Subtext */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10 min-h-[60px] max-w-2xl mx-auto"
        >
          <AnimatePresence mode="wait">
            <motion.p
              key={slides[currentSlide].id}
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(10px)' }}
              transition={{ duration: 0.5 }}
              className="text-lg sm:text-xl text-slate-200 font-sans leading-relaxed text-center"
            >
              {slides[currentSlide].subtext}
            </motion.p>
          </AnimatePresence>
        </motion.div>

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
