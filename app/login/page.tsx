'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';

// 初始化 Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://knnpacipzzyvluchbykb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtubnBhY2lwenp5dmx1Y2hieWtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczODM2NjYsImV4cCI6MjEwMjk1OTY2Nn0.NnP85JAAv5KP-8_iWpEkgG_D9dwlbB68-mh-x6clNFA';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 表单状态
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg(''); // 用户输入时清空报错
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        // ----------------- 登录逻辑 -----------------
        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;
        
        // 登录成功，跳转回首页 (Dashboard)
        router.push('/');
        router.refresh(); 
        
      } else {
        // ----------------- 注册逻辑 -----------------
        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              phone: formData.phone,
              role: 'coach', 
            }
          }
        });

        if (error) throw error;

        setSuccessMsg('Account created successfully! Logging you in...');
        setTimeout(() => {
          router.push('/');
          router.refresh();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setErrorMsg(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-gray-50 flex flex-col justify-center px-6 py-12 relative overflow-hidden">
      
      {/* 顶部背景装饰 */}
      <div className="absolute top-0 left-0 w-full h-64 bg-blue-600 rounded-b-[3rem] shadow-lg pointer-events-none">
        <div className="absolute inset-0 bg-blue-700/20 mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto">
        {/* Logo 与欢迎语 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-4">
            {/* 🏀 专属篮球 SVG 图标 */}
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2v20" />
              <path d="M4.93 4.93A10 10 0 0 1 9.9 12a10 10 0 0 1-4.97 7.07" />
              <path d="M19.07 19.07A10 10 0 0 1 14.1 12a10 10 0 0 1 4.97-7.07" />
            </svg>
          </div>
          {/* 📝 标题修改 */}
          <h1 className="text-3xl font-black text-white">Basketball Academy</h1>
          <p className="text-blue-100 font-medium mt-1">Operating System</p>
        </div>

        {/* 登录/注册表单卡片 */}
        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-2xl font-black text-gray-900 mb-6">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>

          {errorMsg && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold mb-6 border border-red-100 flex items-start">
              <span className="shrink-0 mr-2 mt-0.5">⚠️</span>
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="bg-green-50 text-green-600 p-4 rounded-xl text-sm font-bold mb-6 border border-green-100 flex items-start">
              <span className="shrink-0 mr-2 mt-0.5">✅</span>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="email"
                name="email"
                required
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-4 top-4 text-gray-400" />
              <input
                type="password"
                name="password"
                required
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3.5 text-[15px] font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-black text-lg py-4 rounded-2xl mt-4 flex items-center justify-center active:bg-blue-700 active:scale-[0.98] transition-all shadow-[0_8px_20px_-8px_rgba(37,99,235,0.5)] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <>
                  <span>{isLogin ? 'Sign In' : 'Sign Up'}</span>
                  <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </button>
          </form>

          {/* 切换登录/注册 */}
          <div className="mt-8 text-center">
            <p className="text-sm font-bold text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg('');
                  setFormData({ email: '', password: '', fullName: '', phone: '' });
                }}
                className="ml-2 text-blue-600 hover:text-blue-700 active:text-blue-800 transition-colors"
              >
                {isLogin ? 'Create one' : 'Sign in here'}
              </button>
            </p>
          </div>
        </div>
        
        <p className="text-center text-xs font-bold text-gray-400 mt-8">
          &copy; {new Date().getFullYear()} Basketball Academy Management PWA
        </p>
      </div>
    </div>
  );
}