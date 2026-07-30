import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabaseClient';
import Button from './Button';
import { useUI } from '../context/UIContext';

interface LoginFormInputs {
  email: string;
  user_pass: string;
}

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showLoader, hideLoader } = useUI();

  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message);
      // Clear state so it doesn't fire again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    showLoader("Authenticating...");
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.user_pass,
      });

      if (error) {
        toast.error(`Login Failed: ${error.message}`);
      } else if (authData.user) {
        // Check if the user is already a client
        const { data: clientData } = await supabase
          .from('clients')
          .select('id')
          .eq('id', authData.user.id)
          .single();

        toast.success("Logged in successfully!");
        
        if (clientData) {
          navigate('/dashboard'); // Go to Dashboard
        } else {
          navigate('/register'); // Go to Guided Flow (Register handles the flowState swap automatically)
        }
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      toast.error("Could not reach the authentication server. Please check your connection.");
    } finally {
      setLoading(false);
      hideLoader();
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-8 rounded-3xl shadow-xl flex flex-col gap-6 relative">

        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors self-start">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        {/* Head */}
        <div className="text-center flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-950 dark:text-white">
            Client Login Portal
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your secure credentials to launch the monitoring panel.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifier Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
              <input
                type="email"
                placeholder="e.g. user@example.com"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.email ? 'border-red-500/50 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-850 focus:ring-blue-500/20'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all`}
                {...register('email', { required: "Email is required" })}
              />
            </div>
            {errors.email && <p className="text-xs text-red-500 font-medium">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Secure Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_pass ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                {...register('user_pass', { required: "Password is required" })}
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

          {/* Forgot Password */}
          <div className="flex justify-end">
            <button type="button" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Forgot password?
            </button>
          </div>

          <Button 
            type="submit" 
            variant="primary" 
            text="Authenticate"
            className="w-full justify-center group py-3"
            isLoading={loading}
          />
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
