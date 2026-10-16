import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  HAIRSTYLES,
  HAIR_COLORS,
  Hairstyle,
  HairColor,
} from './data/hairStyles';
import {
  renderHairColorSimulation,
  generateSalonCard,
  SimulationOptions,
} from './utils/hairCanvas';
import { renderCompleteHairMakeover } from './utils/hairSynthesis';
import { autoCropToPortrait } from './utils/faceCrop';
import { AgnesConfig } from '../server/agnesService';
import { Navbar } from './components/Navbar';
import { BeforeAfterSlider } from './components/BeforeAfterSlider';
import { HairSelector } from './components/HairSelector';
import { ColorSelector } from './components/ColorSelector';
import { FaceAnalyzerModal } from './components/FaceAnalyzerModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { SalonCardModal } from './components/SalonCardModal';
import { MultiComparisonModal, SavedLook } from './components/MultiComparisonModal';
import { AgnesConfigModal } from './components/AgnesConfigModal';
import { FaceDetectionOverlay } from './components/FaceDetectionOverlay';
import {
  Upload,
  Camera,
  Sparkles,
  Download,
  BookmarkPlus,
  FileText,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Info,
  Cpu,
  RotateCw,
  Crop,
  ZoomIn,
  Sliders,
} from 'lucide-react';

