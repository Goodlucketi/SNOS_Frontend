import React from 'react';
import { ArrowRight, ShieldAlert, Flame, Lock } from 'lucide-react';
import { motion } from 'motion/react';

// New Illustrations
import fenceImg from '../assets/images/alegria_fence.png';
import doorImg from '../assets/images/alegria_door.png';
import smokeImg from '../assets/images/alegria_smoke.png';

const scenarios = [
  {
    title: 'Fence Break-Ins',
    icon: <ShieldAlert className="w-5 h-5" />,
    image: fenceImg,
    description: 'We monitor your perimeter. If someone attempts to climb or break through your fence, the system instantly triggers an alarm and sends an alert to your phone.',
    color: 'text-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    title: 'Door Intrusions',
    icon: <Lock className="w-5 h-5" />,
    image: doorImg,
    description: 'Every entry point is secured. The moment an unauthorized person forces a door or window open, our rapid response team is notified and dispatched to your location.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20'
  },
  {
    title: 'Fire & Smoke',
    icon: <Flame className="w-5 h-5" />,
    image: smokeImg,
    description: 'Protecting you from the unseen. Our environmental sensors detect smoldering fires and deadly smoke before they spread, waking you up and alerting authorities.',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/20'
  }
];

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4"
          >
            Real-World Protection
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight"
          >
            See How SNOS Protects You
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-slate-600 dark:text-slate-400 font-sans text-lg leading-relaxed"
          >
            We don't just sell cameras. We provide comprehensive, active security solutions that detect, alert, and respond to threats in real-time. Here are a few ways we keep you safe.
          </motion.p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid md:grid-cols-3 gap-8 my-10">
          {scenarios.map((scenario, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="flex flex-col bg-slate-50 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow"
            >
              {/* Illustration Area */}
              <div className="p-8 bg-white dark:bg-slate-950 flex justify-center items-center h-64 border-b border-slate-100 dark:border-slate-800">
                <img src={scenario.image} alt={scenario.title} className="max-h-full object-contain hover:scale-105 transition-transform duration-500" />
              </div>

              {/* Text Area */}
              <div className="p-8 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${scenario.bg} ${scenario.color}`}>
                    {scenario.icon}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white">
                    {scenario.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed flex-1">
                  {scenario.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <a href="#more-scenarios" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 px-6 py-3 rounded-2xl font-bold transition-colors group">
            See More Use Cases <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>

      </div>
    </section>
  );
};

export default About;
