import React from 'react';
import { useCatalog } from '../context/CatalogContext';

interface OrderSummaryGridProps {
  cart: Record<string, number>;
}

const OrderSummaryGrid: React.FC<OrderSummaryGridProps> = ({ cart }) => {
  const { packages, products } = useCatalog();

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Gateway Card */}
      {cart['snos-core-gateway'] > 0 && (
        <div className="flex flex-col bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700">
          <div className="flex-1 flex flex-col items-center justify-center text-center mb-6">
            <h5 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight mb-2">SNOS Core Gateway</h5>
            <span className="text-sm text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full">Automatically Included</span>
          </div>
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hardware Provided</h6>
            <ul className="text-sm font-semibold text-slate-900 dark:text-white">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs text-slate-500">{cart['snos-core-gateway']}</span>
                <span>Gateway Hub (Brain)</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Package Cards */}
      {Object.entries(cart).map(([id, qty]) => {
        if (qty === 0 || id === 'snos-core-gateway') return null;
        const pkg = packages.find(p => p.id === id);
        if (!pkg) return null;

        return (
          <div key={id} className="flex flex-col bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-700">
            <div className="flex-1 flex flex-col items-center text-center mb-6">
              <div className="w-32 h-32 mb-4 flex items-center justify-center">
                <img src={pkg.image_url} alt="" className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
              </div>
              <h5 className="font-extrabold text-lg text-slate-900 dark:text-white leading-tight mb-2">"{pkg.goal}"</h5>
            </div>
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Hardware Provided</h6>
              <ul className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {pkg.included_products.map((prodId, idx) => {
                  const product = products.find(p => p.id === prodId);
                  return (
                    <li key={idx} className="flex items-center gap-2 mt-2">
                      <span className="w-5 h-5 rounded bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-xs text-blue-600 dark:text-blue-400">{qty}</span>
                      <span>{product ? product.name : prodId}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default OrderSummaryGrid;
