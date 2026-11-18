import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { RevealBlock } from './MotionPrimitives';
import { ColorVariant, EyewearProduct, FaceShapeId } from '../types/eyewear';
import {
  CRAFT_ATELIER_IMAGE,
  EYEWEAR_PRODUCTS,
  FACE_SHAPE_GUIDES,
  formatVND,
} from '../data/eyewearData';
import { SafeImage } from './SafeImage';

interface FaceShapeGuideProps {
  onApplyFaceFilter: (shape: FaceShapeId) => void;
  onOpenProduct: (product: EyewearProduct, variant: ColorVariant) => void;
}

export function FaceShapeGuide({ onApplyFaceFilter, onOpenProduct }: FaceShapeGuideProps) {
  const [activeShape, setActiveShape] = useState<Exclude<FaceShapeId, 'all'>>('round');

  const currentGuide =
    FACE_SHAPE_GUIDES.find((item) => item.id === activeShape) || FACE_SHAPE_GUIDES[0];

  const recommendedFrames = EYEWEAR_PRODUCTS.filter((p) =>
    p.faceShapes.includes(activeShape)
  ).slice(0, 3);

  return (
    <section
      id="tu-van-dang-mat"
      className="py-16 lg:py-20 bg-[#EFECE6]/55 border-b border-[#141413]/10"
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left: Interactive Face-Shape Guide */}
          <RevealBlock className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <p className="text-xs font-medium text-[#5C5B57] mb-2">
                Hình học tỷ lệ &amp; Tư vấn chọn gọng
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight text-balance">
                Chọn dáng kính cân bằng đường nét khuôn mặt
              </h2>
              <p className="mt-3 text-sm text-[#5C5B57] leading-relaxed max-w-2xl">
                Nguyên tắc quang học tại Solis Optique là tạo sự tương phản hài hòa: đường nét gọng kính đối lập nhẹ với cấu trúc xương hàm và gò má sẽ giúp tổng thể thanh thoát hơn.
              </p>
            </div>

            {/* Interactive Face Shape Selector */}
            <div
              role="tablist"
              aria-label="Chọn dáng khuôn mặt"
              className="grid grid-cols-2 sm:grid-cols-4 gap-2.5"
            >
              {FACE_SHAPE_GUIDES.map((guide) => {
                const isSelected = guide.id === activeShape;
                return (
                  <button
                    key={guide.id}
                    type="button"
                    role="tab"
                    aria-selected={isSelected}
                    onClick={() => setActiveShape(guide.id)}
                    className={`px-4 py-3 min-h-[44px] text-xs font-medium rounded-lg border transition-colors duration-150 cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#141413] text-[#F7F6F2] border-[#141413]'
                        : 'bg-[#FFFFFF] text-[#141413] border-[#141413]/15 hover:border-[#141413]/40'
                    }`}
                  >
                    {guide.label}
                  </button>
                );
              })}
            </div>

            {/* Guide Details */}
            <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#141413]/10 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs font-semibold text-[#141413] mb-1">
                    Đặc điểm nhận diện
                  </div>
                  <p className="text-xs text-[#5C5B57] leading-relaxed">
                    {currentGuide.characteristics}
                  </p>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#2C3E35] mb-1">
                    Gợi ý tỷ lệ từ chuyên viên
                  </div>
                  <p className="text-xs text-[#5C5B57] leading-relaxed">
                    {currentGuide.recommendation}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-[#141413]/10">
                <div className="flex items-center justify-between gap-4 mb-3">
                  <span className="text-xs font-medium text-[#141413]">
                    Mẫu kính phù hợp nhất cho {currentGuide.label.toLowerCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onApplyFaceFilter(activeShape)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#2C3E35] hover:underline underline-offset-4 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Lọc trên danh mục</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendedFrames.map((frame) => (
                    <button
                      key={frame.id}
                      type="button"
                      onClick={() => onOpenProduct(frame, frame.variants[0])}
                      className="text-left p-2.5 rounded-lg bg-[#F7F6F2] hover:bg-[#EFECE6] border border-[#141413]/10 transition-colors cursor-pointer group"
                    >
                      <div className="aspect-[4/3] rounded-md overflow-hidden bg-[#FFFFFF] mb-2">
                        <SafeImage
                          src={frame.image}
                          alt={frame.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      </div>
                      <div className="text-xs font-semibold text-[#141413] truncate">
                        {frame.name}
                      </div>
                      <div className="text-xs text-[#5C5B57] tabular-nums mt-0.5">
                        {formatVND(frame.price)}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </RevealBlock>

          {/* Right: Atelier Craftsmanship Feature */}
          <RevealBlock
            delay={0.12}
            className="lg:col-span-5 flex flex-col justify-between bg-[#FFFFFF] rounded-xl border border-[#141413]/10 overflow-hidden"
          >
            <div className="aspect-[4/3] bg-[#EFECE6]">
              <SafeImage
                src={CRAFT_ATELIER_IMAGE}
                alt="Nghệ nhân chế tác gọng kính acetate thủ công tại xưởng Solis Optique"
                className="w-full h-full object-cover"
                fallbackLabel="Xưởng chế tác Solis Optique"
              />
            </div>

            <div className="p-6 sm:p-7 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-xs font-medium text-[#5C5B57] mb-1.5">
                  Xưởng chế tác · 72 giờ hoàn thiện
                </div>
                <h3 className="font-serif text-2xl font-medium text-[#141413]">
                  Từ khối Acetate thô đến độ cân bằng hoàn hảo
                </h3>
                <p className="mt-2.5 text-sm text-[#5C5B57] leading-relaxed">
                  Mỗi khung kính trải qua 18 công đoạn cắt CNC chính xác, đánh bóng thùng gỗ sồi trong 3 ngày và cân chỉnh bản lề bằng tay để đạt độ bám nhẹ tự nhiên sau tai.
                </p>
              </div>

              <div className="pt-4 border-t border-[#141413]/10 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="font-mono font-medium text-[#141413] tabular-nums">13g – 34g</div>
                  <div className="text-[#5C5B57] mt-0.5">Trọng lượng phân bổ chuẩn</div>
                </div>
                <div>
                  <div className="font-mono font-medium text-[#141413] tabular-nums">UV400 / 100%</div>
                  <div className="text-[#5C5B57] mt-0.5">Lọc tia cực tím đạt chuẩn CE</div>
                </div>
              </div>
            </div>
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
