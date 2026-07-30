import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';

interface GlobalLoaderProps {
  isLoading: boolean;
  loaderText?: string;
}

const GlobalLoader: React.FC<GlobalLoaderProps> = ({ isLoading, loaderText = "INITIALIZING..." }) => {

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md"
        >
          <div className="flex flex-col items-center justify-center space-y-6">
            
            {/* Spinning Shield Loader */}
            <div className="relative flex items-center justify-center w-24 h-24">
              {/* Outer Spinners */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-2 border-4 border-purple-500/20 border-b-purple-500 rounded-full"
              />
              
              {/* Inner Pulsing Shield */}
              <div className="absolute inset-0 flex items-center justify-center text-blue-500 shadow-blue-500">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Shield className="w-8 h-8 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                </motion.div>
              </div>
            </div>
            
            {/* Text Box */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="px-6 py-2.5 bg-slate-900/90 dark:bg-slate-950/90 rounded-full border border-slate-700/50 shadow-2xl backdrop-blur-xl flex items-center gap-3"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <p className="text-white font-mono text-xs tracking-widest uppercase font-bold text-center">
                {loaderText}
              </p>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoader;
