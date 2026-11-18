import { EyewearProduct, FaceShapeId, LensOption } from '../types/eyewear';

const assetUrl = (file: string) => `${import.meta.env.BASE_URL}src/assets/images/${file}`;

export const HERO_CAMPAIGN_IMAGE = assetUrl('hero_eyewear_campaign_1794809670084.jpg');

export const CRAFT_ATELIER_IMAGE = assetUrl('craft_atelier_frames_1794809673419.jpg');

export const LENS_OPTIONS: Record<'sunglasses' | 'optical', LensOption[]> = {
  sunglasses: [
    {
      id: 'uv400-polarized',
      name: 'Tròng Phân Cực UV400',
      description: 'Chống chói mặt đường & bảo vệ 100% tia UVA/UVB',
      priceDelta: 0,
    },
    {
      id: 'polarized-rx',
      name: 'Tròng Mát Có Độ (Cận/Loạn)',
      description: 'Cắt tròng râm theo đơn khúc xạ cá nhân (chiết suất 1.60)',
      priceDelta: 750000,
    },
  ],
  optical: [
    {
      id: 'frame-only',
      name: 'Gọng Kính & Tròng Mẫu',
      description: 'Phù hợp đeo thời trang hoặc cắt tròng tại cửa hàng',
      priceDelta: 0,
    },
    {
      id: 'blue-light-160',
      name: 'Tròng Lọc Ánh Sáng Xanh 1.60',
      description: 'Giảm mỏi mắt màn hình, phủ lớp chống trầy & bám nước',
      priceDelta: 650000,
    },
    {
      id: 'photochromic-167',
      name: 'Tròng Đổi Màu Siêu Mỏng 1.67',
      description: 'Trong suốt trong nhà, tự sẫm màu khi ra nắng ngoài trời',
      priceDelta: 1250000,
    },
  ],
};

