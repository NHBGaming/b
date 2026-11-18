import { useEffect, useState } from 'react';
import { Camera, Check, Heart, Ruler, ShieldCheck, X } from 'lucide-react';
import { ColorVariant, EyewearProduct, LensOption } from '../types/eyewear';
import { FACE_SHAPE_GUIDES, formatVND, LENS_OPTIONS } from '../data/eyewearData';
import { SafeImage } from './SafeImage';

interface ProductDetailModalProps {
  product: EyewearProduct | null;
  initialVariant: ColorVariant | null;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onClose: () => void;
  onOpenArTryOn: (product: EyewearProduct, variant: ColorVariant) => void;
  onAddToCart: (product: EyewearProduct, variant: ColorVariant, lens: LensOption) => void;
}

export function ProductDetailModal({
  product,
  initialVariant,
  isWishlisted,
  onToggleWishlist,
  onClose,
  onOpenArTryOn,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedVariant, setSelectedVariant] = useState<ColorVariant | null>(null);
  const [selectedLens, setSelectedLens] = useState<LensOption | null>(null);

  useEffect(() => {
    if (!product) return;
    setSelectedVariant(initialVariant || product.variants[0]);
    const lensPool =
      product.category === 'sunglasses' ? LENS_OPTIONS.sunglasses : LENS_OPTIONS.optical;
    setSelectedLens(lensPool[0]);
  }, [product, initialVariant]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product || !selectedVariant || !selectedLens) return null;

  const lensPool =
    product.category === 'sunglasses' ? LENS_OPTIONS.sunglasses : LENS_OPTIONS.optical;
  const finalPrice = product.price + selectedLens.priceDelta;

  const matchingFaces = product.faceShapes
    .map((id) => FACE_SHAPE_GUIDES.find((f) => f.id === id)?.label)
    .filter(Boolean)
    .join(', ');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#141413]/55 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-[#F7F6F2] rounded-2xl border border-[#141413]/15 overflow-hidden shadow-2xl my-auto">
        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng cửa sổ chi tiết sản phẩm"
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#FFFFFF]/90 border border-[#141413]/10 flex items-center justify-center text-[#141413] hover:bg-[#FFFFFF] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Product Image & Technical Specs */}
          <div className="lg:col-span-6 bg-[#EFECE6] p-6 flex flex-col justify-between gap-6">
            <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#FFFFFF]">
              <SafeImage
                src={product.image}
                alt={`${product.name} — ${selectedVariant.name}`}
                className="w-full h-full object-cover"
                fallbackLabel={product.name}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-medium text-[#141413]">
                <Ruler className="w-4 h-4 text-[#2C3E35]" aria-hidden="true" />
                <span>Thông số kỹ thuật khung kính (mm)</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-[#FFFFFF] rounded-lg p-3 border border-[#141413]/8">
                  <div className="text-xs text-[#5C5B57]">Rộng tròng</div>
                  <div className="text-sm font-mono font-medium text-[#141413] tabular-nums mt-0.5">
                    {product.dimensions.lensWidth} mm
                  </div>
                </div>
                <div className="bg-[#FFFFFF] rounded-lg p-3 border border-[#141413]/8">
                  <div className="text-xs text-[#5C5B57]">Cầu mũi</div>
                  <div className="text-sm font-mono font-medium text-[#141413] tabular-nums mt-0.5">
                    {product.dimensions.bridge} mm
                  </div>
                </div>
                <div className="bg-[#FFFFFF] rounded-lg p-3 border border-[#141413]/8">
                  <div className="text-xs text-[#5C5B57]">Càng kính</div>
                  <div className="text-sm font-mono font-medium text-[#141413] tabular-nums mt-0.5">
                    {product.dimensions.temple} mm
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#5C5B57] leading-relaxed">
                {product.craftNote}
              </p>
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#5C5B57] mb-1.5">
                  <span>{product.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{product.sku}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.material}</span>
                </div>

                <h2 id="pdp-title" className="font-serif text-2xl sm:text-3xl font-medium text-[#141413]">
                  {product.name}
                </h2>

                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-xl font-semibold text-[#141413] tabular-nums">
                    {formatVND(finalPrice)}
                  </span>
                  {selectedLens.priceDelta > 0 && (
                    <span className="text-xs text-[#5C5B57] tabular-nums">
                      (Đã gồm {formatVND(selectedLens.priceDelta)} nâng cấp tròng)
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-[#5C5B57] leading-relaxed">
                {product.description}
              </p>

              <div className="text-xs text-[#141413]">
                <span className="text-[#5C5B57]">Dáng mặt phù hợp: </span>
                <span className="font-medium">{matchingFaces}</span>
              </div>

              {/* Color Variant Selector */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#141413]">
                  Màu sắc: <span className="text-[#5C5B57] font-normal">{selectedVariant.name} · Tròng {selectedVariant.lensTint}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  {product.variants.map((variant) => {
                    const active = variant.id === selectedVariant.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`inline-flex items-center gap-2 px-3 py-2 text-xs rounded-lg border transition-colors cursor-pointer ${
                          active
                            ? 'border-[#141413] bg-[#FFFFFF] text-[#141413] font-medium'
                            : 'border-[#141413]/15 bg-transparent text-[#5C5B57] hover:border-[#141413]/40'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-1 ring-[#141413]/20"
                          style={{ backgroundColor: variant.hex }}
                        />
                        <span>{variant.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Lens Option Selector */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-[#141413]">Tùy chọn tròng kính</div>
                <div className="space-y-2">
                  {lensPool.map((lens) => {
                    const active = lens.id === selectedLens.id;
                    return (
                      <button
                        key={lens.id}
                        type="button"
                        onClick={() => setSelectedLens(lens)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors cursor-pointer flex items-start justify-between gap-3 ${
                          active
                            ? 'border-[#2C3E35] bg-[#FFFFFF]'
                            : 'border-[#141413]/15 bg-transparent hover:bg-[#EFECE6]/50'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="text-xs font-semibold text-[#141413] flex items-center gap-1.5">
                            {active && <Check className="w-3.5 h-3.5 text-[#2C3E35]" />}
                            <span>{lens.name}</span>
                          </div>
                          <div className="text-xs text-[#5C5B57]">{lens.description}</div>
                        </div>
                        <span className="text-xs font-medium text-[#141413] tabular-nums shrink-0">
                          {lens.priceDelta === 0 ? 'Tiêu chuẩn' : `+${formatVND(lens.priceDelta)}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[#141413]/10 space-y-3">
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product, selectedVariant, selectedLens);
                    onClose();
                  }}
                  className="flex-1 py-3 px-5 min-h-[44px] text-sm font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Thêm vào túi — {formatVND(finalPrice)}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenArTryOn(product, selectedVariant);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 min-h-[44px] text-xs font-medium bg-[#EFECE6] text-[#141413] border border-[#141413]/15 rounded-lg hover:bg-[#2C3E35] hover:text-[#F7F6F2] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Camera className="w-4 h-4" aria-hidden="true" />
                  <span>Thử AR</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={isWishlisted ? 'Bỏ khỏi mục đã lưu' : 'Lưu sản phẩm'}
                  className="w-11 h-11 rounded-lg border border-[#141413]/20 flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] cursor-pointer shrink-0"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted ? 'fill-[#2C3E35] text-[#2C3E35]' : 'text-[#5C5B57]'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#5C5B57]">
                <ShieldCheck className="w-4 h-4 text-[#2C3E35] shrink-0" aria-hidden="true" />
                <span>Kèm hộp da thủ công, khăn lau microfiber và thẻ bảo hành 24 tháng.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
