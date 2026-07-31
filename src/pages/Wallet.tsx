import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
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
  const { showLoader, hideLoader } = useUI();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAwaitingWebhook, setIsAwaitingWebhook] = useState(false);

  // Load user balance from wallet ledger (read-only operation)
  useEffect(() => {
    if (user?.id) {
      loadWalletData();

      const channel = supabase
        .channel(`wallet-${user.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_ledger',
          filter: `user_id=eq.${user.id}`
        }, () => loadWalletData())
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('wallet_ledger')
        .select('amount, type')
        .eq('user_id', user.id);

      if (error) throw error;

      // Calculate from ledger - your source of truth
      const total = data?.reduce((acc, row) => {
        const amt = Number(row.amount) || 0;
        return acc + (row.type === 'credit' ? amt : -amt);
      }, 0) || 0;

      setBalance(total);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleTopUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return navigate('/login');

    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum < 100) return toast.error('Minimum is ₦100');

    setIsProcessingPayment(true);
    showLoader('Initializing Secure Checkout...');

    try {
      const paystackRef = `wallet_${user.id}_${Date.now()}`;

      // BUG FIX: `window.PaystackPop` has no global type declaration
      // anywhere in this repo (GuidedFlow.tsx, which this was modeled on,
      // uses the `(window as any)` cast for the same reason) - this would
      // fail to compile as `window.PaystackPop`.
      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_77b7c00c5d7243d94da713ca2c6815eae23f99a5',
        email: user.email || '',
        amount: amountNum * 100, // Paystack needs kobo
        ref: paystackRef,
        currency: 'NGN',
        metadata: {
          user_id: user.id,
          type: 'wallet_topup',
          custom_fields: []
        },
        callback: function (response: any) {
          setIsAwaitingWebhook(true);
          showLoader('Verifying Payment...');

          // Fallback like GuidedFlow - if the webhook is slow/unreachable,
          // don't leave the user stuck on a spinner forever.
          const fallback = setTimeout(async () => {
            supabase.removeChannel(sub);
            setIsAwaitingWebhook(false);
            setIsProcessingPayment(false);
            hideLoader();
            await loadWalletData();
            toast.success('Wallet updated!');
          }, 30000);

          const sub = supabase
            .channel(`wallet-${paystackRef}`)
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'wallet_ledger',
              filter: `reference=eq.${paystackRef}`
            }, async () => {
              clearTimeout(fallback);
              supabase.removeChannel(sub);
              setIsAwaitingWebhook(false);
              setIsProcessingPayment(false);
              hideLoader();
              await loadWalletData();
              setAmount('');
              toast.success(`₦${amountNum.toLocaleString()} added!`);
            })
            .subscribe();
        },
        onClose: function () {
          setIsProcessingPayment(false);
          setIsAwaitingWebhook(false);
          hideLoader();
          toast.warning('Payment cancelled');
        }
      });

      handler.openIframe();
      hideLoader();
    } catch (err) {
      console.error(err);
      toast.error('Failed to initialize');
      setIsProcessingPayment(false);
      hideLoader();
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