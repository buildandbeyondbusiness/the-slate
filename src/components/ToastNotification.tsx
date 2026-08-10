import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastProps {
  message: string | null;
}

export const ToastNotification: React.FC<ToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="px-5 py-3 rounded-full bg-slate-900/90 border border-white/20 backdrop-blur-2xl text-white shadow-2xl flex items-center gap-3">
        <Sparkles className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '3s' }} />
        <span className="text-xs font-bold tracking-wide">{message}</span>
      </div>
    </div>
  );
};
