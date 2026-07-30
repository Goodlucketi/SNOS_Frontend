import React from 'react';
import { motion } from 'motion/react';
import { Target, Zap, Shield, ChevronDown, User } from 'lucide-react';
import Lottie from 'lottie-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import teledomHqImage from '../assets/images/teledom_hq.png';
import visionEyeData from '../assets/lotties/Vision Eye.json';
import missionData from '../assets/lotties/Mission.json';
import securityData from '../assets/lotties/Security pay.json';
import responseData from '../assets/lotties/Response.json';
import cctvData from '../assets/lotties/cctv.json';

const AboutPage: React.FC = () => {
  const [activeObjective, setActiveObjective] = React.useState(0);

  const objectives = [
    { 
      title: 'Automatic Help', 
      desc: 'We automatically let you and your emergency contacts know the moment anything goes wrong, even before a break-in actually happens.',
      lottie: responseData,
      color: 'text-orange-500',
      bgPulse: 'bg-orange-500/20'
    },
    { 
      title: 'Always Reliable', 
      desc: 'Built with the same level of security as banks, ensuring that your home alarm system never goes offline, no matter what.',
      lottie: securityData,
      color: 'text-blue-500',
      bgPulse: 'bg-blue-500/20'
    },
    { 
      title: 'Complete Protection', 
      desc: 'We connect easily with your cameras and sensors, giving you a complete, round-the-clock view of everything happening at home.',
      lottie: cctvData,
      color: 'text-emerald-500',
      bgPulse: 'bg-emerald-500/20'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans selection:bg-blue-500/30">
      <Navbar />

      <main>
        {/* A1. Our Vision (Primary Hero with Lottie) */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden bg-slate-50 dark:bg-slate-950">
          {/* Subtle animated mesh background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-50 dark:via-slate-950 to-slate-50 dark:to-slate-950 opacity-60 pointer-events-none" />
          
          <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">
              
              {/* Text Column */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100/50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 mx-auto lg:mx-0 w-max"
                >
                  Our Vision
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                  className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-slate-900 dark:text-white tracking-tighter leading-tight"
                >
                  More Than An Alarm.<br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-teal-500 to-emerald-500 dark:from-blue-400 dark:via-teal-300 dark:to-emerald-400">
                    Total Peace of Mind.
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
                  className="mt-8 text-xl text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed"
                >
                  To bring the best, most reliable security straight to your home and business, making everyone feel completely safe and protected.
                </motion.p>
              </div>

              {/* Lottie Animation Column */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-end">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1.2, delay: 0.3, type: "spring", stiffness: 50 }}
                  className="relative w-full max-w-lg aspect-square"
                >
                  {/* Floating glassmorphic ring behind lottie for extra depth */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-teal-400/20 rounded-full blur-3xl opacity-50 dark:opacity-30" />
                  <Lottie 
                    animationData={visionEyeData} 
                    loop={true} 
                    className="w-full h-full relative z-10 drop-shadow-2xl"
                  />
                </motion.div>
              </div>

            </div>
          </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500"
          >
            <span className="text-xs tracking-widest uppercase font-semibold">Discover</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </motion.div>
        </section>

        {/* A2. Our Mission (Secondary Hero with Lottie) */}
        <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/5 py-24">
          <div className="relative z-30 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
              
              {/* Lottie Animation Column (Left side this time for zig-zag flow) */}
              <div className="w-full lg:w-1/2 flex justify-center lg:justify-start">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 1, type: "spring", stiffness: 60 }}
                  className="relative w-full max-w-lg aspect-square"
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-teal-400/20 rounded-full blur-3xl opacity-50 dark:opacity-30" />
                  <Lottie 
                    animationData={missionData} 
                    loop={true} 
                    className="w-full h-full relative z-10 drop-shadow-2xl"
                  />
                </motion.div>
              </div>

              {/* Text Column */}
              <div className="w-full lg:w-1/2 flex flex-col justify-center text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-[0.2em] mb-8 mx-auto lg:mx-0 w-max"
                >
                  Our Mission
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 dark:text-white tracking-tight leading-tight"
                >
                  To perfectly connect smart safety <br />
                  <span className="text-slate-500 dark:text-slate-500">with instant help.</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="mt-8 text-lg text-slate-600 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 font-light leading-relaxed"
                >
                  When someone tries to break in, every second matters. Our mission is to make sure any danger is spotted and stopped before they even reach your front door.
                </motion.p>
              </div>

            </div>
          </div>
        </section>

        {/* B. Core Objectives (Scalable Sticky List) */}
        <section className="py-32 relative z-30 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <h2 className="text-4xl md:text-5xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                Our Main Goals
              </h2>
              <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
                The simple goals that guide everything we do, designed to keep you and your loved ones completely safe.
              </p>
            </div>

            {/* Mobile View: Stacked Cards */}
            <div className="flex flex-col gap-12 md:hidden">
              {objectives.map((obj, idx) => (
                <div 
                  key={idx} 
                  className="flex flex-col items-center text-center bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-xl"
                >
                  <div className="w-full aspect-square relative flex items-center justify-center mb-8 rounded-[2rem] overflow-hidden">
                    <div className={`absolute inset-0 blur-3xl ${obj.bgPulse} opacity-40`} />
                    <Lottie 
                      animationData={obj.lottie} 
                      loop={true} 
                      className="w-4/5 h-4/5 relative z-10 drop-shadow-xl" 
                    />
                  </div>
                  <div className="flex flex-col items-center gap-2 mb-4">
                    <div className={`text-xl font-mono font-bold ${obj.color}`}>
                      0{idx + 1}
                    </div>
                    <h3 className="text-2xl font-bold font-display tracking-tight text-slate-900 dark:text-white">
                      {obj.title}
                    </h3>
                  </div>
                  <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    {obj.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Desktop View: Sticky Split Visualizer */}
            <div className="hidden md:flex flex-row gap-12 lg:gap-24 relative">
              
              {/* Left Side: Sticky Visualizer */}
              <div className="w-full md:w-1/2 relative">
                <div className="sticky top-32 h-[500px] w-full rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center justify-center overflow-hidden transition-colors duration-500">
                  {/* Background glowing pulse that updates based on active item */}
                  <div className={`absolute w-64 h-64 rounded-full blur-3xl transition-all duration-700 ease-out ${objectives[activeObjective].bgPulse} scale-150`} />
                  
                  {/* Animate out the old lottie and animate in the new one */}
                  <div className="relative z-10 w-64 h-64">
                    {objectives.map((obj, idx) => (
                      <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-700 ease-in-out ${activeObjective === idx ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-12 pointer-events-none'}`}
                      >
                        {activeObjective === idx && (
                          <Lottie 
                            animationData={obj.lottie} 
                            loop={true} 
                            className="w-full h-full drop-shadow-2xl"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Side: Scrollable List of Objectives */}
              <div className="w-full md:w-1/2 flex flex-col justify-center gap-32 py-24 md:py-48 pb-64">
                {objectives.map((obj, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ amount: 0.5, margin: "-10% 0px" }}
                    onViewportEnter={() => setActiveObjective(idx)}
                    onMouseEnter={() => setActiveObjective(idx)}
                    className={`cursor-pointer transition-all duration-700 p-10 rounded-[2.5rem] border ${
                      activeObjective === idx 
                        ? 'bg-white dark:bg-slate-900 shadow-2xl border-slate-200 dark:border-slate-700 scale-105' 
                        : 'bg-transparent border-transparent opacity-40 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`text-2xl font-mono font-bold ${activeObjective === idx ? obj.color : 'text-slate-400'}`}>
                        0{idx + 1}
                      </div>
                      <h3 className={`text-3xl md:text-4xl font-bold font-display tracking-tight ${activeObjective === idx ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                        {obj.title}
                      </h3>
                    </div>
                    <p className={`text-xl leading-relaxed font-light ${activeObjective === idx ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500 dark:text-slate-500'}`}>
                      {obj.desc}
                    </p>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* C. The Leadership (Founder & Heritage) */}
        <section className="py-32 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
              {/* Profile Image Column */}
              <div className="w-full lg:w-5/12">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                  <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {/* Placeholder for Founder Portrait (Quota Exhausted Fallback) */}
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                      <User className="w-24 h-24 mb-4 opacity-50" />
                      <span className="text-sm font-mono tracking-widest uppercase">Portrait Placeholder</span>
                    </div>
                  </div>
                  
                  {/* Floating ID Card */}
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="absolute -bottom-6 -left-6 p-4 rounded-2xl bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Shield className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-slate-500 font-bold">Role</p>
                      <p className="text-slate-900 dark:text-white font-mono font-bold">OUR FOUNDER</p>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Profile Text Column */}
              <div className="w-full lg:w-7/12">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-4">
                    Dr. Emmanuel E. Ekuwem
                  </h2>
                  <h3 className="text-xl text-blue-600 dark:text-blue-400 font-medium mb-8">
                    Founder & Visionary, Teledom Group
                  </h3>
                  
                  <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
                    <p>
                      SNOS comes from decades of hard work in Nigeria's technology sector. Under Dr. Ekuwem's leadership, the Teledom Group has spent years building the most reliable networks and security systems in the country.
                    </p>
                    <p>
                      The idea behind SNOS was simple but powerful: to take the incredibly strong security used by big government offices and bring it directly to your neighborhood and home.
                    </p>
                    <p>
                      By combining our years of experience in building strong networks with modern smart devices, SNOS gives you the most reliable, automatic protection possible.
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* D. The Teledom Group Heritage (Parent Company) */}
        <section className="py-32 bg-slate-50 dark:bg-slate-950 relative overflow-hidden transition-colors duration-300">
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
              
              {/* Image Column */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-400 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 shadow-xl dark:shadow-2xl">
                    <img 
                      src={teledomHqImage} 
                      alt="Teledom Group Headquarters" 
                      className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-700 mix-blend-luminosity hover:mix-blend-normal"
                    />
                    
                    {/* Tech Overlay lines */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
                  </div>
                </motion.div>
              </div>

              {/* Text Column */}
              <div className="w-full lg:w-1/2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest mb-6">
                    Our Parent Company
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight mb-6 leading-tight">
                    The Teledom Group Heritage
                  </h2>
                  
                  <div className="space-y-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    <p>
                      SNOS isn't just a small startup idea; it's the security branch of the <strong className="text-slate-900 dark:text-white font-semibold">Teledom Group</strong>, a trusted technology company with decades of experience building Nigeria's digital connections.
                    </p>
                    <p>
                      Teledom has spent years building strong networks that simply cannot afford to fail, bringing internet and phone connections to people all over the country.
                    </p>
                    <p>
                      Because of this long history, SNOS can promise that your alerts will come through instantly and the system will almost never go offline. We made sure your property stays protected, no matter what happens.
                    </p>
                  </div>

                  {/* Micro Stats */}
                  <div className="mt-10 grid grid-cols-2 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none">
                      <Zap className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-3" />
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Internet Pioneers</div>
                      <div className="text-xs text-slate-500">Decades of connecting people.</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-none">
                      <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-3" />
                      <div className="text-sm font-bold text-slate-900 dark:text-white mb-1">Always Connected</div>
                      <div className="text-xs text-slate-500">Connections that never drop.</div>
                    </div>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </section>

        {/* E. The Infrastructure Scale (Animated Stats) */}
        <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 relative overflow-hidden transition-colors duration-300">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { value: '99.99%', label: 'Always Online' },
                { value: 'Instant', label: 'Alerts to your Phone' },
                { value: 'Bank', label: 'Level Data Security' },
                { value: '24/7', label: 'Active Monitoring' }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                  className="text-center"
                >
                  <div className="text-4xl md:text-5xl font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default AboutPage;
