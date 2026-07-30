import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Building2, CheckCircle2, ArrowRight, MapPin } from 'lucide-react';

export type AccountType = 'individual' | 'corporate' | null;

export interface CorporateData {
  location: string;
  buildingCount: number;
}

interface PropertyTypeSelectorProps {
  accountType: AccountType;
  corporateData: CorporateData;
  onAccountTypeSelect: (type: AccountType) => void;
  onCorporateDataChange: (data: CorporateData) => void;
  onCorporateSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const PropertyTypeSelector: React.FC<PropertyTypeSelectorProps> = ({
  accountType,
  corporateData,
  onAccountTypeSelect,
  onCorporateDataChange,
  onCorporateSubmit,
  onBack,
}) => {
  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" /> Back
        </button>
      </div>

      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight">
          Tell us about the property you want to secure.
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-lg">
          Select the option that best describes your space so we can recommend the right setup.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        {/* Personal Option */}
        <div 
          onClick={() => onAccountTypeSelect('individual')}
          className={`cursor-pointer rounded-3xl border-2 transition-all flex flex-col overflow-hidden ${
            accountType === 'individual' 
              ? 'border-blue-600 bg-blue-50/30 dark:bg-blue-900/10 shadow-xl shadow-blue-500/10 scale-[1.02]' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
          }`}
        >
          <div className={`p-8 border-b ${accountType === 'individual' ? 'border-blue-100 dark:border-blue-800/50' : 'border-slate-100 dark:border-slate-800'}`}>
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
              <User className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">My Home or Personal Space</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Perfect for an apartment, a standalone house, a condo, or your private office. A single, dedicated security perimeter just for you.
            </p>
          </div>
          <div className="p-8 flex-1 flex flex-col gap-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What to expect</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="leading-relaxed">Complete control and privacy over your own security data.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="leading-relaxed">Zero reliance on shared community infrastructure.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                  <span className="leading-relaxed">A dedicated security system tailored perfectly to your space.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Corporate Option */}
        <div 
          onClick={() => onAccountTypeSelect('corporate')}
          className={`cursor-pointer rounded-3xl border-2 transition-all flex flex-col overflow-hidden ${
            accountType === 'corporate' 
              ? 'border-emerald-600 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-xl shadow-emerald-500/10 scale-[1.02]' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-300'
          }`}
        >
          <div className={`p-8 border-b ${accountType === 'corporate' ? 'border-emerald-100 dark:border-emerald-800/50' : 'border-slate-100 dark:border-slate-800'}`}>
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">A large facility, multi-building complex, or estate</h3>
            <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed">
              Designed for gated estates, corporate campuses, hospitals, or any large property that requires multiple security zones working together.
            </p>
          </div>
          <div className="p-8 flex-1 flex flex-col gap-6">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">What to expect</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="leading-relaxed">Centralized dashboard for estate or facility security personnel.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="leading-relaxed">Instant cross-verification between distinct building zones.</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  <span className="leading-relaxed">Bulk management of access credentials and emergency routing.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {accountType === 'corporate' && (
          <motion.form 
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={onCorporateSubmit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl overflow-hidden"
          >
            <h4 className="font-bold text-slate-900 dark:text-white mb-6 text-xl">Facility Details</h4>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Estate / Company Name *</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={corporateData.location}
                    onChange={e => onCorporateDataChange({ ...corporateData, location: e.target.value })}
                    placeholder="e.g. Teledom Group HQ"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 text-slate-900 dark:text-white transition-all outline-none"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Number of Buildings</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-4 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={corporateData.buildingCount}
                    onChange={e => onCorporateDataChange({ ...corporateData, buildingCount: parseInt(e.target.value) || 1 })}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 text-slate-900 dark:text-white transition-all outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">We'll automatically add the required hubs to your package based on this number.</p>
              </div>
            </div>

            <div className="mt-8 relative">
              <button 
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 group"
              >
                Continue Setup <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PropertyTypeSelector;
