import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from './Button';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribing(true);
    try {
      const res = await axios.post('/api/newsletter/subscribe.php', { email });
      toast.success(res.data?.message || 'Thank you! You have successfully subscribed to the SNOS Newsletter.');
      setEmail('');
    } catch (err: any) {
      console.error('Failed to subscribe:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Could not subscribe right now, please try again later.');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Col */}
          <div className="md:col-span-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">SNOS</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed mt-2">
              Next-generation Security Network Operating System, setting the standard for continuous, robust surveillance, remote monitoring, and rapid emergency intervention.
            </p>
            <div className="mt-4 text-xs text-slate-500 font-mono">
              A Subsidiary of Teledom Group Nigeria
            </div>
          </div>

          {/* Quick Links Col */}
          <div className="md:col-span-3 flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">System Index</h3>
            <ul className="flex flex-col gap-2.5 text-sm font-medium">
              <li>
                <Link to="/" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  Home Portal <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  About SNOS <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link to="/what-we-offer" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  What We Offer <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  Support & Contact <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  Showroom & Setup <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-400 transition-colors inline-flex items-center gap-1">
                  Client Portal <ArrowUpRight className="w-3.5 h-3.5 opacity-40" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div className="md:col-span-4 flex flex-col gap-4">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-slate-900 dark:text-white">Newsletter Dispatch</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Subscribe to receive updates on hardware compatibility, server states, and emergency dispatch modules.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2 mt-2">
              <div className="relative flex-grow">
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-inner"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <Button
                text="Subscribe"
                type="submit"
                variant="primary"
                size="md"
                isLoading={subscribing}
              />
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="mt-12 md:mt-16 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 SNOS (Security Network Operating System). All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Security Standard v2.4</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            <span>Teledom Group</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
