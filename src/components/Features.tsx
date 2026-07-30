import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, Mail, MessageCircle, ShieldAlert } from 'lucide-react';

import photoSms from '../assets/images/photo_sms.jpg';
import photoEmail from '../assets/images/photo_email.jpg';
import photoWhatsapp from '../assets/images/photo_whatsapp.jpg';
import photoResponse from '../assets/images/photo_response.jpg';

const featuresList = [
  {
    id: 1,
    title: 'Instant SMS Alerts',
    desc: 'Get a text message the exact second something triggers your sensors. No internet connection required on your phone to receive it.',
    icon: Smartphone,
    image: photoSms,
  },
  {
    id: 2,
    title: 'Detailed Email Notifications',
    desc: 'Receive full incident reports straight to your inbox, complete with exact timestamps and the specific location of the triggered sensor.',
    icon: Mail,
    image: photoEmail,
  },
  {
    id: 3,
    title: 'WhatsApp Messaging',
    desc: 'Get notified right where you chat every day. Our automated WhatsApp bot sends you real-time updates and images of any incidents.',
    icon: MessageCircle,
    image: photoWhatsapp,
  },
  {
    id: 4,
    title: 'Rapid Response (Corporate)',
    desc: 'For our business clients, we immediately dispatch a physical security team or police patrol to intercept threats at your property.',
    icon: ShieldAlert,
    image: photoResponse,
  }
];

const Features: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-950 relative border-t border-b border-slate-200 dark:border-slate-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-20 text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200 dark:border-blue-500/20"
          >
            How We Alert You
          </motion.div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
            Stay In The Know, Instantly.
          </h2>
        </div>

        {/* Sticky Scroll Container */}
        <div className="relative flex flex-col md:flex-row items-start gap-12 lg:gap-24">

          {/* Left Column: Text Scroller */}
          <div className="w-full md:w-5/12 flex flex-col pt-10 pb-[30vh]">
            {featuresList.map((feat, idx) => {
              const Icon = feat.icon;
              const isActive = activeFeature === idx;
              return (
                <motion.div
                  key={feat.id}
                  onViewportEnter={() => setActiveFeature(idx)}
                  viewport={{ amount: 0.6, margin: "-20% 0px -20% 0px" }}
                  className={`flex flex-col gap-4 py-[15vh] transition-opacity duration-700 ${isActive ? 'opacity-100' : 'opacity-20'
                    }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 ${isActive ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800'
                    }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className={`text-3xl font-display font-bold mt-2 transition-colors duration-500 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-500'}`}>
                    {feat.title}
                  </h3>
                  <p className={`text-lg leading-relaxed transition-colors duration-500 ${isActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-600'}`}>
                    {feat.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Sticky Visualizer */}
          <div className="hidden md:block w-full md:w-7/12 sticky top-32 h-[500px]">
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950 shadow-2xl shadow-slate-200/50 dark:shadow-blue-900/10">

              {/* Blurred Background Layer to elegantly handle mixed aspect ratios */}
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={`bg-${activeFeature}`}
                  src={featuresList[activeFeature].image}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110"
                />
              </AnimatePresence>

              {/* Main Foreground Image */}
              <AnimatePresence mode="popLayout">
                <motion.img
                  key={activeFeature}
                  src={featuresList[activeFeature].image}
                  alt={featuresList[activeFeature].title}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                  className="relative z-10 w-full h-full object-contain p-2 drop-shadow-2xl"
                />
              </AnimatePresence>

            </div>
          </div>

          {/* Mobile Visualizer (Visible only on mobile, placed inline) */}
          {/* On mobile, we don't sticky scroll, we just show the image under the text block. */}
          <style>{`
            @media (max-width: 768px) {
              #features .md\\:w-5\\/12 > div {
                padding-top: 2rem !important;
                padding-bottom: 2rem !important;
                opacity: 1 !important;
              }
            }
          `}</style>

        </div>
      </div>
    </section>
  );
};

export default Features;
