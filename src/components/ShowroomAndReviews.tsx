import { FormEvent, useState } from 'react';
import { motion } from 'motion/react';
import { Calendar, CheckCircle2, MapPin, Clock } from 'lucide-react';
import { EDITORIAL_EASE, RevealBlock } from './MotionPrimitives';
import { AppointmentReceipt } from '../types/eyewear';
import { CLIENT_REVIEWS } from '../data/eyewearData';

const SHOWROOMS = [
  'Showroom Thảo Điền — 42 Xuân Thủy, TP. Thủ Đức, TP.HCM',
  'Showroom Quận 1 — 118 Lý Tự Trọng, Bến Thành, TP.HCM',
  'Showroom Hoàn Kiếm — 27 Nhà Chung, Hoàn Kiếm, Hà Nội',
];

const TIME_SLOTS = ['09:30', '11:00', '14:00', '16:30', '18:30'];

const SERVICES = [
  'Đo khúc xạ & Tư vấn dáng kính (Miễn phí)',
  'Thử bộ sưu tập Kính mát & Cắt tròng có độ',
  'Bảo dưỡng, vệ sinh siêu âm & cân chỉnh gọng',
];

export function ShowroomAndReviews() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [showroom, setShowroom] = useState(SHOWROOMS[0]);
  const [date, setDate] = useState('2026-11-18');
  const [timeSlot, setTimeSlot] = useState(TIME_SLOTS[1]);
  const [service, setService] = useState(SERVICES[0]);
  const [formError, setFormError] = useState('');
  const [receipt, setReceipt] = useState<AppointmentReceipt | null>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (trimmedName.length < 2) {
      setFormError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!/^[0-9+\s]{9,14}$/.test(trimmedPhone)) {
      setFormError('Vui lòng nhập số điện thoại hợp lệ (9–12 chữ số).');
      return;
    }

    setFormError('');
    const code = `APT-${Math.floor(1000 + Math.random() * 9000)}`;
    setReceipt({
      bookingCode: code,
      fullName: trimmedName,
      phone: trimmedPhone,
      showroom,
      date,
      timeSlot,
      service,
    });
  };

  return (
    <section id="showroom" className="py-16 lg:py-20 border-b border-[#141413]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left: Attributable Customer Reviews (Claim-to-Proof Adjacency) */}
          <div className="lg:col-span-6 space-y-6">
            <RevealBlock>
              <p className="text-xs font-medium text-[#5C5B57] mb-2">
                Trải nghiệm khách hàng thực tế
              </p>
              <h2 className="font-serif text-3xl font-medium text-[#141413] tracking-tight text-balance">
                Độ vừa vặn được kiểm chứng qua từng giờ đeo
              </h2>
            </RevealBlock>

            <div className="space-y-4">
              {CLIENT_REVIEWS.map((review, index) => (
                <motion.article
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: 0.48, delay: index * 0.08, ease: EDITORIAL_EASE }}
                  className="bg-[#FFFFFF] rounded-xl p-6 border border-[#141413]/10 space-y-3"
                >
                  <p className="text-sm text-[#141413] leading-relaxed">
                    “{review.quote}”
                  </p>
                  <div className="pt-3 border-t border-[#141413]/8 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div>
                      <span className="font-semibold text-[#141413]">{review.name}</span>
                      <span className="text-[#5C5B57]"> · {review.role}</span>
                    </div>
                    <span className="text-[#2C3E35] font-medium">{review.productBought}</span>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>

          {/* Right: Showroom Eye Exam & Styling Booking */}
          <RevealBlock
            delay={0.12}
            className="lg:col-span-6 bg-[#FFFFFF] rounded-xl p-6 sm:p-8 border border-[#141413]/10"
          >
            <div className="mb-6">
              <p className="text-xs font-medium text-[#2C3E35] mb-1.5">
                Dịch vụ tại cửa hàng · Miễn phí đo khúc xạ
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#141413]">
                Đặt lịch đo mắt &amp; thử kính riêng
              </h2>
              <p className="mt-2 text-sm text-[#5C5B57]">
                Trải nghiệm toàn bộ bộ sưu tập trong 30 phút tư vấn 1-1 cùng kỹ thuật viên khúc xạ.
              </p>
            </div>

            {receipt ? (
              <div className="bg-[#EFECE6]/70 rounded-xl p-6 border border-[#2C3E35]/20 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#2C3E35] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono text-[#2C3E35] font-medium">
                      MÃ LỊCH HẸN #{receipt.bookingCode}
                    </div>
                    <h3 className="text-lg font-semibold text-[#141413] mt-0.5">
                      Đã giữ lịch hẹn thành công
                    </h3>
                  </div>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-3 border-t border-[#141413]/10">
                  <div>
                    <dt className="text-[#5C5B57]">Khách hàng</dt>
                    <dd className="font-medium text-[#141413] mt-0.5">
                      {receipt.fullName} · {receipt.phone}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#5C5B57]">Thời gian</dt>
                    <dd className="font-medium text-[#141413] tabular-nums mt-0.5">
                      {receipt.timeSlot}, ngày {receipt.date}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[#5C5B57]">Địa điểm Showroom</dt>
                    <dd className="font-medium text-[#141413] mt-0.5">{receipt.showroom}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-[#5C5B57]">Dịch vụ đăng ký</dt>
                    <dd className="font-medium text-[#141413] mt-0.5">{receipt.service}</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    setReceipt(null);
                    setFullName('');
                    setPhone('');
                  }}
                  className="px-4 py-2.5 text-xs font-medium text-[#141413] border border-[#141413]/20 rounded-lg hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                >
                  Đặt thêm lịch hẹn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apt-name" className="block text-xs font-medium text-[#141413] mb-1.5">
                      Họ và tên
                    </label>
                    <input
                      id="apt-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="VD: Nguyễn Minh Anh"
                      required
                      className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
                    />
                  </div>
                  <div>
                    <label htmlFor="apt-phone" className="block text-xs font-medium text-[#141413] mb-1.5">
                      Số điện thoại
                    </label>
                    <input
                      id="apt-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0909 123 456"
                      required
                      className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] tabular-nums focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="apt-showroom" className="block text-xs font-medium text-[#141413] mb-1.5">
                    Chọn Showroom
                  </label>
                  <div className="relative">
                    <MapPin
                      className="w-4 h-4 text-[#5C5B57] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <select
                      id="apt-showroom"
                      value={showroom}
                      onChange={(e) => setShowroom(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 min-h-[42px] text-sm bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
                    >
                      {SHOWROOMS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apt-date" className="block text-xs font-medium text-[#141413] mb-1.5">
                      Ngày hẹn
                    </label>
                    <div className="relative">
                      <Calendar
                        className="w-4 h-4 text-[#5C5B57] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <input
                        id="apt-date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 min-h-[42px] text-sm bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] tabular-nums focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="apt-time" className="block text-xs font-medium text-[#141413] mb-1.5">
                      Khung giờ
                    </label>
                    <div className="relative">
                      <Clock
                        className="w-4 h-4 text-[#5C5B57] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                      />
                      <select
                        id="apt-time"
                        value={timeSlot}
                        onChange={(e) => setTimeSlot(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 min-h-[42px] text-sm bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] tabular-nums cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="apt-service" className="block text-xs font-medium text-[#141413] mb-1.5">
                    Nhu cầu tư vấn
                  </label>
                  <select
                    id="apt-service"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-[#F7F6F2] border border-[#141413]/15 rounded-lg text-[#141413] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
                  >
                    {SERVICES.map((srv) => (
                      <option key={srv} value={srv}>
                        {srv}
                      </option>
                    ))}
                  </select>
                </div>

                {formError && (
                  <p role="alert" className="text-xs font-medium text-[#991B1B]">
                    {formError}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-6 min-h-[44px] text-sm font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer"
                >
                  Xác nhận đặt lịch hẹn
                </button>
              </form>
            )}
          </RevealBlock>
        </div>
      </div>
    </section>
  );
}
