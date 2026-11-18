import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { EyewearCategory } from '../types/eyewear';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  onSelectCategory: (category: EyewearCategory) => void;
}

export function Navbar({ cartCount, onOpenCart, onSelectCategory }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavCategory = (category: EyewearCategory) => {
    onSelectCategory(category);
    setMobileMenuOpen(false);
    const el = document.getElementById('bo-suu-tap');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F7F6F2]/95 backdrop-blur-sm border-b border-[#141413]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single-line brand wordmark */}
        <a
          href="#top"
          className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2C3E35]"
        >
          SOLIS OPTIQUE
        </a>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav
          aria-label="Điều hướng chính"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#5C5B57]"
        >
          <button
            type="button"
            onClick={() => handleNavCategory('all')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Bộ sưu tập
          </button>
          <button
            type="button"
            onClick={() => handleNavCategory('sunglasses')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kính mát
          </button>
          <button
            type="button"
            onClick={() => handleNavCategory('optical')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Gọng cận
          </button>
          <button
            type="button"
            onClick={() => handleNavSection('vr-ar-studio')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            VR &amp; AR
          </button>
          <button
            type="button"
            onClick={() => handleNavSection('showroom')}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Showroom
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            aria-label={`Mở túi hàng, hiện có ${cartCount} sản phẩm`}
            className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[40px] text-xs font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2C3E35]"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="tabular-nums">Túi hàng ({cartCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            aria-expanded={mobileMenuOpen}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-[#141413]/15 text-[#141413] cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile navigation dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#141413]/10 bg-[#F7F6F2] px-4 py-3">
          <nav className="flex flex-col gap-1 text-sm font-medium text-[#141413]">
            <button
              type="button"
              onClick={() => handleNavCategory('all')}
              className="text-left py-2.5 px-2 rounded-md hover:bg-[#EFECE6]"
            >
              Bộ sưu tập
            </button>
            <button
              type="button"
              onClick={() => handleNavCategory('sunglasses')}
              className="text-left py-2.5 px-2 rounded-md hover:bg-[#EFECE6]"
            >
              Kính mát
            </button>
            <button
              type="button"
              onClick={() => handleNavCategory('optical')}
              className="text-left py-2.5 px-2 rounded-md hover:bg-[#EFECE6]"
            >
              Gọng cận
            </button>
            <button
              type="button"
              onClick={() => handleNavSection('vr-ar-studio')}
              className="text-left py-2.5 px-2 rounded-md hover:bg-[#EFECE6]"
            >
              VR 360° &amp; Thử kính AR
            </button>
            <button
              type="button"
              onClick={() => handleNavSection('tu-van-dang-mat')}
              className="text-left py-2.5 px-2 rounded-md hover:bg-[#EFECE6]"
            >
              Tư vấn dáng mặt
            </button>
            <button
              type="button"
              onClick={() => handleNavSection('showroom')}
              className="text-left py-2.5 px-2 rounded-md hover:bg-[#EFECE6]"
            >
              Showroom &amp; Đo mắt
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
