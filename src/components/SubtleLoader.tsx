import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield } from 'lucide-react';

interface SubtleLoaderProps {
  isSubtleLoading: boolean;
  subtleLoaderText?: string;
}

const SubtleLoader: React.FC<SubtleLoaderProps> = ({ isSubtleLoading, subtleLoaderText = "SYNCING..." }) => {

  return (
    <AnimatePresence>
      {isSubtleLoading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[10000] pointer-events-none"
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/95 dark:bg-slate-950/95 rounded-full border border-slate-700/60 shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-xl">
            {/* Small Spinner */}
            <div className="relative flex items-center justify-center w-5 h-5">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-blue-500/20 border-t-blue-500 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[3px] border-[1.5px] border-purple-500/20 border-b-purple-500 rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center text-blue-500">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Shield className="w-2.5 h-2.5 drop-shadow-[0_0_4px_rgba(59,130,246,0.6)]" />
                </motion.div>
              </div>
            </div>

            {/* Text */}
            <p className="text-slate-100 font-mono text-[9px] tracking-widest uppercase font-bold max-w-[120px] sm:max-w-[180px] truncate">
              {subtleLoaderText}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SubtleLoader;
