import { EyewearCategory } from '../types/eyewear';

interface FooterProps {
  onSelectCategory: (category: EyewearCategory) => void;
}

export function Footer({ onSelectCategory }: FooterProps) {
  const scrollToCatalog = (category: EyewearCategory) => {
    onSelectCategory(category);
    const el = document.getElementById('bo-suu-tap');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#141413] text-[#F7F6F2] py-14">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-10 border-b border-[#F7F6F2]/12">
          <div className="md:col-span-5 space-y-3">
            <div className="font-serif text-2xl font-medium tracking-tight">SOLIS OPTIQUE</div>
            <p className="text-sm text-[#F7F6F2]/70 leading-relaxed max-w-sm">
              Nhà chế tác &amp; tuyển chọn mắt kính thời trang từ Cellulose Acetate Nhật Bản và Beta-Titanium siêu nhẹ.
            </p>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <div className="text-xs font-medium text-[#F7F6F2]/60 mb-3">Danh mục</div>
            <ul className="space-y-2 text-[#F7F6F2]/85">
              <li>
                <button
                  type="button"
                  onClick={() => scrollToCatalog('all')}
                  className="hover:underline underline-offset-4 cursor-pointer"
                >
                  Tất cả thiết kế
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToCatalog('sunglasses')}
                  className="hover:underline underline-offset-4 cursor-pointer"
                >
                  Kính mát phân cực
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToCatalog('optical')}
                  className="hover:underline underline-offset-4 cursor-pointer"
                >
                  Gọng cận Acetate
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => scrollToCatalog('titanium')}
                  className="hover:underline underline-offset-4 cursor-pointer"
                >
                  Dòng Beta-Titanium
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 space-y-2.5 text-sm">
            <div className="text-xs font-medium text-[#F7F6F2]/60 mb-3">Hệ thống Showroom</div>
            <div className="space-y-2 text-xs text-[#F7F6F2]/80 leading-relaxed">
              <p>TP.HCM: 42 Xuân Thủy, Thảo Điền · 118 Lý Tự Trọng, Q.1</p>
              <p>Hà Nội: 27 Nhà Chung, Quận Hoàn Kiếm</p>
              <p>Giờ mở cửa: 09:30 – 21:00 mỗi ngày</p>
              <p className="tabular-nums">Hotline tư vấn: 1900 6868 42</p>
            </div>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#F7F6F2]/60">
          <span>© 2026 Solis Optique. Bảo lưu mọi quyền.</span>
          <span>Bảo hành gọng 24 tháng · Đổi trả miễn phí 14 ngày</span>
        </div>
      </div>
    </footer>
  );
}
