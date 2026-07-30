import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, User, Mail, Phone, ArrowRight, CreditCard, CheckCircle2, Box, Building2, MapPin, MessageCircle, Loader2 } from 'lucide-react';
import PropertyTypeSelector from './PropertyTypeSelector';
import UseCaseCard from './UseCaseCard';
import OrderSummaryGrid from './OrderSummaryGrid';
import { useCatalog } from '../context/CatalogContext';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { supabase } from '../lib/supabaseClient';

interface LeadData {
  fullName: string;
  email: string;
  phone: string;
  sameAsWhatsapp: boolean;
  whatsappNumber?: string;
}

interface CorporateData {
  location: string;
  buildingCount: number;
}

type AccountType = 'individual' | 'corporate' | null;

const GuidedFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const prevStepRef = React.useRef(1);
  const [leadData, setLeadData] = useState<LeadData | null>(null);

  const [accountType, setAccountType] = useState<AccountType>(null);
  const [corporateData, setCorporateData] = useState<CorporateData>({ location: '', buildingCount: 5 });
  const [isExistingEstate, setIsExistingEstate] = useState(false);

  const { packages, products, shippingOptions, isLoading } = useCatalog();

  // Cart state: Record of productId -> quantity
  const [cart, setCart] = useState<Record<string, number>>({});

  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [locationError, setLocationError] = useState(false);
  const [fullAddress, setFullAddress] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'pickup' | 'delivery' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAwaitingWebhook, setIsAwaitingWebhook] = useState(false);

  const { user, markAsClient, updateUserMetadata } = useAuth();
  const { showLoader, hideLoader } = useUI();

  const { register: registerLead, handleSubmit: handleLeadSubmit, watch: watchLead } = useForm<LeadData>({
    defaultValues: {
      fullName: user?.name || '',
      email: user?.email || '',
      sameAsWhatsapp: true
    }
  });

  const sameAsWhatsapp = watchLead('sameAsWhatsapp');

  // Browser History & State Reset Logic
  useEffect(() => {
    // Initial history state
    if (window.history.state === null || window.history.state?.step === undefined) {
      window.history.replaceState({ step: 1 }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      const nextStep = e.state?.step || 1;
      setStep(nextStep);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle state resets when going backwards
  useEffect(() => {
    if (step < prevStepRef.current) {
      // User went back
      if (step === 1) {
        setAccountType(null);
        setCorporateData({ location: '', buildingCount: 5 });
      } else if (step === 2) {
        setCart({});
      } else if (step === 3) {
        setDeliveryMethod(null);
        setSelectedLocationId('');
        setLocationError(false);
      }
    }
    prevStepRef.current = step;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step]);

  const advanceToStep = (nextStep: number) => {
    window.history.pushState({ step: nextStep }, '');
    setStep(nextStep);
  };

  const handleBack = () => {
    window.history.back();
  };

  const onLeadSubmit = async (data: LeadData) => {
    setLeadData(data);
    // Update Supabase Auth user metadata with the user's name
    if (user) {
      try {
        await updateUserMetadata({ name: data.fullName });
      } catch (err) {
        console.warn('Failed to update user metadata:', err);
      }
    }
    advanceToStep(2); // Move to Account Type selection
  };

  const handleAccountTypeSelection = (type: AccountType) => {
    setAccountType(type);
    if (type === 'individual') {
      initializeCart(1);
      advanceToStep(3); // Skip straight to showroom for individuals
    }
  };

  const handleCorporateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (corporateData.buildingCount < 1) return;

    // Simulation: Check if location string matches a trigger phrase
    if (corporateData.location.toLowerCase().includes('existing')) {
      setIsExistingEstate(true);
      return;
    }

    initializeCart(corporateData.buildingCount);
    advanceToStep(3);
  };

  const initializeCart = (gatewayCount: number) => {
    setCart({ 'snos-core-gateway': gatewayCount });
  };

  const handleUpdateCart = (id: string, delta: number) => {
    setCart(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  const { totalItems, subtotal, shippingCost, installationFee, total } = useMemo(() => {
    let sub = 0;
    let items = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      if (qty > 0) {
        if (id === 'snos-core-gateway') {
          const product = products.find(p => p.id === id);
          if (product) {
            sub += product.base_price * qty;
            items += qty;
          }
        } else {
          const pkg = packages.find(p => p.id === id);
          if (pkg) {
            let pkgPrice = 0;
            pkg.included_products.forEach(prodId => {
              const prod = products.find(p => p.id === prodId);
              if (prod) {
                pkgPrice += prod.base_price;
              }
            });
            sub += pkgPrice * qty;
            items += qty;
          }
        }
      }
    });
    const loc = shippingOptions.find(l => l.id === selectedLocationId);
    const ship = loc ? loc.price : 0;
    const install = loc ? loc.installation_fee : 0;
    return {
      totalItems: items,
      subtotal: sub,
      shippingCost: ship,
      installationFee: install,
      total: sub + ship + install
    };
  }, [cart, selectedLocationId, packages, products, shippingOptions]);

  const requiredGatewayCount = accountType === 'corporate' ? corporateData.buildingCount : 1;

  const handleCheckoutSubmit = async () => {
    if (!selectedLocationId) {
      setLocationError(true);
      toast.error('Please select a Delivery & Installation Location to proceed!');
      return;
    }
    if (!fullAddress.trim()) {
      setAddressError(true);
      toast.error('Please provide your full installation address.');
      return;
    }
    if (!leadData) {
      toast.error('Missing customer information.');
      return;
    }

    setIsProcessingPayment(true);
    showLoader('Initializing Secure Checkout...');

    try {
      const clientMetadata = {
        name: accountType === 'corporate' ? corporateData.location : leadData.fullName,
        account_type: accountType === 'individual' ? 'personal' : accountType,
        primary_whatsapp: leadData.sameAsWhatsapp ? leadData.phone : (leadData.whatsappNumber || ''),
        phone: leadData.phone,
        email: leadData.email,
        location: fullAddress,
        building_count: accountType === 'corporate' ? corporateData.buildingCount : 1,
      };

      const { data, error } = await supabase.rpc('process_checkout', {
        p_cart: cart,
        p_shipping_id: selectedLocationId,
        p_client_metadata: clientMetadata
      });

      if (error) throw error;

      const { order_id, total_amount } = data;

      const handler = (window as any).PaystackPop.setup({
        key: 'pk_test_77b7c00c5d7243d94da713ca2c6815eae23f99a5',
        email: leadData.email,
        amount: total_amount * 100,
        ref: order_id,
        currency: 'NGN',
        metadata: {
          custom_fields: [
            {
              display_name: "Company",
              variable_name: "company_name",
              value: "SNOS by Teledom Group"
            }
          ]
        },
        callback: function (response: any) {
          setIsAwaitingWebhook(true);
          showLoader('Verifying Payment...');

          // Fallback timeout in case webhook fails or realtime is disconnected
          const fallbackTimeout = setTimeout(() => {
            supabase.removeChannel(subscription); // More robust cleanup
            setIsAwaitingWebhook(false);
            setIsProcessingPayment(false);
            hideLoader();
            advanceToStep(5); // Show traditional success screen
          }, 30000);

          // Listen for the client creation event
          const subscription = supabase
            .channel('public:clients')
            .on('postgres_changes', {
              event: 'INSERT',
              schema: 'public',
              table: 'clients',
              filter: `id=eq.${user?.id}`
            }, async (payload) => {
              console.log('Client record created!', payload);
              clearTimeout(fallbackTimeout); // Cancel the fallback!
              await markAsClient();
              supabase.removeChannel(subscription);
              setIsAwaitingWebhook(false);
              setIsProcessingPayment(false);
              hideLoader();
              navigate('/dashboard', { replace: true }); // Use React Router and Replace History State
            })
            .subscribe();
        },
        onClose: function () {
          toast.warn('Transaction was not completed. Your order is pending payment.');
          setIsProcessingPayment(false);
          hideLoader();
        }
      });
      handler.openIframe();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to initialize payment. Please try again.');
      setIsProcessingPayment(false);
      hideLoader();
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-5rem)] flex flex-col bg-slate-50 dark:bg-slate-950">

      {/* Immersive Progress Bar */}
      <div className="w-full max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 rounded-full z-0 transition-all duration-500"
            style={{ width: `${((step - 1) / 4) * 100}%` }}
          />

          {['Your Info', 'Account Type', 'Showroom', 'Checkout', 'Confirmed'].map((label, index) => {
            const num = index + 1;
            const isActive = step >= num;
            return (
              <div key={num} className="relative flex flex-col items-center group">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-all duration-500 ${isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110'
                    : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-400'
                    }`}
                >
                  {num}
                </div>
                <span className={`absolute top-12 text-xs font-semibold whitespace-nowrap transition-all duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  } ${step === num ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-6 pb-24 mt-8">
        <AnimatePresence mode="wait">

          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 p-8 md:p-12 rounded-3xl shadow-xl"
            >
              <div className="text-center mb-10">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                  <User className="w-8 h-8" />
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">Let's Get Started</h2>
                <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
                  Provide your details to begin building your custom SNOS hardware package.
                </p>
              </div>

              <form onSubmit={handleLeadSubmit(onLeadSubmit)} className="space-y-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Jane Doe"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all outline-none"
                      {...registerLead('fullName', { required: true })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="jane@example.com"
                      readOnly
                      className="w-full pl-12 pr-4 py-4 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-slate-500 dark:text-slate-400 transition-all outline-none cursor-not-allowed"
                      {...registerLead('email', { required: true })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+234 800 000 0000"
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all outline-none"
                      {...registerLead('phone', { required: true })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-1 pb-2">
                  <input
                    type="checkbox"
                    id="sameAsWhatsapp"
                    className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                    {...registerLead('sameAsWhatsapp')}
                  />
                  <label htmlFor="sameAsWhatsapp" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    My phone number is also my WhatsApp number
                  </label>
                </div>

                <AnimatePresence>
                  {!sameAsWhatsapp && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex flex-col gap-1.5 overflow-hidden"
                    >
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-2">WhatsApp Number *</label>
                      <div className="relative">
                        <MessageCircle className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                        <input
                          type="tel"
                          placeholder="+234 800 000 0000"
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all outline-none"
                          {...registerLead('whatsappNumber', { required: !sameAsWhatsapp })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-3 mt-8 group"
                >
                  Continue <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </motion.div>
          )}

          {/* STEP 2: Account Type */}
          {step === 2 && (
            <PropertyTypeSelector
              accountType={accountType}
              corporateData={corporateData}
              onAccountTypeSelect={handleAccountTypeSelection}
              onCorporateDataChange={setCorporateData}
              onCorporateSubmit={handleCorporateSubmit}
              onBack={handleBack}
            />
          )}

          {/* STEP 3: Showroom */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col h-full"
            >
              <div className="mb-6">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" /> Back
                </button>
              </div>

              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">Tell us your security goals</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                  Select the scenarios that apply to you. We'll automatically build the perfect hardware package behind the scenes.
                  {accountType === 'corporate'
                    ? ` (We have already added ${corporateData.buildingCount} SNOS Core Hubs for your buildings).`
                    : ` (The SNOS Core Hub is already included).`}
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10 mb-12">
                {isLoading ? (
                  <div className="col-span-full py-20 text-center text-slate-500 font-bold">Loading customized packages...</div>
                ) : (
                  packages.map(pkg => (
                    <UseCaseCard
                      key={pkg.id}
                      pkg={pkg}
                      quantity={cart[pkg.id] || 0}
                      onAdd={() => handleUpdateCart(pkg.id, 1)}
                      onRemove={() => handleUpdateCart(pkg.id, -1)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* STEP 4: Checkout */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div>
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors mb-8"
                >
                  <ArrowRight className="w-5 h-5 rotate-180" /> Back
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 dark:bg-slate-800 p-8 rounded-3xl text-white shadow-xl">
                  <div>
                    <h2 className="text-3xl font-extrabold mb-2">Checkout</h2>
                    <p className="text-slate-300 text-sm md:text-base">Review your order details below.</p>
                  </div>
                  <div className="text-left md:text-right bg-slate-800 dark:bg-slate-900 p-4 rounded-2xl">
                    <span className="block text-sm text-slate-400 uppercase tracking-wider font-bold mb-1">Total Due</span>
                    <span className="text-3xl font-black text-emerald-400">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Method Selection */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">How would you like to receive your hardware?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Pickup Card */}
                  <div
                    onClick={() => {
                      setDeliveryMethod('pickup');
                      setSelectedLocationId('pickup-ikeja');
                      setLocationError(false);
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 ${deliveryMethod === 'pickup' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
                  >
                    <Building2 className={`w-10 h-10 ${deliveryMethod === 'pickup' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">HQ Pickup</h4>
                      <p className="text-sm text-slate-500">Pick up from our Ikeja office</p>
                    </div>
                  </div>

                  {/* Delivery Card */}
                  <div
                    onClick={() => {
                      setDeliveryMethod('delivery');
                      setSelectedLocationId(''); // Reset so they must select from dropdown
                      setLocationError(false);
                    }}
                    className={`cursor-pointer p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 ${deliveryMethod === 'delivery' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}
                  >
                    <MapPin className={`w-10 h-10 ${deliveryMethod === 'delivery' ? 'text-blue-500' : 'text-slate-400'}`} />
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-lg">Delivery</h4>
                      <p className="text-sm text-slate-500">Dispatch rider to your location</p>
                    </div>
                  </div>
                </div>

                {/* Custom Delivery Location Dropdown */}
                {deliveryMethod === 'delivery' && (
                  <div className="mt-6 space-y-4">
                    <p className="text-slate-500 text-sm">Please select your delivery region. This determines your mandatory delivery and installation fees.</p>
                    <div className="relative">
                      <div
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full p-4 pl-12 pr-10 rounded-2xl border-2 cursor-pointer font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 transition-colors ${locationError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 hover:border-blue-500'}`}
                      >
                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${locationError ? 'text-red-500' : 'text-slate-400'}`} />
                        {selectedLocationId
                          ? shippingOptions.find(o => o.id === selectedLocationId)?.title
                          : 'Select your region...'}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <ArrowRight className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? '-rotate-90' : 'rotate-90'}`} />
                        </div>
                      </div>

                      {isDropdownOpen && (
                        <div className="absolute z-10 w-full mt-2 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl max-h-60 overflow-hidden flex flex-col">
                          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
                            <input
                              type="text"
                              autoFocus
                              placeholder="Search regions..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="w-full p-2 outline-none bg-slate-50 dark:bg-slate-950 rounded-lg text-slate-900 dark:text-white font-medium"
                            />
                          </div>
                          <div className="overflow-y-auto">
                            {shippingOptions
                              .filter(loc => !loc.id.includes('pickup') && loc.title.toLowerCase().includes(searchQuery.toLowerCase()))
                              .map(loc => (
                                <div
                                  key={loc.id}
                                  onClick={() => {
                                    setSelectedLocationId(loc.id);
                                    setIsDropdownOpen(false);
                                    setLocationError(false);
                                    setSearchQuery('');
                                  }}
                                  className="p-4 hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-0"
                                >
                                  <span className="font-bold text-slate-700 dark:text-slate-200">{loc.title}</span>
                                  <span className="text-sm font-semibold text-slate-500">₦{loc.price.toLocaleString()}</span>
                                </div>
                              ))}
                            {shippingOptions.filter(loc => !loc.id.includes('pickup') && loc.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                              <div className="p-4 text-center text-slate-500 text-sm">No regions found.</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {locationError && (
                      <p className="text-red-500 font-bold text-sm mt-1">You must select a delivery location to proceed.</p>
                    )}
                  </div>
                )}
                {/* Mandatory Address Field */}
                {deliveryMethod !== null && (
                  <div className="mt-6 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Full Installation Address *</label>
                    <textarea
                      placeholder="e.g. 123 Smart Ave, Ikeja, Lagos, Nigeria"
                      value={fullAddress}
                      onChange={(e) => {
                        setFullAddress(e.target.value);
                        setAddressError(false);
                      }}
                      className={`w-full p-4 bg-white dark:bg-slate-900 border-2 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-slate-900 dark:text-white transition-all outline-none min-h-[100px] resize-none ${addressError ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'}`}
                    />
                    {addressError && (
                      <p className="text-red-500 font-bold text-sm">Please provide your full installation address.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Order Summary Grid */}
              <div className="space-y-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-4">
                  <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">Order Summary</h3>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl flex justify-between gap-8">
                      <span>Subtotal:</span>
                      <span className="text-slate-900 dark:text-white">₦{subtotal.toLocaleString()}</span>
                    </span>
                    <span className="font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl flex justify-between gap-8">
                      <span>Delivery:</span>
                      <span className="text-slate-900 dark:text-white">
                        {selectedLocationId ? (shippingCost === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : `₦${shippingCost.toLocaleString()}`) : '-'}
                      </span>
                    </span>
                    <span className="font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl flex justify-between gap-8">
                      <span>Installation:</span>
                      <span className="text-slate-900 dark:text-white">
                        {selectedLocationId ? (installationFee === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : `₦${installationFee.toLocaleString()}`) : '-'}
                      </span>
                    </span>
                  </div>
                </div>

                <OrderSummaryGrid cart={cart} />

                <div className="mt-8 pt-8">
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={isProcessingPayment}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-5 px-6 rounded-2xl text-xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 group"
                  >
                    {isProcessingPayment ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" /> {isAwaitingWebhook ? "Verifying Payment..." : "Processing..."}
                      </>
                    ) : (
                      <>
                        Complete Order & Pay Now <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Success */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto text-center py-12 md:py-20 flex flex-col items-center bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 rounded-3xl shadow-2xl px-6 md:px-12"
            >
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-500 mb-8 relative">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                >
                  <CheckCircle2 className="w-12 h-12" />
                </motion.div>
                <motion.div
                  className="absolute inset-0 rounded-full border-4 border-emerald-400"
                  initial={{ scale: 1, opacity: 1 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </div>

              <h2 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
                {accountType === 'corporate' ? 'SNOC Initiated!' : 'Order Confirmed!'}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg mb-12">
                Thank you, <span className="font-semibold text-slate-700 dark:text-slate-300">{leadData?.fullName.split(' ')[0] || 'Customer'}</span>.
                {accountType === 'corporate'
                  ? ` Your hardware for ${corporateData.location} has been secured.`
                  : ' Your SNOS hardware package has been secured.'}
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full text-left mb-10">
                <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600">
                    <Box className="w-5 h-5" />
                  </div>
                  What happens next?
                </h3>
                <ol className="space-y-6 text-base text-slate-600 dark:text-slate-400 relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 ml-5">
                  <li className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-50 dark:ring-slate-950" />
                    <strong className="text-slate-900 dark:text-white block mb-1">1. Scheduling & Configuration</strong>
                    You will receive a call from our engineers to configure your SNOS hardware and agree upon a convenient delivery/pickup date and time.
                  </li>
                  <li className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-50 dark:ring-slate-950" />
                    <strong className="text-slate-900 dark:text-white block mb-1">2. On-Site Installation</strong>
                    An engineer will accompany the dispatch rider (or follow you if picking up) to your home for full installation. We cover all engineer movement costs!
                  </li>
                  <li className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-50 dark:ring-slate-950" />
                    <strong className="text-slate-900 dark:text-white block mb-1">3. Live Verification</strong>
                    After installation, you will test the system with the engineer to confirm you are instantly receiving SMS, Email, and WhatsApp alerts.
                  </li>
                  <li className="relative">
                    <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-50 dark:ring-slate-950" />
                    <strong className="text-slate-900 dark:text-white block mb-1">4. Dashboard Access</strong>
                    Log into snosfortress.com and register with your Gateway ID (provided by the engineer or printed on the box) to securely view your alert history and camera feeds.
                  </li>
                </ol>
              </div>

              <button
                onClick={() => window.location.href = '/'}
                className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-lg transition-colors underline underline-offset-4"
              >
                Return to Home
              </button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Floating Cart Summary Bar for Step 3 (Showroom) */}
      <AnimatePresence>
        {step === 3 && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 p-3 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.5)] z-40"
          >
            <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-3 md:gap-4">
              <div className="flex flex-col md:flex-row md:items-center gap-0 md:gap-6">
                <div className="hidden md:block">
                  <span className="block text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Total Items</span>
                  <span className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{totalItems}</span>
                </div>
                <div className="hidden md:block w-px h-10 bg-slate-200 dark:bg-slate-800" />
                <div>
                  <span className="block text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-0.5 md:mb-1">
                    Subtotal <span className="md:hidden normal-case font-normal text-slate-400">({totalItems} items)</span>
                  </span>
                  <span className="text-xl md:text-2xl font-extrabold text-blue-600 dark:text-blue-400">₦{subtotal.toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  advanceToStep(4);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                disabled={totalItems <= requiredGatewayCount}
                className={`shrink-0 font-bold text-sm md:text-lg py-2.5 px-5 md:py-4 md:px-10 rounded-xl md:rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 group ${totalItems <= requiredGatewayCount
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900'
                  }`}
              >
                Review <span className="hidden sm:inline">Order</span> <ArrowRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Duplicate Estate Simulation Modal */}
      <AnimatePresence>
        {isExistingEstate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsExistingEstate(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center border border-slate-200/50 dark:border-slate-800/50"
            >
              <div className="w-20 h-20 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500 mx-auto mb-6">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">System Identified</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Our tracking algorithm has identified that <strong className="text-slate-700 dark:text-slate-300">"{corporateData.location}"</strong> is already registered in the SNOC network.
                <br /><br />
                If you are the administrator, please log in to manage your network. If you are a resident, kindly request your Gateway ID from your estate admin.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20"
                >
                  Go to Login Portal
                </button>
                <button
                  onClick={() => setIsExistingEstate(false)}
                  className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3.5 rounded-xl transition-colors"
                >
                  Change Location
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GuidedFlow;
