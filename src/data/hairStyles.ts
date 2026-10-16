export interface HairstyleAngleViews {
  front: string;
  sideLeft: string;
  back: string;
  sideRight: string;
  backDetail: {
    cutForm: string;
    napeDescription: string;
    layerDepth: string;
  };
}

export interface Hairstyle {
  id: string;
  name: string;
  englishName: string;
  gender: 'female' | 'male' | 'unisex';
  length: 'short' | 'medium' | 'long';
  vibe: 'korean' | 'classic' | 'edgy' | 'elegant' | 'casual';
  description: string;
  bestForFaces: string[];
  stylingDifficulty: 'Dễ' | 'Trung bình' | 'Cần sấy tạo kiểu';
  imageUrl: string;
  angles: HairstyleAngleViews;
  tags: string[];
}

export interface HairColor {
  id: string;
  name: string;
  englishName: string;
  category: 'natural' | 'fashion' | 'pastel' | 'highlight';
  hex: string;
  gradient?: string;
  requiresBleach: boolean;
  skinToneMatch: string[];
  description: string;
}

export interface SampleModel {
  id: string;
  name: string;
  gender: 'female' | 'male';
  faceShape: string;
  imageUrl: string;
  description: string;
}

export const SAMPLE_MODELS: SampleModel[] = [
  {
    id: 'model-female-1',
    name: 'Mai Anh (Mặt Trái Xoan)',
    gender: 'female',
    faceShape: 'Trái xoan (Oval)',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    description: 'Khuôn mặt cân đối, đường nét mềm mại lý tưởng cho mọi kiểu tóc.',
  },
  {
    id: 'model-female-2',
    name: 'Minh Thư (Mặt Tròn)',
    gender: 'female',
    faceShape: 'Mặt tròn (Round)',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    description: 'Gương mặt bầu bĩnh đáng yêu, thích hợp kiểu tóc dài tỉa layer ôm góc mặt.',
  },
  {
    id: 'model-female-3',
    name: 'Elena (Mặt Vuông / Góc Cạnh)',
    gender: 'female',
    faceShape: 'Mặt vuông (Square)',
    imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    description: 'Xương hàm sắc sảo cá tính, tôn dáng với sóng lơi mềm hoặc mái bay.',
  },
  {
    id: 'model-male-1',
    name: 'Tuấn Kiệt (Mặt Kim Cương)',
    gender: 'male',
    faceShape: 'Kim cương (Diamond)',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    description: 'Gò má cao và cằm góc cạnh, hợp kiểu Side Part rủ hoặc Textured Crop.',
  },
  {
    id: 'model-male-2',
    name: 'David (Mặt Chữ Điền / Vuông)',
    gender: 'male',
    faceShape: 'Mặt vuông (Square)',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    description: 'Quai hàm nam tính mạnh mẽ, cực kỳ tôn nét với Undercut, Quiff hoặc Ivy League.',
  },
];

