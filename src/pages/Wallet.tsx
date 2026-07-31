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
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Wallet: React.FC = () => {
  const { user } = useAuth();
  const { showLoader, hideLoader } = useUI();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAwaitingWebhook, setIsAwaitingWebhook] = useState(false);

  // Load balance from wallet_balances (source of truth, maintained server-side)
  // and transaction history from wallet_ledger separately.
  useEffect(() => {
    if (user?.id) {
      loadWalletData();
      loadTransactions(true); // initial load with spinner

      // Balance changes whenever the server writes to wallet_balances
      // (e.g. after a webhook confirms a Paystack payment).
      const channel = supabase
        .channel(`wallet-balance-${user.id}`)
        .on('postgres_changes', {
          event: '*', // covers first-ever INSERT for a new user and subsequent UPDATEs
          schema: 'public',
          table: 'wallet_balances',
          filter: `user_id=eq.${user.id}`
        }, (payload: any) => {
          const newBalance = payload?.new?.balance;
          if (newBalance !== undefined) {
            setBalance(Number(newBalance) || 0);
          } else {
            loadWalletData(); // fallback if payload shape is unexpected
          }
          loadTransactions(false); // keep history in sync, no spinner
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      // wallet_balances is the source of truth for the current balance.
      // Do not compute this from wallet_ledger on the client.
      const { data, error } = await supabase
        .from('wallet_balances')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setBalance(Number(data?.balance) || 0);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async (showLoading = true) => {
    if (!user?.id) return;
    try {
      if (showLoading) setTransactionsLoading(true);
      // Transaction history still comes from wallet_ledger (read-only here).
      const { data, error } = await supabase
        .from('wallet_ledger')
        .select('amount, type, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transactionsWithDefaults = (data || []).map((tx: any) => ({
        ...tx,
        id: tx.id || tx.created_at,
        description: tx.description || (tx.type === 'credit' ? 'Wallet Top-up' : 'Payment'),
        reference: tx.reference || tx.id || 'N/A',
        status: tx.status || 'completed',
        metadata: tx.metadata || {}
      }));

      setTransactions(transactionsWithDefaults);
    } catch (err) {
      console.error('Failed to load transactions:', err);
      toast.error('Failed to load transactions');
    } finally {
      if (showLoading) setTransactionsLoading(false);
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

      // Payment is generated entirely client-side via Paystack's inline popup.
      // The client never writes to wallet_ledger or wallet_balances directly —
      // it only initiates the charge and then waits for the server-side
      // webhook to confirm it and update wallet_balances.
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

          // Fallback if the webhook is slow/unreachable — don't leave the
          // user stuck on a spinner forever.
          const fallback = setTimeout(async () => {
            supabase.removeChannel(sub);
            setIsAwaitingWebhook(false);
            setIsProcessingPayment(false);
            hideLoader();
            await loadWalletData();
            toast.success('Wallet updated!');
          }, 30000);

          // Wait for the server to confirm and write the new balance.
          // We key off user_id here (not the Paystack reference) since
          // wallet_balances holds one row per user, not one per transaction.
          const sub = supabase
            .channel(`wallet-balance-topup-${paystackRef}`)
            .on('postgres_changes', {
              event: '*',
              schema: 'public',
              table: 'wallet_balances',
              filter: `user_id=eq.${user.id}`
            }, async (payload: any) => {
              clearTimeout(fallback);
              supabase.removeChannel(sub);
              setIsAwaitingWebhook(false);
              setIsProcessingPayment(false);
              hideLoader();

              const newBalance = payload?.new?.balance;
              if (newBalance !== undefined) {
                setBalance(Number(newBalance) || 0);
              } else {
                await loadWalletData();
              }
              await loadTransactions(false);
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

            {/* Transaction History */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transaction History</h2>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
                </span>
              </div>

              {transactionsLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
                  <p className="text-slate-500 dark:text-slate-400">Loading transactions...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No transactions yet</h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Your transaction history will appear here after you top up or make purchases.
                  </p>
                </div>
              ) : (
                <div className="space-y-0">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id || tx.reference || tx.created_at}
                      className={`flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors ${tx.type === 'credit' ? '' : 'opacity-90'}`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          tx.type === 'credit'
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {tx.type === 'credit' ? (
                            <ArrowUpRight className="w-5 h-5" />
                          ) : (
                            <ArrowDownLeft className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-slate-900 dark:text-white">
                              {tx.description || (tx.type === 'credit' ? 'Wallet Top-up' : 'Payment')}
                            </p>
                            {tx.status === 'completed' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : tx.status === 'failed' ? (
                              <XCircle className="w-4 h-4 text-red-500" />
                            ) : (
                              <Clock className="w-4 h-4 text-amber-500 animate-spin" />
                            )}
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center space-x-2">
                            <span className="font-mono text-xs">
                              {tx.reference ? tx.reference.substring(0, 12) + '...' : 'N/A'}
                            </span>
                            <span>•</span>
                            <span>{new Date(tx.created_at).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.type === 'credit'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {tx.type === 'credit' ? '+' : '-'}{Number(tx.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          })}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">₦</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Wallet;