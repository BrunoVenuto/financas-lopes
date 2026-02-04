
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => (
  <div className={`glass rounded-3xl p-6 overflow-hidden ${className}`}>
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-2xl font-semibold transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50";
  const variants = {
    primary: "bg-gradient-to-br from-tanzine-400 to-tanzine-600 text-white shadow-lg shadow-tanzine-500/20",
    secondary: "bg-snappy-400 hover:bg-snappy-500 text-white shadow-lg shadow-snappy-500/20",
    ghost: "bg-white/5 hover:bg-white/10 text-white",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const SectionTitle: React.FC<{ title: string; action?: React.ReactNode }> = ({ title, action }) => (
  <div className="flex items-center justify-between mb-4 mt-6 px-1">
    <h2 className="text-xl font-display font-bold text-white/90">{title}</h2>
    {action && <div className="text-tanzine-200">{action}</div>}
  </div>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, ...props }) => (
  <div className="space-y-1.5 w-full">
    {label && <label className="text-xs font-semibold text-tanzine-200 uppercase tracking-wider ml-1">{label}</label>}
    <input 
      {...props}
      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-tanzine-400 transition-all placeholder:text-white/20"
    />
  </div>
);
