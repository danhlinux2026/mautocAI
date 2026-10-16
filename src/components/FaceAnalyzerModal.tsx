import React from 'react';
import { FaceAnalysisResult } from '../../server/geminiService';
import { Sparkles, UserCheck, CheckCircle2, XCircle, Lightbulb, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { Hairstyle } from '../data/hairStyles';

interface FaceAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  analysisResult: FaceAnalysisResult | null;
  onApplyRecommendedStyle: (styleName: string) => void;
  availableStyles: Hairstyle[];
}

export const FaceAnalyzerModal: React.FC<FaceAnalyzerModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  analysisResult,
  onApplyRecommendedStyle,
  availableStyles,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl no-scrollbar flex flex-col gap-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-900/30">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-100 font-serif-display">
              Phân Tích Khuôn Mặt & Tư Vấn Tóc AI
            </h2>
            <p className="text-xs text-stone-400">
              Công nghệ AI Master Stylist phân tích nhân trắc học khuôn mặt và đề xuất kiểu tóc tối ưu
            </p>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center justify-center gap-4 text-center">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-rose-500/20 border-t-rose-500 animate-spin" />
              <div className="absolute inset-3 rounded-full border-4 border-amber-500/20 border-b-amber-500 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
              <UserCheck className="w-8 h-8 text-rose-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-stone-200">
                AI đang quét các điểm mốc trên gương mặt...
              </span>
              <span className="text-xs text-stone-400">
                Đo đạc tỷ lệ gò má, trán, cằm và xác định dáng mặt chuẩn xác
              </span>
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && analysisResult && (
          <div className="flex flex-col gap-5">
            {/* Top Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-950/70 border border-stone-800">
              <div className="flex flex-col">
                <span className="text-[11px] text-stone-400 font-medium">Dáng Khuôn Mặt</span>
                <span className="text-lg font-bold text-rose-400 font-serif-display">
                  {analysisResult.faceShape}
                </span>
                <span className="text-[10px] text-stone-500">
                  {analysisResult.faceShapeEnglish} • Độ tin cậy {analysisResult.confidence}%
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-stone-400 font-medium">Tông Da & Sắc Tố</span>
                <span className="text-sm font-bold text-stone-200 mt-1">
                  {analysisResult.skinTone}
                </span>
                <span className="text-[10px] text-amber-400 font-semibold">
                  Undertone: {analysisResult.undertone}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] text-stone-400 font-medium">Đặc Điểm Nổi Bật</span>
                <ul className="text-[11px] text-stone-300 list-disc list-inside mt-0.5 space-y-0.5">
                  {analysisResult.characteristics.slice(0, 2).map((char, i) => (
                    <li key={i} className="truncate">{char}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Styles */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                  Top Kiểu Tóc Tôn Dáng Mặt Nhất
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {analysisResult.recommendedStyles.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-950/50 border border-stone-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                          {item.name}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          {item.suitabilityScore}% Hợp
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
                        {item.reason}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        onApplyRecommendedStyle(item.name);
                        onClose();
                      }}
                      className="w-full mt-1 py-1.5 px-3 rounded-xl bg-stone-800 hover:bg-emerald-600 text-stone-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <span>Thử kiểu này ngay</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Styles to Avoid */}
            {analysisResult.stylesToAvoid && analysisResult.stylesToAvoid.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Kiểu Tóc Nên Tránh (Dễ lộ khuyết điểm)</span>
                </div>
                {analysisResult.stylesToAvoid.map((avoid, idx) => (
                  <div key={idx} className="text-xs text-stone-300 flex items-start gap-2">
                    <span className="font-semibold text-rose-300 shrink-0">• {avoid.name}:</span>
                    <span className="text-stone-400">{avoid.reason}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Recommended Colors */}
            {analysisResult.recommendedColors && analysisResult.recommendedColors.length > 0 && (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-stone-100 uppercase tracking-wider">
                    Màu Nhuộm Tôn Da Khuyên Dùng
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {analysisResult.recommendedColors.map((col, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-stone-950/60 border border-stone-800 flex items-center gap-3"
                    >
                      <div
                        className="w-8 h-8 rounded-full shrink-0 border border-white/30 shadow-md"
                        style={{ backgroundColor: col.hex }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-200">{col.name}</span>
                        <span className="text-[11px] text-stone-400">{col.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stylist Pro Tips */}
            {analysisResult.stylistTips && analysisResult.stylistTips.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-950/15 border border-amber-900/30 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4" />
                  <span>Lời Khuyên Vàng Từ Master Stylist</span>
                </div>
                <ul className="text-xs text-stone-300 space-y-1 list-disc list-inside">
                  {analysisResult.stylistTips.map((tip, idx) => (
                    <li key={idx} className="leading-relaxed">{tip}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
