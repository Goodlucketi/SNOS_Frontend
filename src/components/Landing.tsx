import React from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import About from './About';
import Features from './Features';
import Oasis from './Oasis';
import Teledom from './Teledom';
import Footer from './Footer';
import { motion } from 'motion/react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main>
        {/* Hero Section */}
        <Hero />

        {/* About Section */}
        <About />

        {/* Features Section */}
        <Features />

        {/* Oasis AI Section */}
        <Oasis />

        {/* Parent Company Section */}
        <Teledom />
      </main>

      {/* Footer Section */}
      <Footer />
    </div>
  );
};

export default Landing;
