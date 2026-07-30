import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import GuidedFlow from '../components/GuidedFlow';
import Button from '../components/Button';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { invokeEdgeFunction } from '../lib/api';
import { supabase } from '../lib/supabaseClient';

type FlowState = 'register' | 'guided_flow';

interface RegisterFormInputs {
  email: string;
  user_pass: string;
}

const Register: React.FC = () => {
  const { user, isClient } = useAuth();
  const [flowState, setFlowState] = useState<FlowState>('register');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useUI();

  // If already logged in, skip the register form
  React.useEffect(() => {
    if (user) {
      if (isClient) {
        // They shouldn't be here if they are a full client, send to dashboard
        navigate('/dashboard');
      } else {
        // Logged in but no client record = jump straight to package builder
        setFlowState('guided_flow');
      }
    }
  }, [user, isClient, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const onRegisterSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    showLoader("Creating Account...");
    try {
      // 1. Call Edge Function via new invokeEdgeFunction helper
      await invokeEdgeFunction('create_user', {
        email: data.email,
        password: data.user_pass
      });

      // 2. Sign in the newly created user
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.user_pass,
        });

        if (signInError) throw signInError;

      toast.success("Account created successfully!");
      // 3. Move to guided flow
      setFlowState('guided_flow');
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      const errMsg = error.message || "";
      if (errMsg.toLowerCase().includes("user already exists") || errMsg.toLowerCase().includes("already registered")) {
        navigate('/login', { state: { message: "This email is already registered. Please log in." } });
      } else {
        toast.error(errMsg || "Failed to register. Please try again.");
      }
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 flex flex-col">
      {flowState !== 'guided_flow' && <Navbar />}

      <div className={`flex-1 ${flowState === 'guided_flow' ? '' : 'pt-24 pb-12 px-4 max-w-5xl mx-auto w-full'}`}>
        <AnimatePresence mode="wait">
          
          {/* REGISTER STATE */}
          {flowState === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center max-w-md mx-auto"
            >
              <div className="mb-4 w-full">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to home
                </Link>
              </div>

              <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-8 rounded-3xl shadow-xl flex flex-col gap-6">
                <div className="text-center flex flex-col items-center gap-1">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-600/20 mb-2">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-950 dark:text-white">
                    Start Your Security Journey
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Create an account to start building your custom SNOS package.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                      <input
                        type="email"
                        placeholder="e.g. user@example.com"
                        className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all`}
                        {...register('email', { required: "Email is required" })}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_pass ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 transition-all`}
                        {...register('user_pass', { required: "Password is required", minLength: { value: 6, message: "Minimum 6 characters" } })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.user_pass && <p className="text-xs text-red-500 font-medium">{errors.user_pass.message}</p>}
                  </div>

                  <Button 
                    type="submit" 
                    variant="primary" 
                    text="Continue to Setup"
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 py-3 mt-2"
                    isLoading={loading}
                  />
                </form>

                <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                      Log in here
                    </Link>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* GUIDED FLOW STATE */}
          {flowState === 'guided_flow' && (
            <motion.div
              key="guided_flow"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.4 }}
              className="min-h-screen w-full bg-slate-50 dark:bg-slate-950"
            >
              <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 z-50 flex items-center justify-between md:justify-start px-4 lg:px-8">
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
                >
                  <ArrowLeft className="w-4 h-4" /> Exit Showroom
                </button>
                <div className="md:mx-auto font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white flex items-center gap-2 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> SNOS <span className="font-light text-slate-400 hidden sm:inline">Showroom</span>
                </div>
                <div className="w-32 hidden md:block shrink-0" />
              </div>

              <div className="pt-16 h-full">
                <GuidedFlow />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default Register;
