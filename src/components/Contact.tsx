import React, { useState } from 'react';
import { MapPin, Phone, Mail, Send, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import axios from 'axios';
import Button from './Button';
import { toast } from 'react-toastify';

const Contact: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullname || !formData.email || !formData.message) {
      toast.error('Please fill out all required fields');
      return;
    }
    setSending(true);
    try {
      await axios.post('/api/contact/send.php', formData);
      setSubmitted(true);
      toast.success('Thank you! Your message has been sent successfully.');
      setFormData({ fullname: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      console.error('Failed to send contact message:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Could not send your message right now, please try again later.');
    } finally {
      setSending(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-white dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white"
          >
            Contact SNOS Support
          </motion.h2>
          <div className="w-16 h-1 bg-blue-600 dark:bg-blue-500 mx-auto mt-4 rounded-full" />
          <p className="mt-4 text-slate-600 dark:text-slate-400 font-sans text-base">
            Have questions about system installation, hardware custom integrations, or pricing? Reach out to our secure operations desk.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 items-stretch">
          {/* Contact Details (Left Column) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-8 p-8 md:p-10 rounded-3xl bg-slate-900 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(37,99,235,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] opacity-20" />

            <div className="relative z-10 space-y-6">
              <h3 className="font-display font-bold text-2xl tracking-tight">Corporate Headquarters</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connect with our security systems consultants to configure custom LoT, OoT, and PoT parameters for your facilities.
              </p>
            </div>

            <div className="relative z-10 space-y-6 my-8">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Head Office Location</h4>
                  <p className="text-sm text-slate-200 font-medium mt-1">6A & 6B, Sule Abuka Crescent, Off Opebi Road, Ikeja, Lagos, Nigeria.</p>
                </div>
                
              </div>
               <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Branch Office Location</h4>
                  <p className="text-sm text-slate-200 font-medium mt-1">24 Akpakpan Street, off Barracks Road, Uyo, Akwa Ibom State, Nigeria.</p>
                </div>
                
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Direct Hotline</h4>
                  <p className="text-sm text-slate-200 font-medium mt-1">+234 815-2625-809<br/>+234 906-5731-338</p>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/10">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Inquiry</h4>
                  <p className="text-sm text-slate-200 font-medium mt-1">admin@snosfortress.com</p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-slate-800 text-xs text-slate-500 font-mono">
              TELECOMMUNICATIONS SECURITY GROUP
            </div>
          </div>

          {/* Contact Form (Right Column) */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900/40 p-8 md:p-10 rounded-3xl border border-slate-200/60 dark:border-slate-800/60 shadow-sm flex flex-col justify-center">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-950 dark:text-white">Message Logged!</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm">
                  Our dispatch operations center has received your request. A consultant will contact you shortly.
                </p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-4 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white">
                  Send Us a Secure Message
                </h3>
                
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Samuel Adebayo"
                      className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={formData.fullname}
                      onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. +234 803 123 4567"
                      className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. samuel@example.com"
                    className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Message Body *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your property types or system requirements..."
                    className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  />
                </div>

                <Button
                  text="Send Secure Dispatch"
                  type="submit"
                  variant="primary"
                  className="w-full mt-2 gap-2"
                  isLoading={sending}
                />
              </form>
            )}
          </div>
        </div>

      </div>
    </section>
  );
};

export default Contact;
