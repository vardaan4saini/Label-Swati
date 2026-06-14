/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onCancel: () => void;
}

// Fixed admin credentials — no database needed
const ADMIN_EMAIL = 'labelswati@gmail.com';
const ADMIN_PASSWORD = 'Vaibhav@Mebula';

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Simulate a brief delay for realism
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        onLoginSuccess();
      } else {
        setError('Invalid credentials. Access denied.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-[#1a0a2e] to-stone-950 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Subtle animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-900/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#4C1D95]/5 rounded-full blur-3xl" />
      </div>

      {/* Scanline overlay for tech feel */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)'
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Back button */}
        <button
          onClick={onCancel}
          className="mb-6 flex items-center gap-1.5 text-stone-500 hover:text-stone-300 transition-colors text-xs font-mono tracking-wider group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          RETURN TO STOREFRONT
        </button>

        {/* Login Card */}
        <div className="bg-stone-900/80 backdrop-blur-xl border border-stone-800/60 rounded-xl p-8 shadow-2xl shadow-black/40">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#C2410C] via-[#9333EA] to-[#4C1D95] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-900/30">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-mono tracking-[0.3em] text-emerald-400/70 uppercase">Secured Node</span>
            </div>
            <h1 className="text-sm font-bold text-stone-100 tracking-[0.15em] uppercase font-mono">
              Admin Authorization
            </h1>
            <p className="text-[11px] text-stone-500 mt-1.5 font-sans leading-relaxed">
              Enter your master credentials to access the internal control dashboard.
            </p>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-xs text-rose-400 font-mono text-center"
            >
              ⛔ {error}
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono tracking-wider text-stone-400 uppercase">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(null); }}
                className="w-full text-xs p-3 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-200 placeholder-stone-600 focus:border-[#9333EA]/50 focus:outline-none focus:ring-1 focus:ring-[#9333EA]/20 transition-all font-mono"
                placeholder="admin@example.com"
                autoComplete="email"
                id="admin-login-email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-mono tracking-wider text-stone-400 uppercase">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(null); }}
                  className="w-full text-xs p-3 pr-10 bg-stone-800/50 border border-stone-700/50 rounded-lg text-stone-200 placeholder-stone-600 focus:border-[#9333EA]/50 focus:outline-none focus:ring-1 focus:ring-[#9333EA]/20 transition-all font-mono"
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  id="admin-login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              id="admin-login-submit"
              className="w-full py-3 bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] hover:opacity-90 disabled:opacity-60 text-white text-xs uppercase tracking-[0.2em] font-semibold rounded-lg transition-all shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Authorize Access →'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-5 border-t border-stone-800/40">
            <p className="text-[9px] text-stone-600 text-center font-mono tracking-wider leading-relaxed">
              LABEL SWATI ∙ INTERNAL SYSTEMS<br />
              UNAUTHORIZED ACCESS IS PROHIBITED
            </p>
          </div>
        </div>

        {/* Bottom security badge */}
        <div className="mt-4 flex items-center justify-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-stone-700" />
          <span className="text-[8px] font-mono tracking-[0.2em] text-stone-700 uppercase">
            256-Bit Encrypted Session
          </span>
          <span className="w-1 h-1 rounded-full bg-stone-700" />
        </div>
      </motion.div>
    </div>
  );
};
