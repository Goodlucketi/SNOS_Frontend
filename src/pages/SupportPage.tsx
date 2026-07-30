import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, PhoneCall, AlertTriangle, ChevronDown } from 'lucide-react';
import Lottie from 'lottie-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Contact from '../components/Contact';
import Oasis from '../components/Oasis';
import robberLottie from '../assets/lotties/robber.json';

const SupportPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleFaq = (index: number) => {
    if (activeFaq === index) setActiveFaq(null);
    else setActiveFaq(index);
  };

  const faqs = [
    {
      question: "How do I choose the best security package for my home?",
      answer: "Think about what matters most to you! Do you feel your fence needs to be extra-secure? Are you worried about someone opening your windows? We have different packages that cover everything from basic door alarms to complete outdoor and indoor protection. Chat with us to find the perfect fit."
    },
    {
      question: "How will I receive alerts if something goes wrong?",
      answer: "You will get an instant alert straight to your phone! You can choose to receive a text message (SMS), an email, or even a WhatsApp message the exact moment your system spots anything unusual."
    },
    {
      question: "What does SNOS and SNOC actually stand for?",
      answer: "SNOS stands for Secure Network Operation Service. SNOC stands for Secure Network Operation Center. They are part of the same system, but the Center is the actual team monitoring the service."
    },
    {
      question: "How does rapid response work?",
      answer: "If your system detects a real emergency, our SNOC (Secure Network Operation Center) is immediately alerted. They will instantly coordinate with local authorities and send rapid response teams directly to your door to help."
    },
    {
      question: "What is the difference between Personal SNOS and Corporate SNOC?",
      answer: "Personal SNOS gives you direct control and alerts just for your own home. Corporate SNOC is for larger residential estates or businesses. With Corporate SNOC, your estate admin or local security team is also given access to guarantee a lightning-fast rapid response."
    },
    {
      question: "I need extra assistance, who can I talk to?",
      answer: "If you want extra help, you can speak directly to our SNOS AI via WhatsApp! Just send a message to +234 905 838 1768 and you'll get immediate answers to any questions you have."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-500/30 transition-colors duration-300 font-sans">
      <Navbar />

      <main className="pt-24 pb-0">
        {/* 1. Emergency Protocol (Critical Alert Section) */}
        <section className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative rounded-[2rem] overflow-hidden bg-red-950/90 border border-red-500/30 shadow-[0_0_50px_rgba(220,38,38,0.15)]"
          >
            {/* Pulsing red background gradient */}
            <motion.div 
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(220,38,38,0.2),transparent_70%)]"
            />
            
            <div className="relative z-10 p-8 md:p-12 lg:p-16 flex flex-col md:flex-row gap-12 items-center">
              
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-sm font-semibold tracking-wide uppercase">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Emergency Help
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-extrabold text-white tracking-tight">
                  What to do if someone breaks in while you are home
                </h1>
                <p className="text-red-200 text-lg max-w-xl leading-relaxed">
                  If you are inside your house when a break-in happens, your immediate safety is the absolute priority.
                </p>
                
                <div className="grid sm:grid-cols-2 gap-4 mt-8">
                  <div className="bg-red-900/40 border border-red-500/20 rounded-xl p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      </div>
                      <h3 className="text-white font-bold">1. Secure Your Location & Stay Quiet</h3>
                    </div>
                    <p className="text-sm text-red-200 leading-relaxed">
                      Immediately lock the door to your current room. Do not turn on lights. If you have a heavy object like a dresser, slide it quietly against the door to block it.
                    </p>
                  </div>

                  <div className="bg-red-900/40 border border-red-500/20 rounded-xl p-5 flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                        <PhoneCall className="w-4 h-4 text-red-400" />
                      </div>
                      <h3 className="text-white font-bold">2. Silently Contact Authorities</h3>
                    </div>
                    <p className="text-sm text-red-200 leading-relaxed">
                      Dial 911 on your cell phone. If you cannot speak without being heard, leave the line open so police dispatchers can hear what is happening and track your location.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-6 py-3 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-white font-semibold rounded-xl transition-colors flex items-center gap-2"
                >
                  View Full Safety Guide <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Right Column: Prominent Lottie + Quick Dial Action */}
              <div className="shrink-0 w-full lg:w-[400px] relative z-10 flex flex-col items-center gap-8">
                
                <Lottie 
                  animationData={robberLottie} 
                  loop={true} 
                  className="w-full max-w-xs drop-shadow-[0_0_40px_rgba(220,38,38,0.3)] hidden md:block"
                />

                <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl text-center shadow-2xl flex flex-col items-center w-full">
                  <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(220,38,38,0.5)] mb-6 animate-pulse">
                    <PhoneCall className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Law Enforcement</h3>
                  <p className="text-sm text-slate-400 mb-6">If you are in immediate danger, bypass the system and call the police.</p>
                  <a href="tel:911" className="block w-full py-4 bg-white text-red-600 rounded-xl font-bold text-lg hover:bg-slate-100 transition-colors">
                    Dial 911 Now
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Modal for Full Survival Protocol */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden z-10"
            >
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-red-50 dark:bg-red-900/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Complete Safety Guide</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                  ✕
                </button>
              </div>
              <div className="p-8 max-h-[60vh] overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">1. Secure Your Location & Stay Quiet</h3>
                  <p className="text-slate-600 dark:text-slate-400">Immediately lock the door to your current room. Do not turn on lights. If you have a heavy object like a dresser, slide it quietly against the door to block it.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">2. Silently Contact Authorities</h3>
                  <p className="text-slate-600 dark:text-slate-400">Dial 911 on your cell phone. If you cannot speak without being heard, leave the line open so police dispatchers can hear what is happening and track your location.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">3. Do Not Confront the Intruder</h3>
                  <p className="text-slate-600 dark:text-slate-400">Never try to fight the intruder or protect your belongings. Property is replaceable; your life is not. Keep your hands empty and visible if you are confronted.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">4. Our Monitoring Team</h3>
                  <p className="text-slate-600 dark:text-slate-400">If you have our 24/7 monitoring service, our team will immediately call the police the moment they detect a break-in.</p>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">5. Escape Only If Safe</h3>
                  <p className="text-slate-600 dark:text-slate-400">Only try to leave the house if you have a clear, safe exit that is far away from the intruder. If you are not sure, stay hidden and quiet.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* 2. Oasis AI Assistant Section */}
        <div className="mb-20">
          <Oasis />
        </div>

        {/* 3. Interactive FAQs */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
              >
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-semibold text-slate-900 dark:text-white pr-4">{faq.question}</span>
                  <div className={`shrink-0 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-transform duration-300 ${activeFaq === idx ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                  </div>
                </button>
                
                {/* Expandable Answer */}
                <motion.div 
                  initial={false}
                  animate={{ height: activeFaq === idx ? 'auto' : 0, opacity: activeFaq === idx ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/50 mt-2">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Direct Contact Component */}
        {/* We reuse the existing Contact component here. It brings its own styling. */}
        <Contact />
      </main>

      <Footer />
    </div>
  );
};

export default SupportPage;
