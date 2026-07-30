import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { Package } from '../context/CatalogContext';

interface UseCaseCardProps {
  pkg: Package;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}

const UseCaseCard: React.FC<UseCaseCardProps> = ({ pkg, quantity, onAdd, onRemove }) => {
  return (
    <div className={`flex flex-col bg-white dark:bg-slate-900 rounded-3xl border-2 transition-all overflow-hidden ${quantity > 0 ? 'border-blue-500 shadow-lg shadow-blue-500/10' : 'border-slate-200 dark:border-slate-800 hover:border-blue-300'}`}>
      
      {/* Illustration Area */}
      <div className="relative w-full aspect-[4/3] bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center overflow-hidden border-b border-slate-100 dark:border-slate-800">
        <img 
          src={pkg.image_url} 
          alt={pkg.goal}
          className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
        />
      </div>

      <div className="p-6 flex-1 flex flex-col">
        {/* Goal */}
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white leading-snug mb-6 flex-1">
          "{pkg.goal}"
        </h3>

        {/* Sub-Question & Controls */}
        <div className="mt-auto bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-5 text-center leading-relaxed">
            {pkg.sub_question}
          </p>
          
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              disabled={quantity <= 0}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                quantity <= 0 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
              }`}
            >
              <Minus className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-slate-900 dark:text-white w-12 text-center select-none">
                {quantity}
              </span>
              {quantity > 0 && (
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider text-center mt-0.5 block h-3">
                  Added
                </span>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onAdd();
              }}
              className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UseCaseCard;
