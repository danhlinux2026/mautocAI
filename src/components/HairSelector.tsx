import React, { useState, useMemo } from 'react';
import { Hairstyle } from '../data/hairStyles';
import { Search, Sparkles, Filter, Check } from 'lucide-react';

interface HairSelectorProps {
  hairstyles: Hairstyle[];
  selectedStyle: Hairstyle;
  onSelectStyle: (style: Hairstyle) => void;
  gender: 'female' | 'male';
  detectedFaceShape?: string;
}

export const HairSelector: React.FC<HairSelectorProps> = ({
  hairstyles,
  selectedStyle,
  onSelectStyle,
  gender,
  detectedFaceShape,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLength, setSelectedLength] = useState<'all' | 'short' | 'medium' | 'long'>('all');
  const [selectedVibe, setSelectedVibe] = useState<'all' | 'korean' | 'classic' | 'edgy' | 'elegant' | 'casual'>('all');

  const filteredStyles = useMemo(() => {
    return hairstyles.filter((style) => {
      // Gender filter
      if (style.gender !== 'unisex' && style.gender !== gender) {
        return false;
      }
      // Length filter
      if (selectedLength !== 'all' && style.length !== selectedLength) {
        return false;
      }
      // Vibe filter
      if (selectedVibe !== 'all' && style.vibe !== selectedVibe) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = style.name.toLowerCase().includes(q);
        const matchEng = style.englishName.toLowerCase().includes(q);
        const matchDesc = style.description.toLowerCase().includes(q);
        const matchTags = style.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchName && !matchEng && !matchDesc && !matchTags) return false;
      }
      return true;
    });
  }, [hairstyles, gender, selectedLength, selectedVibe, searchQuery]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header & Filter Controls */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5 uppercase tracking-wider">
            <span>Chọn Kiểu Tóc ({filteredStyles.length})</span>
          </h3>
          {detectedFaceShape && (
            <span className="text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium">
              <Sparkles className="w-3 h-3" /> Gợi ý cho {detectedFaceShape}
            </span>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên kiểu tóc (Layer, Wolf Cut, Mullet, Bob...)"
            className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
            <button
              onClick={() => setSelectedLength('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedLength === 'all'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tất cả độ dài
            </button>
            <button
              onClick={() => setSelectedLength('short')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedLength === 'short'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Ngắn
            </button>
            <button
              onClick={() => setSelectedLength('medium')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedLength === 'medium'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Ngang vai
            </button>
            <button
              onClick={() => setSelectedLength('long')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedLength === 'long'
                  ? 'bg-rose-500/20 text-rose-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Dài
            </button>
          </div>

          <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
            <button
              onClick={() => setSelectedVibe('all')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedVibe === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Tất cả gu
            </button>
            <button
              onClick={() => setSelectedVibe('korean')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedVibe === 'korean'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Hàn Quốc
            </button>
            <button
              onClick={() => setSelectedVibe('classic')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedVibe === 'classic'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Cổ điển
            </button>
            <button
              onClick={() => setSelectedVibe('edgy')}
              className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all ${
                selectedVibe === 'edgy'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Cá tính
            </button>
          </div>
        </div>
      </div>

      {/* Hairstyles Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
        {filteredStyles.map((style) => {
          const isSelected = selectedStyle.id === style.id;
          const isBestForFace = detectedFaceShape
            ? style.bestForFaces.some((f) => f.toLowerCase().includes(detectedFaceShape.toLowerCase().replace('mặt ', '')))
            : false;

          return (
            <button
              key={style.id}
              onClick={() => onSelectStyle(style)}
              className={`group relative text-left rounded-xl overflow-hidden border p-2 transition-all flex flex-col gap-2 ${
                isSelected
                  ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg shadow-rose-950/50'
                  : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-800/60'
              }`}
            >
              {/* Thumbnail */}
              <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-stone-950">
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />

                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                )}

                {isBestForFace && !isSelected && (
                  <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-full bg-amber-500/90 text-stone-950 font-extrabold text-[9px] shadow-md flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> Hợp mặt
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent p-1.5 pt-4">
                  <span className="text-[10px] font-semibold text-rose-300 uppercase tracking-wider block">
                    {style.englishName}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-bold text-stone-100 line-clamp-1 group-hover:text-rose-300 transition-colors">
                  {style.name}
                </span>
                <span className="text-[11px] text-stone-400 line-clamp-1">
                  Độ khó: {style.stylingDifficulty}
                </span>

                <div className="flex items-center gap-1 mt-1 flex-wrap">
                  {style.tags.slice(0, 2).map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[9px] px-1.5 py-0.5 rounded bg-stone-800 text-stone-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}

        {filteredStyles.length === 0 && (
          <div className="col-span-full py-8 text-center text-xs text-stone-500">
            Không tìm thấy kiểu tóc phù hợp với bộ lọc hiện tại. Thử chọn &quot;Tất cả&quot;.
          </div>
        )}
      </div>
    </div>
  );
};
