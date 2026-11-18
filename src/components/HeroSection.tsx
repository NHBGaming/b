import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { HERO_CAMPAIGN_IMAGE } from '../data/eyewearData';
import { EDITORIAL_EASE } from './MotionPrimitives';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  onExploreClick: () => void;
  onGuideClick: () => void;
}

const CRAFT_PILLARS = [
  {
    title: 'Acetate Nhật Bản & Ý',
    detail: 'Nhựa thực vật nguyên khối, giữ độ bóng sâu và không gây kích ứng da.',
  },
  {
    title: 'Tròng Phân Cực UV400',
    detail: 'Chặn 100% tia cực tím UVA/UVB và triệt tiêu ánh sáng chói mặt đường.',
  },
  {
    title: 'Đo Khúc Xạ Chuẩn Xác',
    detail: 'Kiểm tra thị lực và tinh chỉnh ve mũi vừa vặn khuôn mặt Á Đông miễn phí.',
  },
  {
    title: 'Bảo Hành 24 Tháng',
    detail: 'Chính sách vệ sinh siêu âm, cân chỉnh gọng và thay ốc vít trọn đời.',
  },
];

export function HeroSection({ onExploreClick, onGuideClick }: HeroSectionProps) {
  return (
    <section id="top" className="border-b border-[#141413]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left editorial content */}
          <div className="lg:col-span-6 flex flex-col justify-between py-2 lg:py-6">
            <div>
              <p className="text-xs font-medium tracking-wider text-[#5C5B57] mb-4">
                Bộ sưu tập Thu Đông 2026 · Chế tác thủ công tại Sài Gòn &amp; Sabae
              </p>

              <h1
                className="font-serif font-medium text-[#141413] tracking-tight leading-[1.12] text-balance max-w-xl"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Kiến trúc ánh sáng trên từng đường nét khuôn mặt.
              </h1>

              <p className="mt-6 text-base text-[#5C5B57] leading-relaxed max-w-lg">
                Solis Optique tuyển chọn gọng kính từ Cellulose Acetate ủ 72 giờ và Beta-Titanium siêu nhẹ, cân chỉnh tỷ lệ riêng cho sống mũi và cấu trúc gương mặt Việt.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onExploreClick}
                  className="inline-flex items-center gap-2.5 px-6 py-3 min-h-[44px] text-sm font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C3E35]"
                >
                  <span>Khám phá bộ sưu tập</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={onGuideClick}
                  className="inline-flex items-center px-5 py-3 min-h-[44px] text-sm font-medium text-[#141413] border border-[#141413]/20 rounded-lg hover:bg-[#EFECE6] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Tư vấn chọn theo dáng mặt
                </button>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#141413]/10 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[#5C5B57]">
              <span>Miễn phí giao hàng toàn quốc từ 2.000.000 ₫</span>
              <span aria-hidden="true">·</span>
              <span>Đổi trả trong 14 ngày</span>
              <span aria-hidden="true">·</span>
              <span>Cắt tròng cận theo đơn</span>
            </div>
          </div>

          {/* Right campaign image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
            className="lg:col-span-6"
          >
            <div className="h-full min-h-[320px] lg:min-h-[480px] rounded-xl overflow-hidden bg-[#EFECE6]">
              <SafeImage
                src={HERO_CAMPAIGN_IMAGE}
                alt="Người mẫu đeo kính mát Moncada Tortoise của Solis Optique dưới ánh nắng chiều"
                className="w-full h-full object-cover object-top lg:h-full"
                fallbackLabel="SOLIS OPTIQUE — Chiến dịch Thu Đông"
              />
            </div>
          </motion.div>
        </div>

        {/* Full-width 4-column craft guarantee strip below hero split */}
        <div className="mt-12 pt-8 border-t border-[#141413]/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CRAFT_PILLARS.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.07, ease: EDITORIAL_EASE }}
              className="space-y-1.5"
            >
              <div className="text-xs font-mono text-[#2C3E35] tabular-nums">
                0{index + 1}.
              </div>
              <h2 className="text-sm font-semibold text-[#141413]">{pillar.title}</h2>
              <p className="text-xs text-[#5C5B57] leading-relaxed">{pillar.detail}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
