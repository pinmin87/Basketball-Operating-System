'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ShieldCheck, Mail, Lock, ArrowRight, Loader2, Play } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 🚀 核心修复：直接在页面内初始化 Supabase，100% 避免路径找不到的 Error
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [academyName, setAcademyName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/');
      } else {
        if (!academyName.trim()) throw new Error('Academy Name is required.');

        const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
        if (authError) throw authError;

        if (authData.user) {
          const { data: academyData, error: acError } = await supabase
            .from('academies')
            .insert([{ name: academyName }])
            .select()
            .single();
          if (acError) throw acError;

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: authData.user.id, academy_id: academyData.id, role: 'ADMIN' }]);
          if (profileError) throw profileError;

          router.push('/');
        }
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-center items-center p-6 relative overflow-hidden antialiased">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-20%] w-[60vw] h-[60vw] bg-neutral-800/80 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="w-full max-w-sm relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-12 text-center">
          <div className="bg-white text-black w-16 h-16 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl">
            <Play size={28} className="ml-1" fill="currentColor" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter mb-2">Hoop OS.</h1>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Academy Management</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Academy Name</label>
              <div className="relative">
                <ShieldCheck size={18} className="absolute left-4 top-4 text-gray-500" />
                <input 
                  type="text" 
                  value={academyName} 
                  onChange={(e) => setAcademyName(e.target.value)} 
                  required={!isLogin}
                  placeholder="e.g. Elite Hoops Academy" 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[16px] font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all" 
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-4 text-gray-500" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="coach@academy.com" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[16px] font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all" 
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-4 text-gray-500" />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-[16px] font-bold text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all" 
              />
            </div>
          </div>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl text-center animate-in fade-in mt-2">
              <p className="text-[12px] font-bold text-red-400">{errorMsg}</p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-white hover:bg-gray-200 text-black font-black text-[15px] uppercase tracking-wide py-4 rounded-full mt-6 active:scale-95 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {loading ? <Loader2 size={20} className="animate-spin text-black" /> : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            type="button" 
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }} 
            className="text-[12px] font-bold text-gray-500 hover:text-white transition-colors"
          >
            {isLogin ? "New to Hoop OS? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}