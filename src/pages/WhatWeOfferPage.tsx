import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCatalog, Package } from '../context/CatalogContext';
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react';

const WhatWeOfferPage: React.FC = () => {
  const { packages, isLoading } = useCatalog();
  const [selectedUseCase, setSelectedUseCase] = useState<Package | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-200 dark:border-blue-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              Protection Scenarios
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-6"
            >
              How SNOS Protects You
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed"
            >
              Explore the exact ways our smart security ecosystem safeguards your home and business, day and night.
            </motion.p>
          </div>

          {/* Top CTA */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 md:p-12 mb-16 shadow-xl shadow-slate-200/50 dark:shadow-none"
          >
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-3 text-center">
              Find something you need?
            </h2>
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-400 mb-8 text-center max-w-xl">
              Feel extra secure by clicking the button below to start building your custom protection plan.
            </p>
            <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 hover:scale-105 transform duration-300">
              Get Started Now
            </Link>
          </motion.div>

          {/* Use-Cases Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              <div className="col-span-full py-20 text-center text-slate-500 font-bold">Loading protection scenarios...</div>
            ) : packages.map((useCase, idx) => {
              const colorMap: Record<string, string> = {
                blue: 'from-blue-500 to-cyan-400',
                emerald: 'from-emerald-500 to-teal-400',
                purple: 'from-purple-500 to-indigo-400',
                cyan: 'from-cyan-500 to-blue-400',
                rose: 'from-rose-500 to-pink-400',
                indigo: 'from-indigo-500 to-purple-400',
                teal: 'from-teal-500 to-emerald-400',
                red: 'from-red-500 to-rose-400',
                amber: 'from-amber-500 to-orange-400',
              };

              const gradient = colorMap[useCase.color_theme] || 'from-slate-500 to-slate-400';

              return (
                <motion.div
                  key={useCase.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: idx * 0.1, duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedUseCase(useCase)}
                  className="group relative p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col items-center text-center cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] dark:group-hover:opacity-10 transition-opacity duration-500`} />
                  
                  <div className="relative w-full aspect-square mb-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center border border-slate-100 dark:border-slate-800 overflow-hidden shadow-inner group-hover:shadow-md transition-shadow duration-500">
                    <div className={`absolute w-32 h-32 rounded-full bg-gradient-to-tr ${gradient} blur-3xl opacity-20 dark:opacity-30 group-hover:scale-150 transition-transform duration-700`} />
                    <motion.img 
                      src={useCase.image_url}
                      alt={useCase.goal}
                      className="relative z-10 w-3/4 h-3/4 object-contain drop-shadow-xl"
                      whileHover={{ scale: 1.05, rotate: 2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    />
                  </div>

                  <p className="text-lg md:text-xl font-display font-semibold text-slate-900 dark:text-white leading-relaxed relative z-10">
                    "{useCase.goal}"
                  </p>

                  <div className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-400 group-hover:text-blue-500 transition-colors">
                    Click to learn more
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {selectedUseCase && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md"
              onClick={() => setSelectedUseCase(null)}
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedUseCase(null)}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="overflow-y-auto p-8 sm:p-12">
                {/* Image */}
                <div className="w-full flex justify-center mb-10">
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />
                    <img src={selectedUseCase.image_url} alt={selectedUseCase.goal} className="w-3/4 h-3/4 object-contain relative z-10 drop-shadow-xl" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white text-center mb-10">
                  "{selectedUseCase.goal}"
                </h3>

                {/* Examples */}
                {selectedUseCase.examples && (
                  <div className="mb-10">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">Common Scenarios</h4>
                    <ul className="space-y-4">
                      {selectedUseCase.examples.map((ex, i) => (
                        <li key={i} className="flex items-start gap-4 text-slate-700 dark:text-slate-300 font-medium">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                          {ex}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Explanation Blockquote */}
                {selectedUseCase.explanation && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">How We Protect You</h4>
                    <blockquote className="p-6 sm:p-8 border-l-4 border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 rounded-r-2xl text-slate-700 dark:text-slate-300 leading-relaxed text-lg italic shadow-sm">
                      {selectedUseCase.explanation}
                    </blockquote>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default WhatWeOfferPage;
