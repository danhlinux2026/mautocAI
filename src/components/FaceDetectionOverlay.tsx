import React, { useState } from 'react';
import { Scan, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { FaceBox } from '../../server/geminiService';

interface FaceDetectionOverlayProps {
  isScanning: boolean;
  detectedFaceShape?: string;
  confidence?: number;
  faceBox?: FaceBox;
  gender: 'female' | 'male';
}

export const FaceDetectionOverlay: React.FC<FaceDetectionOverlayProps> = ({
  isScanning,
  detectedFaceShape,
  confidence = 94,
  faceBox,
  gender,
}) => {
  const [showMesh, setShowMesh] = useState(false);

  // Default centered face box if not provided
  const box = faceBox || {
    topPercent: 16,
    leftPercent: 26,
    widthPercent: 48,
    heightPercent: 54,
  };

  // Only show camera viewfinder / laser brackets WHILE scanning
  if (!isScanning && !showMesh) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden rounded-2xl select-none">
      {/* Animated Scanning Laser Line during active detection only */}
      {isScanning && (
        <>
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_12px_#f43f5e] animate-[bounce_1.5s_infinite] opacity-90" />
          
          {/* Camera Face Target Brackets during active scanning */}
          <div
            className="absolute pointer-events-none transition-all duration-300"
            style={{
              top: `${box.topPercent}%`,
              left: `${box.leftPercent}%`,
              width: `${box.widthPercent}%`,
              height: `${box.heightPercent}%`,
            }}
          >
            <div className="absolute -top-1 -left-1 w-5 h-5 border-t-2 border-l-2 border-rose-500 rounded-tl shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <div className="absolute -top-1 -right-1 w-5 h-5 border-t-2 border-r-2 border-rose-500 rounded-tr shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-2 border-l-2 border-rose-500 rounded-bl shadow-[0_0_8px_rgba(244,63,94,0.6)]" />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-2 border-r-2 border-rose-500 rounded-br shadow-[0_0_8px_rgba(244,63,94,0.6)]" />

            <div className="absolute -bottom-6 inset-x-0 text-center">
              <span className="px-2 py-0.5 rounded-full bg-rose-600/90 text-white text-[9px] font-bold shadow-lg animate-pulse">
                Đang quét cấu trúc mặt...
              </span>
            </div>
          </div>
        </>
      )}

      {/* Floating Status Badge - cleanly centered at top, does not overlap corner tags or face */}
      {isScanning && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 pointer-events-auto">
          <div className="bg-stone-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-rose-500/40 shadow-xl flex items-center gap-1.5 text-xs text-rose-300 animate-pulse font-semibold">
            <Scan className="w-3.5 h-3.5 text-rose-400 animate-spin" />
            <span>AI đang nhận diện gương mặt...</span>
          </div>
        </div>
      )}
    </div>
  );
};
