import React, { useState } from 'react';
import { HairColor } from '../data/hairStyles';
import { Sparkles, Sliders, Check, AlertCircle } from 'lucide-react';
import { SimulationOptions } from '../utils/hairCanvas';

interface ColorSelectorProps {
  colors: HairColor[];
  selectedColor: HairColor;
  onSelectColor: (color: HairColor) => void;
  simulationOptions: SimulationOptions;
  onChangeOptions: (opts: Partial<SimulationOptions>) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelectColor,
  simulationOptions,
  onChangeOptions,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'natural' | 'fashion' | 'pastel' | 'highlight'>('all');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const filteredColors = colors.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider flex items-center gap-1.5">
          <span>Bảng Màu Nhuộm ({filteredColors.length})</span>
        </h3>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 transition-colors"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Thu gọn' : 'Chỉnh độ bóng & sáng'}</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800 text-xs overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeCategory === 'all'
              ? 'bg-rose-500/20 text-rose-300 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Tất cả
        </button>
        <button
          onClick={() => setActiveCategory('natural')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeCategory === 'natural'
              ? 'bg-rose-500/20 text-rose-300 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Tự nhiên
        </button>
        <button
          onClick={() => setActiveCategory('fashion')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeCategory === 'fashion'
              ? 'bg-rose-500/20 text-rose-300 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Thời thượng
        </button>
        <button
          onClick={() => setActiveCategory('pastel')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeCategory === 'pastel'
              ? 'bg-rose-500/20 text-rose-300 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Pastel
        </button>
        <button
          onClick={() => setActiveCategory('highlight')}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
            activeCategory === 'highlight'
              ? 'bg-rose-500/20 text-rose-300 font-semibold'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          Balayage / Highlight
        </button>
      </div>

      {/* Swatches Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar">
        {filteredColors.map((color) => {
          const isSelected = selectedColor.id === color.id;
          return (
            <button
              key={color.id}
              onClick={() => onSelectColor(color)}
              className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all relative ${
                isSelected
                  ? 'bg-stone-900 border-rose-500 ring-2 ring-rose-500/30'
                  : 'bg-stone-900/60 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
              }`}
            >
              {/* Color Swatch Circle */}
              <div
                className="w-8 h-8 rounded-full shrink-0 shadow-inner border border-white/20 relative flex items-center justify-center overflow-hidden"
                style={{ background: color.gradient || color.hex }}
              >
                {/* Light sheen overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none" />
                {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
              </div>

              {/* Color Info */}
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-stone-200 truncate">
                  {color.name}
                </span>
                <span className="text-[10px] text-stone-400 truncate">
                  {color.englishName}
                </span>
                {color.requiresBleach && (
                  <span className="text-[9px] text-amber-400 font-medium">
                    ⚡ Cần tẩy tóc
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Color Note */}
      <div className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 text-xs text-stone-300 flex items-start gap-2">
        <div
          className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 border border-white/30"
          style={{ background: selectedColor.gradient || selectedColor.hex }}
        />
        <div className="flex-1">
          <span className="font-semibold text-stone-100">{selectedColor.name}: </span>
          <span className="text-stone-400">{selectedColor.description}</span>
          <div className="mt-1 flex items-center gap-2 text-[11px] text-stone-400">
            <span>Hợp với: {selectedColor.skinToneMatch.join(', ')}</span>
          </div>
        </div>
      </div>

      {/* Advanced Sliders (Intensity, Gloss, Brightness) */}
      {showAdvanced && (
        <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-col gap-3 animate-fadeIn">
          {/* Intensity Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-300 font-medium">Cường độ màu nhuộm (Vibrancy)</span>
              <span className="text-rose-400 font-bold">{simulationOptions.intensity}%</span>
            </div>
            <input
              type="range"
              min={20}
              max={100}
              value={simulationOptions.intensity}
              onChange={(e) => onChangeOptions({ intensity: Number(e.target.value) })}
              className="w-full accent-rose-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Gloss & Sheen Slider */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-300 font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Độ bóng mượt (Gloss & Shine)
              </span>
              <span className="text-amber-400 font-bold">{simulationOptions.gloss}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={simulationOptions.gloss}
              onChange={(e) => onChangeOptions({ gloss: Number(e.target.value) })}
              className="w-full accent-amber-500 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>

          {/* Brightness Offset */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-stone-300 font-medium">Độ sáng nâng tone</span>
              <span className="text-stone-400 font-bold">
                {simulationOptions.brightness > 0 ? `+${simulationOptions.brightness}` : simulationOptions.brightness}%
              </span>
            </div>
            <input
              type="range"
              min={-30}
              max={30}
              value={simulationOptions.brightness}
              onChange={(e) => onChangeOptions({ brightness: Number(e.target.value) })}
              className="w-full accent-stone-400 cursor-pointer h-1.5 bg-stone-800 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};
