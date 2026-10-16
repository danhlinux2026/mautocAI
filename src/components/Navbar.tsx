import React from 'react';
import { Sparkles, Scissors, UserCheck, LayoutGrid, Layers, Cpu, Settings } from 'lucide-react';

interface NavbarProps {
  activeTab: 'studio' | 'analyzer' | 'compare' | 'gallery';
  setActiveTab: (tab: 'studio' | 'analyzer' | 'compare' | 'gallery') => void;
  gender: 'female' | 'male';
  setGender: (gender: 'female' | 'male') => void;
  savedLooksCount: number;
  selectedEngine: 'gemini' | 'agnes' | 'canvas';
  onOpenAgnesConfig: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  gender,
  setGender,
  savedLooksCount,
  selectedEngine,
  onOpenAgnesConfig,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-md border-b border-stone-800/80 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <Scissors className="w-5 h-5 text-white transform -rotate-45" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-stone-100 via-rose-200 to-amber-200 bg-clip-text text-transparent font-serif-display">
                AI Hair Studio
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 2026 AI Edition
              </span>
            </div>
            <p className="text-xs text-stone-400 hidden sm:block">
              Giả Lập & Tư Vấn Kiểu Tóc Salon Đẳng Cấp
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-stone-900/90 p-1 rounded-xl border border-stone-800 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'studio'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Thử Tóc (Studio)</span>
          </button>

          <button
            onClick={() => setActiveTab('analyzer')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'analyzer'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Tư Vấn Khuôn Mặt</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-all relative ${
              activeTab === 'gallery'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Bộ Sưu Tập</span>
            {savedLooksCount > 0 && (
              <span className="w-4 h-4 bg-amber-500 text-stone-950 font-bold text-[10px] rounded-full flex items-center justify-center ml-0.5">
                {savedLooksCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Section: Agnes AI & Gender Toggle */}
        <div className="flex items-center gap-2">
          {/* Agnes AI Config Button */}
          <button
            onClick={onOpenAgnesConfig}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
              selectedEngine === 'agnes'
                ? 'bg-sky-950/80 border-sky-500 text-sky-300 ring-1 ring-sky-500/40 shadow-md'
                : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-300'
            }`}
            title="Cấu hình Agnes API"
          >
            <Cpu className="w-3.5 h-3.5 text-sky-400" />
            <span>Agnes API</span>
            {selectedEngine === 'agnes' && (
              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse ml-0.5" />
            )}
          </button>

          {/* Gender Toggle */}
          <div className="flex items-center gap-1 bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
            <button
              onClick={() => setGender('female')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                gender === 'female'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Nữ
            </button>
            <button
              onClick={() => setGender('male')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                gender === 'male'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Nam
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
