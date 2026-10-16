import React, { useState } from 'react';
import { Download, Share2, X, Check, FileText } from 'lucide-react';

interface SalonCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardImageUrl: string | null;
  styleName: string;
  colorName: string;
}

export const SalonCardModal: React.FC<SalonCardModalProps> = ({
  isOpen,
  onClose,
  cardImageUrl,
  styleName,
  colorName,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !cardImageUrl) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = cardImageUrl;
    link.download = `The-Tu-Van-Salon-${styleName.replace(/\s+/g, '-')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        // Convert base64 to blob
        const res = await fetch(cardImageUrl);
        const blob = await res.blob();
        const file = new File([blob], 'the-tu-van-toc.jpg', { type: 'image/jpeg' });
        await navigator.share({
          title: `Kiểu tóc ${styleName} - AI Hair Studio`,
          text: `Xem thử kiểu tóc ${styleName} màu ${colorName} của tôi trên AI Hair Studio!`,
          files: [file],
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl no-scrollbar flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600/20 text-rose-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif-display">
                Thẻ Tư Vấn Salon Chuyên Nghiệp
              </h3>
              <p className="text-xs text-stone-400">
                Lưu thẻ này để đưa cho thợ cắt tóc & nhuộm chuẩn xác 100%
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card Image Display */}
        <div className="rounded-2xl overflow-hidden border border-stone-800 shadow-2xl bg-black">
          <img
            src={cardImageUrl}
            alt="Thẻ tư vấn salon"
            className="w-full h-auto object-contain max-h-[620px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            onClick={handleShare}
            className="flex-1 py-3 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-stone-700"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Đã sao chép link</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ cho bạn bè</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 transition-all transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tải Thẻ Salon Về Máy (HD)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