export const HAIRSTYLES: Hairstyle[] = [
  // 1. TÓC LAYER HÀN QUỐC
  {
    id: 'f-korean-layer',
    name: 'Tóc Layer Tỉa Tầng Hàn Quốc',
    englishName: 'Korean Soft Layer Cut',
    gender: 'female',
    length: 'medium',
    vibe: 'korean',
    description: 'Các tầng tóc tỉa so le ôm nhẹ gò má và cằm, tạo hiệu ứng khuôn mặt V-line thon gọn và bồng bềnh tự nhiên.',
    bestForFaces: ['Mặt tròn', 'Mặt vuông', 'Mặt trái xoan', 'Mặt dài'],
    stylingDifficulty: 'Dễ',
    imageUrl: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Form đuôi chữ V tỉa so le 3 tầng',
        napeDescription: 'Tóc sau gáy được chia 3 phân khu, tỉa chuốt bằng kéo răng cưa tạo độ so le bay bổng nhẹ tênh, ngọn tóc ôm nhẹ bờ vai.',
        layerDepth: 'Tầng ngắn nhất cách đỉnh đầu 18cm, tầng dài nhất chạm ngang lưng trên.',
      },
    },
    tags: ['Hot Trend', 'Hack Tuổi', 'Bồng Bềnh'],
  },

  // 2. BOB NGẮN CÚP CẰM
  {
    id: 'f-french-bob',
    name: 'Bob Ngắn Ngang Cằm Sang Chảnh',
    englishName: 'Chic Parisian Bob',
    gender: 'female',
    length: 'short',
    vibe: 'elegant',
    description: 'Kiểu tóc bob cụp cằm kinh điển, khoe trọn cổ thon và bờ vai quyến rũ, đậm chất tiểu thư Pháp.',
    bestForFaces: ['Mặt trái xoan', 'Mặt trái tim', 'Mặt kim cương'],
    stylingDifficulty: 'Trung bình',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1607957159143-de3859adca2d?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Đường cắt gáy ngang thẳng (Blunt Nape Line) có độ phồng C-Curve',
        napeDescription: 'Gáy được cắt gọn gàng trên chân cổ 2cm, kỹ thuật nâng góc 45 độ tạo độ cụp tự nhiên ôm sát gáy mà không cần uốn.',
        layerDepth: 'Độ dài sau gáy ngắn hơn phía trước 1.5cm (A-line Bob tạo hiệu ứng cổ dài kiêu kỳ).',
      },
    },
    tags: ['Cổ Điển', 'Thanh Lịch', 'Tiểu Thư'],
  },

  // 3. WOLF CUT PHÁ CÁCH
  {
    id: 'f-wolf-cut',
    name: 'Wolf Cut Cá Tính Phá Cách',
    englishName: 'Modern Wolf Cut & Shag',
    gender: 'female',
    length: 'medium',
    vibe: 'edgy',
    description: 'Sự pha trộn hoàn hảo giữa mullet và shag cut cổ điển, phần trên phồng rối nhẹ và đuôi tỉa thon phóng khoáng.',
    bestForFaces: ['Mặt trái xoan', 'Mặt tròn', 'Mặt tim'],
    stylingDifficulty: 'Cần sấy tạo kiểu',
    imageUrl: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Form Shaggy Mullet đuôi vuốt nhọn tự do',
        napeDescription: 'Đuôi tóc sau gáy tỉa so le nhiều lớp mỏng, ngọn tóc đánh tơi xòe nhẹ sang hai vai tạo vẻ phong trần.',
        layerDepth: 'Tầng trên phồng bồng bềnh, tầng dưới thon dài tạo độ tương phản mạnh mẽ.',
      },
    },
    tags: ['Gen Z Trend', 'Cá Tính', 'Nổi Bật'],
  },

  // 4. UỐN SÓNG LƠI NƯỚC
  {
    id: 'f-soft-waves',
    name: 'Uốn Sóng Lơi Nước Bồng Bềnh',
    englishName: 'Mermaid Water Waves',
    gender: 'female',
    length: 'long',
    vibe: 'elegant',
    description: 'Những lọn sóng uốn lơi nhẹ nhàng như gợn nước, mang đến nét kiêu sa, đằm thắm cho mọi cô nàng.',
    bestForFaces: ['Mặt tròn', 'Mặt vuông', 'Mặt dài', 'Mặt kim cương'],
    stylingDifficulty: 'Dễ',
    imageUrl: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Form đuôi bầu chữ U với lọn xoăn sóng lơi óng ả',
        napeDescription: 'Sau lưng là suối tóc xoăn sóng chữ S gợn đều từ vai xuống lưng, các lọn đan xen mượt mà tỏa sáng dưới ánh nắng.',
        layerDepth: 'Cắt đuôi vòm U nhẹ, tỉa đuôi trước khi uốn trục 28mm để sóng không bị nặng hay già.',
      },
    },
    tags: ['Nàng Thơ', 'Dịu Dàng', 'Quyến Rũ'],
  },

  // 5. TÓC DÀI MÁI BAY TỰ NHIÊN
  {
    id: 'f-curtain-bangs',
    name: 'Tóc Dài Mái Bay Tự Nhiên',
    englishName: 'Curtain Bangs Long Flow',
    gender: 'female',
    length: 'long',
    vibe: 'korean',
    description: 'Mái bay rẽ ngôi uốn nhẹ về hai phía giúp che gò má cao hoặc thái dương hóp cực kỳ tinh tế.',
    bestForFaces: ['Mặt tròn', 'Mặt vuông', 'Mặt kim cương'],
    stylingDifficulty: 'Dễ',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Lưng tóc suôn mượt tự nhiên viền đuôi vát cong',
        napeDescription: 'Mặt sau suôn dài tự nhiên, ngọn tóc tỉa nhẹ nhàng để khi buông xõa có độ lượn mềm mại ôm tấm lưng thon.',
        layerDepth: 'Phân tầng thấp 10% ở đuôi tóc, giữ nguyên độ dày mượt nguyên thủy.',
      },
    },
    tags: ['Che Khuyết Điểm', 'Mặt Thon Gọn', 'Quốc Dân'],
  },

  // 6. PIXIE TÉM CÁ TÍNH
  {
    id: 'f-pixie-cut',
    name: 'Pixie Tém Cá Tính Táo Bạo',
    englishName: 'Audrey Pixie Cut',
    gender: 'female',
    length: 'short',
    vibe: 'edgy',
    description: 'Tóc cắt ngắn sát gáy với phần mái tỉa layer nhẹ nhàng, tôn vinh đường nét gương mặt thanh tú và thần thái đỉnh cao.',
    bestForFaces: ['Mặt trái xoan', 'Mặt trái tim'],
    stylingDifficulty: 'Dễ',
    imageUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1607957159143-de3859adca2d?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Gáy tém sát ôm sát đường cong gáy (Tapered Nape)',
        napeDescription: 'Phần sau gáy được tỉa ôm sát chân cổ cực kỳ sắc sảo, khoe trọn đường cong cổ gáy quyến rũ và thanh thoát.',
        layerDepth: 'Độ phồng dồn lên đỉnh đầu và vương miện sau đầu (crown), tạo form đầu tròn đầy đặn.',
      },
    },
    tags: ['Phong Cách', 'Gọn Gàng', 'Khí Chất'],
  },

  // 7. NAM: SIDE PART 7/3
  {
    id: 'm-side-part',
    name: 'Side Part 7/3 Rủ Lãng Tử',
    englishName: 'Korean 7/3 Comma Hair',
    gender: 'male',
    length: 'medium',
    vibe: 'korean',
    description: 'Chia ngôi 7/3 kinh điển với phần mái uốn cong chữ C nhẹ nhàng buông lơi, chuẩn phong thái nam thần K-Drama.',
    bestForFaces: ['Mặt trái xoan', 'Mặt tròn', 'Mặt vuông', 'Mặt dài'],
    stylingDifficulty: 'Trung bình',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Gáy Taper Fade tỉa tầng tự nhiên',
        napeDescription: 'Sau gáy được cắt dốc nhẹ nhàng, giữ lại độ dài khoảng 1.5 - 2cm tạo cảm giác thư sinh, lịch lãm.',
        layerDepth: 'Đỉnh đầu dài 7-9cm uốn phồng chân tóc, gáy tỉa mỏng ôm theo hộp sọ.',
      },
    },
    tags: ['Nam Thần', 'Lịch Lãm', 'Hot Trend'],
  },

  // 8. NAM: UNDERCUT VUỐT NGƯỢC
  {
    id: 'm-undercut',
    name: 'Slicked Back Undercut Cổ Điển',
    englishName: 'Classic Slicked Undercut',
    gender: 'male',
    length: 'short',
    vibe: 'classic',
    description: 'Cạo gọn gàng hai bên và sau gáy, phần tóc đỉnh vuốt ngược ra sau với sáp tạo độ bóng quyền lực, nam tính.',
    bestForFaces: ['Mặt vuông', 'Mặt chữ điền', 'Mặt kim cương'],
    stylingDifficulty: 'Cần sấy tạo kiểu',
    imageUrl: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'High Fade cạo sát gáy sắc nét',
        napeDescription: 'Sau gáy cạo mờ fade từ 0.5mm lên 3mm cực kỳ sắc nét, tôn cơ cổ và bờ vai vạm vỡ.',
        layerDepth: 'Tóc trên đỉnh vuốt thẳng ra sau xếp nếp bóng bẩy chấm dứt ngay điểm nối fade.',
      },
    },
    tags: ['Quý Ông', 'Quyền Lực', 'Gọn Gàng'],
  },

  // 9. NAM: MODERN MULLET
  {
    id: 'm-modern-mullet',
    name: 'Modern Mullet / Wolf Mullet Phong Trần',
    englishName: 'Edgy Modern Mullet',
    gender: 'male',
    length: 'medium',
    vibe: 'edgy',
    description: 'Hai bên cắt gọn, đuôi tóc nuôi dài chạm gáy tỉa so le bồng bềnh, mang lại vẻ ngoài nghệ sĩ đầy cuốn hút.',
    bestForFaces: ['Mặt trái xoan', 'Mặt trái tim', 'Mặt tròn'],
    stylingDifficulty: 'Trung bình',
    imageUrl: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',
    angles: {
      front: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',
      sideLeft: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      back: 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',
      sideRight: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
      backDetail: {
        cutForm: 'Đuôi Mullet dài qua gáy chạm cổ áo',
        napeDescription: 'Đuôi tóc sau gáy dài 8-12cm tỉa nhọn phóng khoáng, uốn phồng gợn nhẹ tạo vẻ nghệ sĩ lãng tử bụi bặm.',
        layerDepth: 'Hai bên mai cạo gọn (Low Fade) để dồn toàn bộ sự chú ý vào phần đuôi mullet phía sau.',
      },
    },
    tags: ['Nghệ Sĩ', 'Phong Trần', 'Phá Cách'],
  },
];

