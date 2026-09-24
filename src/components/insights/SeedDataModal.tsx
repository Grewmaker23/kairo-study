import React from 'react';
import { X, Sparkles, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

interface SeedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDataset: (type: 'learned' | 'cold_start') => void;
  currentType: 'learned' | 'cold_start';
}

export const SeedDataModal: React.FC<SeedDataModalProps> = ({
  isOpen,
  onClose,
  onSelectDataset,
  currentType
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="studio-panel w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-sky-400" />
            <h3 className="text-base font-heading font-bold text-white">
              Demonstration & Learning Profiles
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Switch between student states to verify how the Bayesian learning engine adjusts time predictions and circadian timeline slots.
        </p>

        <div className="space-y-3">
          {/* Option 1: Midterm Crunch - Trained Habits */}
          <div
            onClick={() => {
              onSelectDataset('learned');
              onClose();
            }}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              currentType === 'learned'
                ? 'bg-sky-500/10 border-sky-400 ring-1 ring-sky-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Week 3: Trained Habits (14 Past Events)</span>
              </span>
              {currentType === 'learned' && (
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Demonstrates <strong>+40% underestimation in Math</strong>, morning peak focus (9–11 AM), and auto-slotting of quick admin tasks into post-lunch dips.
            </p>
          </div>

          {/* Option 2: Fresh Student - Cold Start */}
          <div
            onClick={() => {
              onSelectDataset('cold_start');
              onClose();
            }}
            className={`p-4 rounded-xl border cursor-pointer transition ${
              currentType === 'cold_start'
                ? 'bg-sky-500/10 border-sky-400 ring-1 ring-sky-500/30'
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-sky-400" />
                <span>Day 1: Fresh Student (Cold Start)</span>
              </span>
              {currentType === 'cold_start' && (
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Zero completion history. Demonstrates the transparent <strong>circadian student baseline</strong> and prompts you to log completions to train your curve.
            </p>
          </div>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs font-mono text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
