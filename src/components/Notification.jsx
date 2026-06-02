import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, X } from 'lucide-react';

export default function Notification({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-400" />;
      default:
        return null;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 shadow-emerald-950/20';
      case 'warning':
        return 'border-amber-500/30 shadow-amber-950/20';
      case 'error':
        return 'border-rose-500/30 shadow-rose-950/20';
      default:
        return 'border-white/10';
    }
  };

  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-4 py-3 bg-slate-900/90 backdrop-blur-md border ${getBorderColor()} rounded-xl shadow-lg toast-slide-in`}>
      {getIcon()}
      <p className="text-sm font-medium text-slate-100 pr-4">{message}</p>
      <button 
        onClick={onClose} 
        className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