export const EYEWEAR_PRODUCTS: EyewearProduct[] = [
  {
    id: 'solis-moncada-01',
    sku: 'SO-2601',
    name: 'Moncada Tortoise Square',
    category: 'sunglasses',
    categoryLabel: 'Kính mát',
    material: 'Acetate Mazzucchelli Ý',
    price: 3450000,
    image: assetUrl('product_acetate_tortoise_1794809670849.jpg'),
    dimensions: { lensWidth: 52, bridge: 20, temple: 145 },
    weightGrams: 34,
    faceShapes: ['round', 'oval'],
    description:
      'Dáng vuông bản dày kinh điển với đường vát cạnh sắc sảo, tôn cấu trúc xương gò má và cân bằng gương mặt tròn hoặc trái xoan.',
    craftNote: 'Bản lề 5 chấu mạ vàng 18K đúc lõi thép không gỉ dọc càng kính.',
    tag: 'Bán chạy',
    variants: [
      { id: 'havana-dark', name: 'Đồi mồi sẫm', hex: '#4A2C18', lensTint: 'Khói xám G15' },
      { id: 'obsidian', name: 'Đen tuyền', hex: '#18181B', lensTint: 'Đen phân cực' },
      { id: 'espresso-amber', name: 'Nâu hổ phách', hex: '#7A4924', lensTint: 'Nâu trà ấm' },
    ],
  },
  {
    id: 'solis-sabae-02',
    sku: 'SO-2602',
    name: 'Sabae Brushed Round',
    category: 'titanium',
    categoryLabel: 'Titanium Nhật Bản',
    material: 'Beta-Titanium Sabae',
    price: 4200000,
    image: assetUrl('product_titanium_round_1794809670724.jpg'),
    dimensions: { lensWidth: 48, bridge: 21, temple: 145 },
    weightGrams: 13,
    faceShapes: ['square', 'heart', 'oval'],
    description:
      'Gọng tròn mảnh chỉ 13 gram chế tác từ Beta-Titanium nguyên khối, không gây vết hằn sống mũi khi đeo làm việc cả ngày.',
    craftNote: 'Đệm mũi titanium chạm khắc vân chống trượt, thích hợp sống mũi Á Đông.',
    tag: 'Phiên bản giới hạn',
    variants: [
      { id: 'champagne-gold', name: 'Vàng champagne', hex: '#C5AD82', lensTint: 'Trong suốt' },
      { id: 'antique-silver', name: 'Bạc xước mờ', hex: '#A1A1AA', lensTint: 'Trong suốt' },
      { id: 'matte-pewter', name: 'Xám titan', hex: '#52525B', lensTint: 'Trong suốt' },
    ],
  },
  {
    id: 'solis-aeron-03',
    sku: 'SO-2603',
    name: 'Aeron Double-Bridge Aviator',
    category: 'sunglasses',
    categoryLabel: 'Kính mát',
    material: 'Hợp kim Titanium & Thép y tế',
    price: 3850000,
    image: assetUrl('product_aviator_smoke_1794809671184.jpg'),
    dimensions: { lensWidth: 55, bridge: 17, temple: 146 },
    weightGrams: 22,
    faceShapes: ['square', 'oval', 'heart'],
    description:
      'Cầu đôi kiến trúc gọn gàng kết hợp tròng Nylon phân cực sắc xanh ô-liu, triệt tiêu ánh sáng phản xạ khi lái xe đường dài.',
    craftNote: 'Lớp phủ chống phản quang mặt trong tròng kính giúp tầm nhìn dịu mắt.',
    variants: [
      { id: 'gunmetal-olive', name: 'Xám súng & Ô-liu', hex: '#3F463E', lensTint: 'Xanh ô-liu' },
      { id: 'matte-black', name: 'Đen nhám', hex: '#1C1C1E', lensTint: 'Khói đậm' },
    ],
  },
  {
    id: 'solis-celeste-04',
    sku: 'SO-2604',
    name: 'Céleste Ivory Cat-Eye',
    category: 'sunglasses',
    categoryLabel: 'Kính mát',
    material: 'Acetate Cellulose Tự nhiên',
    price: 3290000,
    image: assetUrl('product_cateye_ivory_1794809671892.jpg'),
    dimensions: { lensWidth: 51, bridge: 19, temple: 142 },
    weightGrams: 29,
    faceShapes: ['round', 'square', 'oval'],
    description:
      'Đường nét mắt mèo nâng nhẹ góc đuôi mắt đầy thanh lịch, chất liệu acetate ngà trong xuyên sáng hòa quyện tròng hổ phách chuyển sắc.',
    craftNote: 'Đánh bóng thủ công 72 giờ bằng gỗ sồi để đạt độ bóng sâu tự nhiên.',
    tag: 'Bộ sưu tập Mới',
    variants: [
      { id: 'ivory-amber', name: 'Ngà trong suốt', hex: '#D8C5A3', lensTint: 'Hổ phách chuyển sắc' },
      { id: 'rose-quartz', name: 'Hồng phấn khói', hex: '#CBB2AC', lensTint: 'Nâu hồng' },
      { id: 'noir-classic', name: 'Đen cổ điển', hex: '#141413', lensTint: 'Đen khói' },
    ],
  },
  {
    id: 'solis-koto-05',
    sku: 'SO-2605',
    name: 'Koto Crystal Geometric',
    category: 'optical',
    categoryLabel: 'Gọng cận',
    material: 'Acetate Takiron Nhật Bản',
    price: 2650000,
    image: assetUrl('product_clear_crystal_1794809672527.jpg'),
    dimensions: { lensWidth: 50, bridge: 20, temple: 145 },
    weightGrams: 26,
    faceShapes: ['round', 'oval', 'heart'],
    description:
      'Gọng đa giác nhẹ nhàng sắc xám pha lê trong veo, để lộ lõi kim loại chạm khắc bên trong càng kính cùng hai đinh tán bạc nguyên chất.',
    craftNote: 'Thiết kế ve mũi nâng cao giúp kính ôm gọn mà không chạm gò má.',
    variants: [
      { id: 'smoke-crystal', name: 'Xám pha lê', hex: '#8F8B82', lensTint: 'Trong suốt' },
      { id: 'clear-champagne', name: 'Trắng ngà trong', hex: '#DFDDD5', lensTint: 'Trong suốt' },
      { id: 'forest-translucent', name: 'Xanh rêu trong', hex: '#2C3E35', lensTint: 'Trong suốt' },
    ],
  },
  {
    id: 'solis-atelier-06',
    sku: 'SO-2606',
    name: 'Atelier Crown Panto',
    category: 'optical',
    categoryLabel: 'Gọng cận',
    material: 'Acetate 8mm Phay Thủ Công',
    price: 3150000,
    image: assetUrl('craft_atelier_frames_1794809673419.jpg'),
    dimensions: { lensWidth: 47, bridge: 22, temple: 145 },
    weightGrams: 28,
    faceShapes: ['square', 'heart', 'oval'],
    description:
      'Form dáng Crown Panto cắt vát phần trên kết hợp cầu khóa lỗ (keyhole bridge), mang phong thái trí thức vượt thời gian.',
    craftNote: 'Mỗi gọng được khắc số thứ tự thủ công bên trong càng trái.',
    variants: [
      { id: 'amber-tortoise', name: 'Đồi mồi mật ong', hex: '#7D4E24', lensTint: 'Trong suốt' },
      { id: 'charcoal-grain', name: 'Đen vân gỗ', hex: '#27272A', lensTint: 'Trong suốt' },
    ],
  },
];

