import React from 'react';
import { motion } from 'motion/react';
import { Network, Server, ShieldCheck } from 'lucide-react';
import teledomImg from '../assets/images/teledom_hq.jpg';

const Teledom: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Trust Card Container */}
        <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col lg:flex-row">

          {/* Left Side: Typography & Pedigree */}
          <div className="w-full lg:w-1/2 p-10 sm:p-16 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-200 dark:border-blue-500/20 w-max"
            >
              Who is Behind SNOS?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-6"
            >
              Backed by <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500 dark:from-blue-400 dark:to-emerald-400">
                Teledom Group
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-10"
            >
              SNOS is proudly powered by the Teledom Group—a trusted technology leader with decades of experience securing national infrastructure and providing reliable IT-services across Nigeria.
            </motion.p>

            <div className="flex flex-col gap-6">
              {[
                { icon: Network, title: 'Always Connected', desc: 'We keep your security system online 24/7 using our own highly reliable nationwide network.' },
                { icon: Server, title: 'Zero Downtime', desc: 'Our backup satellite systems ensure your alerts still deliver instantly, even if local phone networks fail.' },
                { icon: ShieldCheck, title: 'Bank-Level Security', desc: 'The exact same security technology protecting national banks is now protecting your home.' },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + (idx * 0.1) }}
                  className="flex items-start gap-4"
                >
                  <motion.div
                    animate={{ y: [0, -2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.5 }}
                    className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-slate-200 dark:border-slate-700"
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <h4 className="text-slate-900 dark:text-white font-bold text-lg">{item.title}</h4>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: The Cinematic NOC Image */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full overflow-hidden">
            <motion.img
              src={teledomImg}
              alt="Teledom Network Operations Center"
              className="absolute inset-0 w-full h-full object-cover"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Soft gradient to blend the image into the card on the left side */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent dark:from-slate-900 dark:via-slate-900/40 dark:to-transparent" />

            {/* Small glass pill for extra tech flavor */}
            <div className="absolute bottom-8 right-8">
              <div className="px-4 py-2 rounded-full bg-white/80 dark:bg-slate-950/60 backdrop-blur-md border border-slate-200 dark:border-white/10 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 tracking-wider">24/7 MONITORING ACTIVE</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Teledom;