export const HAIR_COLORS: HairColor[] = [
  // TỰ NHIÊN
  {
    id: 'c-black-jet',
    name: 'Đen Tuyền Huyền Bí',
    englishName: 'Jet Black',
    category: 'natural',
    hex: '#141414',
    gradient: 'linear-gradient(135deg, #2b2b2b 0%, #111111 100%)',
    requiresBleach: false,
    skinToneMatch: ['Mọi tông da', 'Đặc biệt da sáng'],
    description: 'Sắc đen bóng khỏe nguyên bản, tôn lên vẻ đẹp thuần khiết và làn da sáng.',
  },
  {
    id: 'c-dark-brown',
    name: 'Nâu Đen Trầm Tự Nhiên',
    englishName: 'Natural Dark Brown',
    category: 'natural',
    hex: '#2b1d16',
    gradient: 'linear-gradient(135deg, #3d281f 0%, #1e140f 100%)',
    requiresBleach: false,
    skinToneMatch: ['Mọi tông da'],
    description: 'Màu nâu trầm dịu mắt, chỉ ánh nâu nhẹ khi ra nắng, chuẩn mực thanh lịch.',
  },
  {
    id: 'c-chestnut',
    name: 'Nâu Hạt Dẻ Ấm Áp',
    englishName: 'Warm Chestnut',
    category: 'natural',
    hex: '#6a3f25',
    gradient: 'linear-gradient(135deg, #7c4c2f 0%, #4a2916 100%)',
    requiresBleach: false,
    skinToneMatch: ['Da sáng', 'Da trung bình', 'Da ngăm'],
    description: 'Màu tóc quốc dân không kén da, giúp khuôn mặt bừng sáng và trẻ trung.',
  },
  {
    id: 'c-mocha-choco',
    name: 'Nâu Socola Mocha',
    englishName: 'Mocha Chocolate',
    category: 'natural',
    hex: '#513324',
    gradient: 'linear-gradient(135deg, #65412f 0%, #3a2217 100%)',
    requiresBleach: false,
    skinToneMatch: ['Da sáng', 'Da trung bình'],
    description: 'Sắc nâu đậm ngọt ngào, tạo độ bóng mượt vượt trội cho thớ tóc.',
  },
  {
    id: 'c-cold-brown',
    name: 'Nâu Lạnh Ánh Khói',
    englishName: 'Cold Ash Brown',
    category: 'natural',
    hex: '#6b5e54',
    gradient: 'linear-gradient(135deg, #7e7065 0%, #52473e 100%)',
    requiresBleach: false,
    skinToneMatch: ['Da sáng', 'Da trung bình sáng', 'Cool undertone'],
    description: 'Sắc nâu không ngả vàng hay đỏ, mang lại vẻ đẹp tây và cực kỳ sang chảnh.',
  },

  // THỜI THƯỢNG
  {
    id: 'c-milk-tea',
    name: 'Nâu Trà Sữa Caramel',
    englishName: 'Milk Tea Caramel',
    category: 'fashion',
    hex: '#b39374',
    gradient: 'linear-gradient(135deg, #c7a788 0%, #99795a 100%)',
    requiresBleach: true,
    skinToneMatch: ['Da sáng', 'Da trung bình sáng'],
    description: 'Tone màu ngọt ngào thời thượng nhất năm, tôn da và cực kỳ ăn ảnh.',
  },
  {
    id: 'c-moss-beige',
    name: 'Nâu Tây Ánh Rêu',
    englishName: 'Mossy Beige Brown',
    category: 'fashion',
    hex: '#74705a',
    gradient: 'linear-gradient(135deg, #88836c 0%, #5c5844 100%)',
    requiresBleach: false,
    skinToneMatch: ['Da sáng', 'Da trung bình'],
    description: 'Ánh rêu huyền ảo khi ra nắng, tạo chiều sâu cuốn hút bí ẩn.',
  },
  {
    id: 'c-ash-gray',
    name: 'Xám Khói Tro Thời Thượng',
    englishName: 'Smoky Ash Gray',
    category: 'fashion',
    hex: '#9ba0a6',
    gradient: 'linear-gradient(135deg, #b0b5bb 0%, #83878c 100%)',
    requiresBleach: true,
    skinToneMatch: ['Da sáng', 'Cool undertone'],
    description: 'Sắc xám bạc khói mờ ảo đẳng cấp, dành cho những ai thích sự nổi bật.',
  },
  {
    id: 'c-platinum',
    name: 'Bạch Kim Quyền Lực',
    englishName: 'Nordic Platinum Blonde',
    category: 'fashion',
    hex: '#e8e4da',
    gradient: 'linear-gradient(135deg, #f5f2e9 0%, #d4cfc4 100%)',
    requiresBleach: true,
    skinToneMatch: ['Da sáng', 'Gương mặt cá tính'],
    description: 'Màu tóc biểu tượng của các idol và sàn diễn thời trang quốc tế.',
  },
  {
    id: 'c-copper-orange',
    name: 'Nâu Cam Cháy / Đồng',
    englishName: 'Burnt Copper Orange',
    category: 'fashion',
    hex: '#b8542c',
    gradient: 'linear-gradient(135deg, #cf663a 0%, #9c3f1c 100%)',
    requiresBleach: false,
    skinToneMatch: ['Da sáng', 'Warm undertone'],
    description: 'Nổi bật, ấm áp và tràn đầy năng lượng tươi trẻ mùa hè.',
  },
  {
    id: 'c-burgundy',
    name: 'Đỏ Rượu Vang Burgundy',
    englishName: 'Burgundy Wine Red',
    category: 'fashion',
    hex: '#701c2b',
    gradient: 'linear-gradient(135deg, #882537 0%, #54121e 100%)',
    requiresBleach: false,
    skinToneMatch: ['Mọi tông da', 'Đặc biệt tôn da ngăm'],
    description: 'Màu đỏ rượu sang trọng, làm hồng hào khuôn mặt và không bao giờ lỗi mốt.',
  },

  // PASTEL & ĐẶC BIỆT
  {
    id: 'c-rose-pink',
    name: 'Hồng Khói Pastel Ngọt Ngào',
    englishName: 'Smoky Rose Pink',
    category: 'pastel',
    hex: '#df8fa1',
    gradient: 'linear-gradient(135deg, #eda4b4 0%, #cb788b 100%)',
    requiresBleach: true,
    skinToneMatch: ['Da sáng'],
    description: 'Tone hồng thơ mộng như hoa anh đào, phá cách nhưng vẫn giữ nét dịu dàng.',
  },
  {
    id: 'c-lavender-ash',
    name: 'Tím Khói Lavender Mộng Mơ',
    englishName: 'Lavender Ash Violet',
    category: 'pastel',
    hex: '#8d789e',
    gradient: 'linear-gradient(135deg, #a08bb2 0%, #766387 100%)',
    requiresBleach: true,
    skinToneMatch: ['Da sáng'],
    description: 'Sắc tím khói huyền bí biến chuyển tinh tế dưới ánh đèn và ánh sáng mặt trời.',
  },
  {
    id: 'c-emerald-moss',
    name: 'Xanh Rêu Ngọc Lục Bảo',
    englishName: 'Emerald Deep Moss',
    category: 'pastel',
    hex: '#315541',
    gradient: 'linear-gradient(135deg, #406951 0%, #223f2f 100%)',
    requiresBleach: true,
    skinToneMatch: ['Da sáng', 'Da trung bình'],
    description: 'Sự pha trộn giữa sắc xanh rêu và ánh khói lạnh lùng kiêu kỳ.',
  },
];
