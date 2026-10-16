import React from 'react';
import { X, Layers, Check, Trash2, ArrowUpRight } from 'lucide-react';

export interface SavedLook {
  id: string;
  timestamp: number;
  styleName: string;
  styleEnglishName: string;
  colorName: string;
  colorHex: string;
  imageUrl: string;
  originalImageUrl: string;
}

interface MultiComparisonModalProps {
  savedLooks: SavedLook[];
  onSelectAsCurrent: (look: SavedLook) => void;
  onDeleteLook: (id: string) => void;
  onClose: () => void;
}

export const MultiComparisonModal: React.FC<MultiComparisonModalProps> = ({
  savedLooks,
  onSelectAsCurrent,
  onDeleteLook,
  onClose,
}) => {
  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 sm:p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-100 font-serif-display">
              Bảng So Sánh Đa Kiểu Tóc ({savedLooks.length} mẫu đã lưu)
            </h2>
            <p className="text-xs text-stone-400">
              Đặt các kiểu tóc và màu nhuộm khác nhau cạnh nhau để chọn ra phong cách ưng ý nhất
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Looks */}
      {savedLooks.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-3 bg-stone-900/40 rounded-3xl border border-stone-800 p-8">
          <div className="w-16 h-16 rounded-2xl bg-stone-800 flex items-center justify-center text-stone-500">
            <Layers className="w-8 h-8" />
          </div>
          <p className="text-sm font-semibold text-stone-300">
            Chưa có kiểu tóc nào được lưu vào danh sách so sánh
          </p>
          <p className="text-xs text-stone-500 max-w-md">
            Khi thử tóc ở màn hình Studio, hãy nhấn nút &quot;Lưu Vào So Sánh&quot; để đối chiếu nhiều kiểu tóc cùng lúc tại đây.
          </p>
          <button
            onClick={onClose}
            className="mt-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-colors"
          >
            Quay lại Studio thử tóc
          </button>
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            savedLooks.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : savedLooks.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : savedLooks.length === 3
              ? 'grid-cols-1 sm:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}
        >
          {savedLooks.map((look) => (
            <div
              key={look.id}
              className="group relative rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 hover:border-rose-500/50 transition-all flex flex-col shadow-xl"
            >
              {/* Image Container */}
              <div className="relative aspect-[3/4] w-full bg-black overflow-hidden">
                <img
                  src={look.imageUrl}
                  alt={look.styleName}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Color Pill */}
                <div className="absolute top-3 left-3 bg-stone-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-semibold text-stone-200 border border-white/10 flex items-center gap-1.5 shadow-md">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/30"
                    style={{ backgroundColor: look.colorHex }}
                  />
                  <span>{look.colorName}</span>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => onDeleteLook(look.id)}
                  className="absolute top-3 right-3 w-7 h-7 rounded-full bg-stone-950/80 hover:bg-rose-600 text-stone-400 hover:text-white flex items-center justify-center transition-colors shadow-md"
                  title="Xóa mẫu này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Info & Select */}
              <div className="p-3.5 flex flex-col justify-between gap-2.5 flex-1 bg-stone-900">
                <div>
                  <h4 className="text-sm font-bold text-stone-100">{look.styleName}</h4>
                  <span className="text-[11px] text-rose-400 font-medium">
                    {look.styleEnglishName}
                  </span>
                </div>

                <button
                  onClick={() => {
                    onSelectAsCurrent(look);
                    onClose();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-rose-600 text-stone-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <span>Chỉnh sửa kiểu này</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
