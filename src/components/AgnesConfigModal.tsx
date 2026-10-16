import React, { useState } from 'react';
import { X, Check, Key, Globe, Cpu, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { AgnesConfig } from '../../server/agnesService';

interface AgnesConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEngine: 'gemini' | 'agnes' | 'canvas';
  onSelectEngine: (engine: 'gemini' | 'agnes' | 'canvas') => void;
  agnesConfig: AgnesConfig;
  onSaveAgnesConfig: (config: AgnesConfig) => void;
  showToast: (msg: string) => void;
}

export const AgnesConfigModal: React.FC<AgnesConfigModalProps> = ({
  isOpen,
  onClose,
  selectedEngine,
  onSelectEngine,
  agnesConfig,
  onSaveAgnesConfig,
  showToast,
}) => {
  const [apiKey, setApiKey] = useState(agnesConfig.apiKey || '');
  const [baseUrl, setBaseUrl] = useState(agnesConfig.baseUrl || 'https://apihub.agnes-ai.com/v1');
  const [model, setModel] = useState(agnesConfig.model || 'agnes-image-2.5-flash');

  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    models?: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      setTestResult(null);

      const res = await fetch('/api/agnes/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey, baseUrl }),
      });

      const data = await res.json();
      setTestResult({
        success: data.connected,
        message: data.message,
        models: data.models,
      });

      if (data.connected) {
        showToast('Kết nối Agnes AI thành công!');
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Lỗi kết nối: ${err.message || 'Không thể gửi yêu cầu'}`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    onSaveAgnesConfig({
      apiKey: apiKey.trim(),
      baseUrl: baseUrl.trim(),
      model: model,
    });
    showToast('Đã lưu cấu hình Agnes API!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl no-scrollbar flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-950/40">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-stone-100 font-serif-display">
                Tích Hợp Agnes AI & Công Nghệ Sinh Ảnh
              </h3>
              <p className="text-xs text-stone-400">
                Cấu hình API Hub Agnes (apihub.agnes-ai.com) và chọn công cụ tạo tóc AI
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

        {/* Engine Selection */}
        <div className="flex flex-col gap-2.5">
          <label className="text-xs font-bold text-stone-200 uppercase tracking-wider">
            Chọn Công Cụ AI Tạo Kiểu Tóc Mặc Định
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Agnes AI */}
            <button
              onClick={() => onSelectEngine('agnes')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                selectedEngine === 'agnes'
                  ? 'bg-sky-950/40 border-sky-500 ring-2 ring-sky-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Agnes AI
                </span>
                {selectedEngine === 'agnes' && <Check className="w-3.5 h-3.5 text-sky-400" />}
              </div>
              <p className="text-[11px] text-stone-400">
                Mô hình Agnes Image 2.5 Flash chuyên biến đổi tóc chân dung
              </p>
            </button>

            {/* Google Gemini */}
            <button
              onClick={() => onSelectEngine('gemini')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                selectedEngine === 'gemini'
                  ? 'bg-rose-950/40 border-rose-500 ring-2 ring-rose-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Gemini AI
                </span>
                {selectedEngine === 'gemini' && <Check className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <p className="text-[11px] text-stone-400">
                Phân tích tỷ lệ gương mặt, công thức salon & tái tạo hình ảnh
              </p>
            </button>

            {/* Instant Canvas */}
            <button
              onClick={() => onSelectEngine('canvas')}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all ${
                selectedEngine === 'canvas'
                  ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800 hover:border-stone-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  ⚡ Siêu Tốc
                </span>
                {selectedEngine === 'canvas' && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </div>
              <p className="text-[11px] text-stone-400">
                Hòa màu tóc & ánh bóng tức thì 0 giây ngay trên trình duyệt
              </p>
            </button>
          </div>
        </div>

        {/* Agnes API Credentials Section */}
        <div className="p-4 rounded-2xl bg-stone-950/70 border border-stone-800 flex flex-col gap-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Key className="w-3.5 h-3.5 text-sky-400" /> Cấu Hình Agnes API Key
            </span>
            <a
              href="https://agnes-ai.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Lấy key tại console</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* API Key Input */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-stone-400">Agnes API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ag-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 font-mono"
            />
            <span className="text-[10px] text-stone-500">
              Key được mã hóa bảo mật và có thể nạp qua biến môi trường AGNES_API_KEY trong file .env
            </span>
          </div>

          {/* Base URL */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-stone-400 flex items-center gap-1">
              <Globe className="w-3 h-3" /> API Base URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://apihub.agnes-ai.com/v1"
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          {/* Model Selection */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-stone-400">Mô hình Agnes AI</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-2 text-xs text-stone-200 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              <option value="agnes-image-2.5-flash">agnes-image-2.5-flash (Khuyên dùng - Nhanh & Sắc nét)</option>
              <option value="agnes-image-2.1-flash">agnes-image-2.1-flash (Cân bằng chi tiết)</option>
              <option value="agnes-2.5-flash">agnes-2.5-flash (Đa phương thức Multimodal)</option>
              <option value="agnes-2.5-pro">agnes-2.5-pro (Độ phân giải cao 4K)</option>
            </select>
          </div>

          {/* Test Connection Button & Result */}
          <div className="pt-1 flex flex-col gap-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors border border-stone-700"
            >
              {isTesting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  <span>Đang kiểm tra kết nối...</span>
                </>
              ) : (
                <>
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Kiểm Tra Kết Nối Agnes AI Hub</span>
                </>
              )}
            </button>

            {testResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2 border ${
                  testResult.success
                    ? 'bg-emerald-950/30 border-emerald-800/40 text-emerald-300'
                    : 'bg-rose-950/30 border-rose-800/40 text-rose-300'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.models && testResult.models.length > 0 && (
                    <p className="text-[10px] text-stone-400 mt-1">
                      Models khả dụng: {testResult.models.slice(0, 4).join(', ')}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-sky-950/40"
          >
            Lưu & Áp Dụng
          </button>
        </div>
      </div>
    </div>
  );
};
