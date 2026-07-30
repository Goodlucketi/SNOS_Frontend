import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import Button from '../components/Button';
import {
  TrendingUp,
  CreditCard,
  Banknote,
  Loader2,
  AlertTriangle
} from 'lucide-react';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Load user balance from clients metadata (read-only operation)
  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get user profile to fetch wallet balance from metadata (read-only)
      const { data: profileData, error: profileError } = await supabase
        .from('clients')
        .select('metadata')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      const walletBalance = profileData?.metadata?.wallet_balance || 0;
      setBalance(walletBalance);
    } catch (err: any) {
      console.error('Error loading wallet data:', err);
      toast.error('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please log in to continue');
      navigate('/login');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum < 100) {
      toast.error('Minimum top-up amount is ₦100');
      return;
    }

    setIsProcessingPayment(true);

    try {
      // Initialize Paystack payment - frontend only (similar to GuidedFlow)
      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_77b7c00c5d7243d94da713ca2c6815eae23f99a5',
        email: user.email || '',
        amount: amountNum * 100, // Convert to kobo (smallest currency unit)
        ref: `wallet_topup_${Date.now()}_${Math.floor(Math.random() * 1000000)}`,
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: "Wallet Top-up",
              variable_name: "wallet_topup",
              value: "true"
            }
          ]
        },
        callback: async (response: any) => {
          // Payment successful via Paystack frontend
          // Update balance frontend-only (no database writes as requested)
          try {
            const newBalance = balance + amountNum;
            setBalance(newBalance);
            toast.success(`Wallet topped up successfully! ₦${amountNum.toLocaleString()} added.`);
          } catch (err: any) {
            console.error('Error updating balance:', err);
            toast.error('Payment successful but failed to update balance');
          } finally {
            setIsProcessingPayment(false);
          }
        },
        onClose: () => {
          // Handle cancelled/closed payment
          setIsProcessingPayment(false);
          toast.warning('Payment cancelled');
        }
      });

      handler.openIframe();
    } catch (err: any) {
      console.error('Error initiating payment:', err);
      toast.error('Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Please log in to access your wallet
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            You need to be logged in to view and manage your wallet balance.
          </p>
          <Button
            text="Go to Login"
            onClick={() => navigate('/login')}
            variant="primary"
            className="mt-4"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <Banknote className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Wallet</h1>
          </div>
          <nav className="flex space-x-3">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:underline"
            >
              Back to Dashboard
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400">Loading wallet...</p>
          </div>
        ) : (
          <>
            {/* Wallet Balance Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 shadow-sm">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-500 flex items-center justify-center rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Wallet Balance</h2>
                  <p className="text-slate-500 dark:text-slate-400">Available for SNOS services</p>
                </div>
              </div>

              <div className="text-center">
                <div className="flex justify-center items-baseline space-x-2">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">
                    ₦{balance.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </span>
                </div>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                  Your available credit for purchasing SNOS services and products
                </p>
              </div>
            </div>

            {/* Top Up Form */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 mb-8 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Top Up Wallet</h2>

              <form onSubmit={handleTopUp} className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Amount to Add (₦)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      min="100"
                      step="100"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount in Naira (minimum ₦100)"
                      className={`w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border
                        ${isProcessingPayment ? 'border-slate-200 dark:border-slate-800 opacity-70' :
                          'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'}
                        rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none
                        ${isProcessingPayment ? 'pointer-events-none' : ''}`}
                      disabled={isProcessingPayment}
                      required
                    />
                    {isProcessingPayment && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center">
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Minimum top-up: ₦100. Funds will be available instantly after successful payment.
                  </p>
                </div>

                <Button
                  text={isProcessingPayment ? 'Processing...' : 'Top Up Wallet'}
                  variant="primary"
                  className="w-full"
                  disabled={isProcessingPayment || !amount || parseFloat(amount) < 100}
                />
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;