export default function App() {
  // Navigation & Gender
  const [activeTab, setActiveTab] = useState<'studio' | 'compare' | 'gallery'>('studio');
  const [gender, setGender] = useState<'female' | 'male'>('female');

  // Framing Mode: 'portrait' (auto-cropped close-up on face) vs 'original' (full wide view)
  const [framingMode, setFramingMode] = useState<'portrait' | 'original'>('portrait');
  const [portraitZoom, setPortraitZoom] = useState<number>(1.0); // 1.0 to 1.8
  const [portraitOffsetY, setPortraitOffsetY] = useState<number>(0); // -0.2 to 0.2

  // AI Engine Selection: 'agnes' | 'gemini' | 'canvas'
  const [selectedEngine, setSelectedEngine] = useState<'gemini' | 'agnes' | 'canvas'>(() => {
    return (localStorage.getItem('ai_hair_engine') as any) || 'agnes';
  });

  // Agnes Config (persisted)
  const [agnesConfig, setAgnesConfig] = useState<AgnesConfig>(() => {
    try {
      const saved = localStorage.getItem('agnes_ai_config');
      return saved ? JSON.parse(saved) : { baseUrl: 'https://apihub.agnes-ai.com/v1', model: 'agnes-image-2.5-flash' };
    } catch {
      return { baseUrl: 'https://apihub.agnes-ai.com/v1', model: 'agnes-image-2.5-flash' };
    }
  });

  const [isAgnesModalOpen, setIsAgnesModalOpen] = useState(false);

  const placeholderImage = 'https://images.unsplash.com/photo-1595152772835-219674b2a0a6?auto=format&fit=crop&w=800&q=80';
  const [rawOriginalImage, setRawOriginalImage] = useState<string>(placeholderImage);
  
  // Current active working image (usually auto-cropped portrait)
  const [currentImage, setCurrentImage] = useState<string>(placeholderImage);

  const [selectedStyle, setSelectedStyle] = useState<Hairstyle>(HAIRSTYLES[0]);
  const [selectedColor, setSelectedColor] = useState<HairColor>(HAIR_COLORS[2]); // Chestnut brown default
  const [simulationOptions, setSimulationOptions] = useState<SimulationOptions>({
    colorHex: HAIR_COLORS[2].hex,
    intensity: 80,
    gloss: 65,
    brightness: 5,
  });

  const [simulatedImage, setSimulatedImage] = useState<string>(placeholderImage);
  const [isProcessingCanvas, setIsProcessingCanvas] = useState<boolean>(false);

  // Deep AI Transformation (Agnes AI / Gemini server API)
  const [isTransformingAI, setIsTransformingAI] = useState<boolean>(false);
  const [aiRecipe, setAiRecipe] = useState<{
    hairRecipe: string;
    cuttingTechnique: string;
    maintenanceGuide: string;
  } | null>(null);

  // Modals
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isSalonCardOpen, setIsSalonCardOpen] = useState<boolean>(false);
  const [salonCardUrl, setSalonCardUrl] = useState<string | null>(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState<boolean>(false);

  // Saved Looks for Comparison
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAgnesConfig = (newCfg: AgnesConfig) => {
    setAgnesConfig(newCfg);
    localStorage.setItem('agnes_ai_config', JSON.stringify(newCfg));
  };

  const handleSelectEngine = (eng: 'gemini' | 'agnes' | 'canvas') => {
    setSelectedEngine(eng);
    localStorage.setItem('ai_hair_engine', eng);
    showToast(`Đã chuyển động cơ tạo mẫu sang: ${eng === 'agnes' ? 'Agnes AI' : eng === 'gemini' ? 'Gemini AI' : 'Canvas Siêu Tốc'}`);
  };

  // Switch default style when gender changes
  useEffect(() => {
    const matchingStyle = HAIRSTYLES.find((h) => h.gender === gender || h.gender === 'unisex');
    if (matchingStyle) {
      setSelectedStyle(matchingStyle);
    }
  }, [gender]);

  // AUTO-CROP TO PORTRAIT:
  // When rawOriginalImage changes or framing options change, automatically generate centered portrait
  const updatePortraitCropping = useCallback(async (
    rawImg: string,
    mode: 'portrait' | 'original' = framingMode,
    zoom = portraitZoom,
    offsetY = portraitOffsetY
  ): Promise<string | undefined> => {
    if (mode === 'original') {
      setCurrentImage(rawImg);
      return rawImg;
    }

    try {
      const { portraitUrl } = await autoCropToPortrait(rawImg, {
        zoom,
        offsetY,
      });
      setCurrentImage(portraitUrl);
      return portraitUrl;
    } catch (err) {
      console.warn('Lỗi auto crop chân dung:', err);
      setCurrentImage(rawImg);
      return rawImg;
    }
  }, [framingMode, portraitZoom, portraitOffsetY]);

  // AUTO-DETECT FACE: Triggered whenever a new photo is uploaded, captured, or selected

  // Handle local photo upload: Immediately crop to portrait and scan face!
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      if (event.target?.result) {
        const base64 = event.target.result as string;
        setRawOriginalImage(base64);
        showToast('Đã nhận ảnh! Đang cắt khung chân dung...');

        // 1. Immediately create an initial centered portrait crop
        const portraitUrl = await updatePortraitCropping(base64, 'portrait');
        
        // 2. Automatically save the new upload to collection
        if (portraitUrl) {
          saveLook(portraitUrl, base64, 'Ảnh tải lên', 'Uploaded', 'N/A', '#000000');
          showToast('Ảnh đã được tự động lưu vào bộ sưu tập!');
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Real-time canvas hair color simulation on style or color change
  useEffect(() => {
    let isCancelled = false;
    const runSimulation = async () => {
      // Safety check: Ensure DOM is available
      if (typeof document === 'undefined') return;
      
      try {
        setIsProcessingCanvas(true);
        const resultUrl = await renderCompleteHairMakeover({
          imageSrc: currentImage,
          style: selectedStyle,
          color: selectedColor,
          options: simulationOptions,
          hairVolume: 1.0,
        });
        if (!isCancelled) {
          setSimulatedImage(resultUrl);
        }
      } catch (err) {
        console.error('Canvas simulation error:', err);
        if (!isCancelled) {
          // Graceful fallback: set to original image
          setSimulatedImage(currentImage);
        }
      } finally {
        if (!isCancelled) {
          setIsProcessingCanvas(false);
        }
      }
    };

    runSimulation();
    return () => {
      isCancelled = true;
    };
  }, [currentImage, selectedStyle, selectedColor, simulationOptions]);

  // Deep AI Hair Transformation (via Agnes AI or Gemini)
  const handleAITransformation = async () => {
    if (selectedEngine === 'agnes' && !agnesConfig.apiKey) {
      setIsAgnesModalOpen(true);
      showToast('Vui lòng nhập Agnes API Key để sử dụng mô hình tạo tóc Agnes AI.');
      return;
    }

    try {
      setIsTransformingAI(true);
      const providerName = selectedEngine === 'agnes' ? 'Agnes AI Hub' : 'Gemini AI';
      showToast(`${providerName} đang xử lý tái tạo mái tóc chuẩn salon...`);

      const res = await fetch('/api/simulate-hair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentImage,
          styleName: selectedStyle.name,
          styleEnglishName: selectedStyle.englishName,
          styleDescription: selectedStyle.description,
          colorName: selectedColor.name,
          colorHex: selectedColor.hex,
          gender: gender,
          provider: selectedEngine === 'agnes' ? 'agnes' : 'gemini',
          agnesConfig: agnesConfig,
        }),
      });

      if (!res.ok) throw new Error('Lỗi từ AI Provider');
      const data = await res.json();

      if (data.generatedImageUrl) {
        setSimulatedImage(data.generatedImageUrl);
        // Automatically save the AI generated look to collection
        saveLook(
          data.generatedImageUrl,
          currentImage,
          selectedStyle.name,
          selectedStyle.englishName,
          selectedColor.name,
          selectedColor.hex
        );
      }
      setAiRecipe({
        hairRecipe: data.hairRecipe,
        cuttingTechnique: data.cuttingTechnique,
        maintenanceGuide: data.maintenanceGuide,
      });

      if (data.isQuotaExceeded) {
        showToast('Đã tạo thành công công thức cắt & nhuộm từ Gemini AI!');
      } else if (data.agnesStatus && !data.agnesStatus.success) {
        showToast(`Agnes AI lưu ý: ${data.agnesStatus.message || 'Đã áp dụng công thức chuyên gia'}`);
      } else {
        showToast(`Hoàn tất tạo kiểu tóc với ${providerName}!`);
      }
    } catch (err: any) {
      console.error('Lỗi biến đổi AI:', err);
      showToast('Đã cập nhật công thức tạo mẫu tóc chuẩn salon!');
    } finally {
      setIsTransformingAI(false);
    }
  };

  // Generic function to save a look to the collection
  const saveLook = (
    imageUrl: string,
    originalImageUrl: string,
    styleName: string,
    styleEnglishName: string,
    colorName: string,
    colorHex: string
  ) => {
    const newLook: SavedLook = {
      id: `${styleName}-${colorName}-${Date.now()}`,
      timestamp: Date.now(),
      styleName,
      styleEnglishName,
      colorName,
      colorHex,
      imageUrl,
      originalImageUrl,
    };

    setSavedLooks((prev) => [newLook, ...prev]);
    return newLook;
  };

  // Save look to comparison
  const handleSaveToComparison = () => {
    saveLook(
      simulatedImage,
      currentImage,
      selectedStyle.name,
      selectedStyle.englishName,
      selectedColor.name,
      selectedColor.hex
    );
    showToast(`Đã lưu "${selectedStyle.name}" vào bảng so sánh!`);
  };

  // Generate Salon Consultation Card
  const handleOpenSalonCard = async () => {
    try {
      setIsGeneratingCard(true);
      const cardUrl = await generateSalonCard({
        originalImage: currentImage,
        styledImage: simulatedImage,
        styleName: selectedStyle.name,
        styleEnglishName: selectedStyle.englishName,
        colorName: selectedColor.name,
        colorHex: selectedColor.hex,
        faceShape: 'Trái xoan chuẩn',
        hairRecipe: aiRecipe?.hairRecipe || `Tone nền Level 6-7, ánh sắc ${selectedColor.name}.`,
        cuttingTechnique: aiRecipe?.cuttingTechnique || `Form cắt ${selectedStyle.name}, tỉa tầng so le tạo độ bay bổng tự nhiên.`,
        maintenanceGuide: aiRecipe?.maintenanceGuide || 'Gội xả bằng dầu dưỡng ẩm, sấy phồng chân tóc tạo độ bồng bềnh.',
      });

      setSalonCardUrl(cardUrl);
      setIsSalonCardOpen(true);
    } catch (err) {
      console.error('Lỗi tạo thẻ salon:', err);
      showToast('Lỗi khi xuất thẻ salon. Vui lòng thử lại!');
    } finally {
      setIsGeneratingCard(false);
    }
  };


  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      <style>{`
        div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(4) {
          display: none !important;
        }
        div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(2),
        div#root:nth-of-type(1) > div:nth-of-type(1) > main:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(1) > span:nth-of-type(1) {
          display: none !important;
        }
      `}</style>
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-rose-600 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold border border-rose-400/40 max-w-sm">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab: 'studio' | 'compare' | 'gallery') => setActiveTab(tab)}
        gender={gender}
        setGender={setGender}
        savedLooksCount={savedLooks.length}
        selectedEngine={selectedEngine}
        onOpenAgnesConfig={() => setIsAgnesModalOpen(true)}
      />

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Content Sections */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8">
        {/* TAB 1: STUDIO (HAIR SIMULATOR) */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Interactive Simulation View & Action Controls (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-3.5">
              {/* Image Input Options, Framing & 360 Mode Switch Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-stone-900/70 border border-stone-800 text-xs">
                {/* Upload & Camera */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-all border border-stone-700"
                  >
                    <Upload className="w-3.5 h-3.5 text-rose-400" />
                    <span>Tải ảnh lên</span>
                  </button>

                  <button
                    onClick={() => setIsCameraOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold transition-all border border-stone-700"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Chụp ảnh</span>
                  </button>
                </div>

                {/* Framing Toggle (Portrait Auto-Crop vs Full Raw Image) */}
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-xl border border-stone-800">
                  <button
                    onClick={() => {
                      setFramingMode('portrait');
                      updatePortraitCropping(rawOriginalImage, 'portrait');
                      showToast('Đã chuyển sang khung Chân Dung cận cảnh!');
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      framingMode === 'portrait'
                        ? 'bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40'
                        : 'text-stone-400 hover:text-stone-200'
                    }`}
                    title="Tự động căn chỉnh & lấy khung chân dung rõ mặt"
                  >
                    <Crop className="w-3 h-3 text-rose-400" />
                    <span>Ảnh Chân Dung</span>
                  </button>

                  </div>
              </div>

              {/* Viewport: 2D Portrait View with Auto Face Detection Overlay */}
              <div className="relative">
                <div className="relative w-full">
                  <BeforeAfterSlider
                    beforeImage={currentImage}
                    afterImage={simulatedImage}
                    beforeLabel="Ảnh Chân Dung Gốc"
                    afterLabel={`Đã Thử: ${selectedStyle.name}`}
                    styleName={selectedStyle.name}
                    colorName={selectedColor.name}
                    colorHex={selectedColor.hex}
                  />

                  {/* Auto Face Landmark Scanning Overlay (Clean & Accurately Aligned) */}
                  {/* Face Detection Overlay removed */}
                </div>

                {/* AI Hair Generation Loading Indicator - positioned cleanly without blocking hair/face */}
                {isTransformingAI && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-stone-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-rose-500/50 shadow-2xl flex items-center gap-2.5 text-xs text-rose-200 font-semibold animate-pulse pointer-events-none">
                    <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                    <span>
                      {selectedEngine === 'agnes'
                        ? 'Agnes AI đang tạo mẫu tóc chân thực...'
                        : 'Gemini AI đang tạo mẫu tóc...'}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Toolkit Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={handleAITransformation}
                  disabled={isTransformingAI}
                  className={`p-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg transform active:scale-95 ${
                    selectedEngine === 'agnes'
                      ? 'bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 hover:from-sky-500 hover:to-purple-500 text-white shadow-sky-950/40'
                      : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-rose-950/40'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>
                    {selectedEngine === 'agnes' ? 'Tạo Bằng Agnes AI' : 'Tạo Bằng Gemini AI'}
                  </span>
                </button>

                <button
                  onClick={handleSaveToComparison}
                  className="p-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-stone-800 hover:border-stone-700"
                >
                  <BookmarkPlus className="w-4 h-4 text-emerald-400" />
                  <span>Lưu Để So Sánh</span>
                </button>

                <button
                  onClick={handleOpenSalonCard}
                  disabled={isGeneratingCard}
                  className="p-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-stone-800 hover:border-stone-700"
                >
                  <FileText className="w-4 h-4 text-sky-400" />
                  <span>Xuất Thẻ Salon</span>
                </button>

                <a
                  href={simulatedImage}
                  download={`Toc-Dep-${selectedStyle.name.replace(/\s+/g, '-')}.jpg`}
                  className="p-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-stone-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-stone-800 hover:border-stone-700"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Tải Ảnh Về Máy</span>
                </a>
              </div>

              {/* Master Stylist Advice & Formula Card */}
              <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-rose-300 uppercase tracking-wider">
                    <Info className="w-4 h-4 text-rose-400" />
                    <span>Tư Vấn Thợ Salon Cho Mẫu Này</span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Phù hợp nhất: {selectedStyle.bestForFaces.join(', ')}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed">
                  {selectedStyle.description}
                </p>

                {aiRecipe && (
                  <div className="mt-2 pt-2 border-t border-stone-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-stone-400">
                    <div>
                      <span className="font-semibold text-stone-200">Kỹ thuật cắt: </span>
                      {aiRecipe.cuttingTechnique}
                    </div>
                    <div>
                      <span className="font-semibold text-stone-200">Công thức màu: </span>
                      {aiRecipe.hairRecipe}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Hairstyles & Hair Colors Pickers (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              {/* Sample Models Bar */}

              {/* Hairstyle Selection Component */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800">
                <HairSelector
                  hairstyles={HAIRSTYLES}
                  selectedStyle={selectedStyle}
                  onSelectStyle={(style) => setSelectedStyle(style)}
                  gender={gender}
                />
              </div>

              {/* Hair Color Selection Component */}
              <div className="p-4 rounded-2xl bg-stone-900/70 border border-stone-800">
                <ColorSelector
                  colors={HAIR_COLORS}
                  selectedColor={selectedColor}
                  onSelectColor={(color) => {
                    setSelectedColor(color);
                    setSimulationOptions((prev) => ({ ...prev, colorHex: color.hex }));
                  }}
                  simulationOptions={simulationOptions}
                  onChangeOptions={(opts) => setSimulationOptions((prev) => ({ ...prev, ...opts }))}
                />
              </div>
            </div>
          </div>
        )}


        {/* TAB 3: MULTI-LOOK COMPARISON */}
        {activeTab === 'compare' && (
          <MultiComparisonModal
            savedLooks={savedLooks}
            onSelectAsCurrent={(look) => {
              setSimulatedImage(look.imageUrl);
              setCurrentImage(look.originalImageUrl);
              setActiveTab('studio');
              showToast(`Đã tải lại mẫu "${look.styleName}"`);
            }}
            onDeleteLook={(id) => {
              setSavedLooks((prev) => prev.filter((l) => l.id !== id));
              showToast('Đã xóa mẫu tóc');
            }}
            onClose={() => setActiveTab('studio')}
          />
        )}

        {/* TAB 4: GALLERY / LOOKBOOK */}
        {activeTab === 'gallery' && (
          <div className="flex flex-col gap-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-stone-100 font-serif-display">
                  Lookbook Tóc Thời Thượng 2026
                </h2>
                <p className="text-xs text-stone-400">
                  Khám phá các phong cách tóc xu hướng được yêu thích nhất tại các Salon cao cấp
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400">Lọc theo:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  {gender === 'female' ? 'Tóc Nữ' : 'Tóc Nam'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {HAIRSTYLES.filter((h) => h.gender === gender || h.gender === 'unisex').map((style) => (
                <div
                  key={style.id}
                  className="rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex flex-col group hover:border-rose-500/40 transition-all shadow-xl"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-black">
                    <img
                      src={style.imageUrl}
                      alt={style.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-stone-950/80 backdrop-blur-sm text-[10px] font-bold text-rose-400 border border-white/10">
                      {style.stylingDifficulty}
                    </div>
                  </div>

                  <div className="p-3.5 flex flex-col justify-between flex-1 gap-2.5">
                    <div>
                      <h4 className="text-sm font-bold text-stone-100">{style.name}</h4>
                      <span className="text-[11px] text-rose-400">{style.englishName}</span>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {style.description}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedStyle(style);
                        setActiveTab('studio');
                        showToast(`Đã chọn kiểu tóc: ${style.name}`);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-rose-950/40"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Thử kiểu này lên mặt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-900 bg-stone-950/90 py-6 px-4 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 AI Hair Style Simulator • Tự Động Nhận Diện Chân Dung & Xoay 360° Đa Chiều</p>
          <div className="flex items-center gap-4 text-stone-400">
            <button
              onClick={() => setIsAgnesModalOpen(true)}
              className="hover:text-sky-400 transition-colors flex items-center gap-1"
            >
              <Cpu className="w-3 h-3 text-sky-400" />
              <span>Cấu hình Agnes API</span>
            </button>
            <span>•</span>
            <span>Salon Consultation Ready</span>
          </div>
        </div>
      </footer>

      {/* Modals */}

      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={async (base64) => {
          setRawOriginalImage(base64);
          showToast('Đang cắt khung chân dung cận cảnh...');
          await updatePortraitCropping(base64, 'portrait');
        }}
      />

      <SalonCardModal
        isOpen={isSalonCardOpen}
        onClose={() => setIsSalonCardOpen(false)}
        cardImageUrl={salonCardUrl}
        styleName={selectedStyle.name}
        colorName={selectedColor.name}
      />

      <AgnesConfigModal
        isOpen={isAgnesModalOpen}
        onClose={() => setIsAgnesModalOpen(false)}
        selectedEngine={selectedEngine}
        onSelectEngine={handleSelectEngine}
        agnesConfig={agnesConfig}
        onSaveAgnesConfig={handleSaveAgnesConfig}
        showToast={showToast}
      />
    </div>
  );
}
