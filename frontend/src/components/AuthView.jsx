import React, { useState } from 'react';
import { Sparkles, Utensils, CheckCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import API from '../api';

export default function AuthView({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = mode === 'login'
        ? await API.login({ email, password })
        : await API.register({ email, password });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    const demoEmail = 'demo@nutritrack.com';
    const demoPass = 'health2026';

    try {
      // Try login first, if user not found register
      let data;
      try {
        data = await API.login({ email: demoEmail, password: demoPass });
      } catch (loginErr) {
        data = await API.register({ email: demoEmail, password: demoPass });
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onAuth(data.user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden font-body-md">
      
      {/* Ambient background botanical aura */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl p-8 shadow-xl border border-surface-container relative z-10 flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-fixed flex items-center justify-center shadow-md mb-3">
            <Sparkles size={28} />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md text-primary font-bold tracking-tight">
              NutriTrack
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-caps text-label-caps uppercase font-bold text-[10px]">
              PRO
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1 text-sm">
            Clinical Wellness &amp; Metabolic Diagnostic Tracker
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex bg-surface-container-low p-1 rounded-xl border border-surface-container">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`flex-1 py-2 text-label-md font-bold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`flex-1 py-2 text-label-md font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-error-container/40 border border-error-container text-error rounded-xl text-body-sm font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
              Email Address
            </label>
            <input 
              type="email"
              required
              placeholder="sarah.jenkins@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full p-3 bg-surface-container-low border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body-md font-medium"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-label-caps text-label-caps uppercase text-outline font-bold text-[10px]">
              Password
            </label>
            <input 
              type="password"
              required
              minLength={6}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-3 bg-surface-container-low border border-surface-container rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-body-md font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold rounded-xl transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to NutriTrack' : 'Complete Registration'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-surface-container" />
          <span className="flex-shrink mx-3 text-outline font-label-caps text-[11px] uppercase font-bold">
            Or Instant Access
          </span>
          <div className="flex-grow border-t border-surface-container" />
        </div>

        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full py-2.5 bg-secondary-container text-on-secondary-fixed-variant hover:bg-secondary font-label-md font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          <span>Launch 1-Click Interactive Demo</span>
        </button>

        {/* Footer Guarantee */}
        <div className="flex items-center justify-center gap-2 text-outline text-[12px] pt-2 border-t border-surface-container">
          <ShieldCheck size={15} className="text-secondary" />
          <span>Encrypted Clinical-Grade Data Storage</span>
        </div>

      </div>

    </div>
  );
}
