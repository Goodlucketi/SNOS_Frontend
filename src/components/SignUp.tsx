import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from './Button';

interface RegisterFormInputs {
  user_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  user_pass: string;
  user_address: string;
  user_location: string;
}

const SignUp: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>();

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/users/create.php", data);
      
      if (response.data && response.data.success) {
        toast.success(response.data.message || "Registration Successful! Please login.");
        navigate('/login');
      } else {
        toast.error(`Registration Failed: ${response.data.message || 'Unknown server error'}`);
      }
    } catch (error: any) {
      console.error("Registration failed:", error.response?.data || error.message);

      // BUG FIX: this previously showed a fake success toast and
      // navigated to /login on ANY failure - including real rejections
      // like a duplicate Gateway ID or a weak password. That left users
      // thinking they'd registered when they hadn't, unable to log in
      // afterward with no idea why. Now a real server response shows
      // the real error and stays on the page; only a genuine connection
      // failure (no response at all) gets a distinct message.
      if (error.response) {
        toast.error(error.response.data?.message || "Registration failed. Please check your details and try again.");
      } else {
        toast.error("Could not reach the SNOS server. Please check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12 transition-colors duration-300">
      <div className="max-w-xl w-full bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-8 rounded-3xl shadow-xl flex flex-col gap-6">
        
        {/* Back Link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-950 dark:hover:text-white transition-colors self-start">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to home
        </Link>

        {/* Head */}
        <div className="text-center flex flex-col items-center gap-1">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20 mb-2">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-950 dark:text-white">
            Register Gateway Node
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create a unified account to bind with your physical SNOS sensory hardware.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            
            {/* Gateway ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">User Gateway ID *</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input
                  type="text"
                  placeholder="e.g. SNOS-GATEWAY-001"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_id ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                  {...register('user_id', { required: "Gateway ID is required" })}
                />
              </div>
              {errors.user_id && <p className="text-xs text-red-500 font-medium">{errors.user_id.message}</p>}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input
                  type="text"
                  placeholder="Surname, Other Names"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_name ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                  {...register('user_name', { required: "Name is required" })}
                />
              </div>
              {errors.user_name && <p className="text-xs text-red-500 font-medium">{errors.user_name.message}</p>}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input
                  type="email"
                  placeholder="samuel@example.com"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_email ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                  {...register('user_email', { required: "Email is required" })}
                />
              </div>
              {errors.user_email && <p className="text-xs text-red-500 font-medium">{errors.user_email.message}</p>}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone Number *</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input
                  type="text"
                  placeholder="e.g. +234 815 262 5809"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_phone ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                  {...register('user_phone', { required: "Phone is required" })}
                />
              </div>
              {errors.user_phone && <p className="text-xs text-red-500 font-medium">{errors.user_phone.message}</p>}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Secure Password *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_pass ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                  {...register('user_pass', { required: "Password is required" })}
                />
              </div>
              {errors.user_pass && <p className="text-xs text-red-500 font-medium">{errors.user_pass.message}</p>}
            </div>

            {/* Location (State, LGA) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">State, L.G.A *</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-slate-400 dark:text-slate-600" />
                <input
                  type="text"
                  placeholder="e.g. Lagos, Ikeja LGA"
                  className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_location ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all`}
                  {...register('user_location', { required: "Location is required" })}
                />
              </div>
              {errors.user_location && <p className="text-xs text-red-500 font-medium">{errors.user_location.message}</p>}
            </div>

          </div>

          {/* Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Physical Address (LoT Coordinates) *</label>
            <textarea
              rows={2}
              placeholder="Full address of monitored premises..."
              className={`w-full p-3 bg-slate-50 dark:bg-slate-950 border ${errors.user_address ? 'border-red-500/50 hover:border-red-500' : 'border-slate-200 dark:border-slate-850'} rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all resize-none`}
              {...register('user_address', { required: "Address is required" })}
            />
            {errors.user_address && <p className="text-xs text-red-500 font-medium">{errors.user_address.message}</p>}
          </div>

          <Button
            text="Register Node Account"
            type="submit"
            variant="primary"
            className="w-full mt-2"
            isLoading={loading}
          />
        </form>

        <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-2">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
            Login Portal
          </Link>
        </p>

      </div>
    </div>
  );
};

export default SignUp;