export interface FaceShapeGuideInfo {
  id: Exclude<FaceShapeId, 'all'>;
  label: string;
  characteristics: string;
  recommendation: string;
  avoid: string;
}

export const FACE_SHAPE_GUIDES: FaceShapeGuideInfo[] = [
  {
    id: 'round',
    label: 'Mặt tròn',
    characteristics: 'Chiều dài và chiều rộng gần bằng nhau, đường nét cằm và gò má mềm mại.',
    recommendation: 'Ưu tiên gọng vuông, chữ nhật hoặc mắt mèo có góc cạnh rõ nét để tạo đường nét thon gọn cho khuôn mặt.',
    avoid: 'Tránh gọng quá tròn nhỏ khiến mặt trông bầu bĩnh hơn.',
  },
  {
    id: 'square',
    label: 'Mặt vuông',
    characteristics: 'Trán rộng, đường quai hàm góc cạnh sắc nét và cân đối.',
    recommendation: 'Chọn gọng tròn, Crown Panto hoặc Aviator đường cong mềm giúp làm dịu góc hàm và tăng vẻ hài hòa.',
    avoid: 'Hạn chế gọng vuông quá dày và sắc cạnh.',
  },
  {
    id: 'oval',
    label: 'Mặt trái xoan',
    characteristics: 'Tỷ lệ cân xứng, gò má hơi cao và cằm thuôn nhẹ tự nhiên.',
    recommendation: 'Phù hợp hầu hết các dáng kính; nên chọn chiều rộng gọng tương đương phần rộng nhất của gò má (48–52mm).',
    avoid: 'Tránh gọng quá ngoại cỡ làm mất cân đối tự nhiên.',
  },
  {
    id: 'heart',
    label: 'Mặt trái tim',
    characteristics: 'Phần trán rộng, gò má cao và thuôn nhọn dần về phía cằm.',
    recommendation: 'Chọn gọng thanh mảnh bằng Titanium hoặc dáng Panto đáy tròn để cân bằng phần cằm nhỏ.',
    avoid: 'Tránh gọng phần trên quá nặng hoặc trang trí rườm rà ở thái dương.',
  },
];

export const CLIENT_REVIEWS = [
  {
    id: 'rev-1',
    name: 'Nguyễn Minh Anh',
    role: 'Kiến trúc sư nội thất · Quận 1, TP.HCM',
    productBought: 'Sabae Brushed Round',
    quote:
      'Tôi làm việc trước màn hình hơn 10 tiếng mỗi ngày. Chuyển sang gọng Titanium 13g kèm tròng lọc ánh sáng xanh tại Solis giúp sống mũi không còn vết hằn và giảm hẳn nhức mỏi mắt cuối ngày.',
  },
  {
    id: 'rev-2',
    name: 'Trần Hoàng Nam',
    role: 'Giám đốc sáng tạo · Hoàn Kiếm, Hà Nội',
    productBought: 'Moncada Tortoise Square',
    quote:
      'Chất lượng acetate dày dặn, bản lề 5 chấu đóng mở rất đầm tay. Tròng phân cực G15 cho màu sắc trung thực và triệt tiêu hoàn toàn ánh chói mặt đường khi tôi lái xe buổi trưa.',
  },
  {
    id: 'rev-3',
    name: 'Lê Thảo Vy',
    role: 'Biên tập viên thời trang · Thảo Điền, TP.HCM',
    productBought: 'Céleste Ivory Cat-Eye',
    quote:
      'Đặt lịch đo mắt tại showroom chỉ mất 20 phút, kỹ thuật viên chỉnh ve mũi vừa khít khuôn mặt châu Á. Màu ngà trong của Céleste phối với áo linen rất thanh lịch.',
  },
];

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' ₫';
}
