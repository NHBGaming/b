import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Camera, Heart, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { EDITORIAL_EASE, RevealBlock } from './MotionPrimitives';
import {
  ColorVariant,
  EyewearCategory,
  EyewearProduct,
  FaceShapeId,
} from '../types/eyewear';
import {
  EYEWEAR_PRODUCTS,
  FACE_SHAPE_GUIDES,
  formatVND,
  LENS_OPTIONS,
} from '../data/eyewearData';
import { SafeImage } from './SafeImage';

interface ProductCatalogProps {
  selectedCategory: EyewearCategory;
  onSelectCategory: (category: EyewearCategory) => void;
  selectedFaceShape: FaceShapeId;
  onSelectFaceShape: (shape: FaceShapeId) => void;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenProduct: (product: EyewearProduct, variant: ColorVariant) => void;
  onOpenArTryOn: (product: EyewearProduct, variant: ColorVariant) => void;
  onQuickAdd: (product: EyewearProduct, variant: ColorVariant) => void;
}

type SortOption = 'featured' | 'price-asc' | 'price-desc';

const CATEGORY_TABS: { id: EyewearCategory; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'sunglasses', label: 'Kính mát' },
  { id: 'optical', label: 'Gọng cận' },
  { id: 'titanium', label: 'Titanium' },
];

export function ProductCatalog({
  selectedCategory,
  onSelectCategory,
  selectedFaceShape,
  onSelectFaceShape,
  wishlistIds,
  onToggleWishlist,
  onOpenProduct,
  onOpenArTryOn,
  onQuickAdd,
}: ProductCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [onlyWishlist, setOnlyWishlist] = useState(false);
  const [activeVariants, setActiveVariants] = useState<Record<string, string>>({});

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = EYEWEAR_PRODUCTS.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      if (selectedFaceShape !== 'all' && !item.faceShapes.includes(selectedFaceShape)) {
        return false;
      }
      if (onlyWishlist && !wishlistIds.includes(item.id)) {
        return false;
      }
      if (q) {
        const hay = `${item.name} ${item.categoryLabel} ${item.material} ${item.sku}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === 'price-asc') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    return list;
  }, [selectedCategory, selectedFaceShape, searchQuery, sortBy, onlyWishlist, wishlistIds]);

  const getSelectedVariant = (product: EyewearProduct): ColorVariant => {
    const chosenId = activeVariants[product.id];
    return product.variants.find((v) => v.id === chosenId) || product.variants[0];
  };

  const resetFilters = () => {
    onSelectCategory('all');
    onSelectFaceShape('all');
    setSearchQuery('');
    setOnlyWishlist(false);
    setSortBy('featured');
  };

  return (
    <section id="bo-suu-tap" className="py-16 lg:py-20 border-b border-[#141413]/10">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <RevealBlock className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-medium text-[#5C5B57] mb-2">
              Danh mục thiết kế · 6 mẫu gọng tiêu chuẩn
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#141413] tracking-tight text-balance">
              Bộ sưu tập Kính mát &amp; Gọng cận
            </h2>
          </div>

          <div className="text-sm text-[#5C5B57] tabular-nums">
            Hiển thị <span className="font-semibold text-[#141413]">{filteredProducts.length}</span> /{' '}
            {EYEWEAR_PRODUCTS.length} thiết kế
          </div>
        </RevealBlock>

        {/* Interactive Filter Toolbar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-8 mb-10 border-b border-[#141413]/10">
          {/* Category Segmented Tabs */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Lọc theo dòng kính"
              className="inline-flex items-center p-1 bg-[#EFECE6] rounded-lg"
            >
              {CATEGORY_TABS.map((tab) => {
                const isActive = selectedCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelectCategory(tab.id)}
                    className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#141413] shadow-xs'
                        : 'text-[#5C5B57] hover:text-[#141413]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Face Shape Dropdown Filter */}
            <div className="relative inline-flex items-center">
              <SlidersHorizontal
                className="w-3.5 h-3.5 text-[#5C5B57] absolute left-3 pointer-events-none"
                aria-hidden="true"
              />
              <select
                aria-label="Lọc theo dáng mặt"
                value={selectedFaceShape}
                onChange={(e) => onSelectFaceShape(e.target.value as FaceShapeId)}
                className="pl-8 pr-4 py-2.5 min-h-[40px] text-xs font-medium bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
              >
                <option value="all">Mọi dáng mặt</option>
                {FACE_SHAPE_GUIDES.map((g) => (
                  <option key={g.id} value={g.id}>
                    Hợp {g.label.toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Wishlist Filter Toggle */}
            <button
              type="button"
              onClick={() => setOnlyWishlist((prev) => !prev)}
              aria-pressed={onlyWishlist}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 min-h-[40px] text-xs font-medium rounded-lg border transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                onlyWishlist
                  ? 'bg-[#2C3E35] text-[#F7F6F2] border-[#2C3E35]'
                  : 'bg-[#FFFFFF] text-[#5C5B57] border-[#141413]/15 hover:text-[#141413]'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${onlyWishlist ? 'fill-current' : ''}`} />
              <span className="tabular-nums">Đã lưu ({wishlistIds.length})</span>
            </button>
          </div>

          {/* Search & Sort */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search
                className="w-4 h-4 text-[#5C5B57] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tên kính, chất liệu..."
                aria-label="Tìm kiếm mắt kính"
                className="w-full pl-9 pr-3 py-2 min-h-[40px] text-sm bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413] placeholder:text-[#5C5B57]/70 focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
              />
            </div>

            <select
              aria-label="Sắp xếp sản phẩm"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-3.5 py-2 min-h-[40px] text-xs font-medium bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413] cursor-pointer focus-visible:outline-2 focus-visible:outline-[#2C3E35]"
            >
              <option value="featured">Nổi bật nhất</option>
              <option value="price-asc">Giá: Thấp đến cao</option>
              <option value="price-desc">Giá: Cao đến thấp</option>
            </select>
          </div>
        </div>

        {/* Product Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 px-6 text-center bg-[#EFECE6]/60 rounded-xl border border-[#141413]/10">
            <p className="font-serif text-xl text-[#141413] mb-2">
              Không tìm thấy mẫu kính phù hợp với bộ lọc hiện tại.
            </p>
            <p className="text-sm text-[#5C5B57] mb-6">
              Thử xóa từ khóa tìm kiếm hoặc xem toàn bộ các mẫu gọng kính tại Solis Optique.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 min-h-[40px] text-xs font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => {
              const selectedVariant = getSelectedVariant(product);
              const isWishlisted = wishlistIds.includes(product.id);
              const defaultLens =
                product.category === 'sunglasses'
                  ? LENS_OPTIONS.sunglasses[0]
                  : LENS_OPTIONS.optical[0];

              return (
                <motion.article
                  key={product.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.08 }}
                  transition={{
                    duration: 0.5,
                    delay: (index % 3) * 0.07,
                    ease: EDITORIAL_EASE,
                  }}
                  className="group flex flex-col bg-[#FFFFFF] rounded-xl border border-[#141413]/10 overflow-hidden transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Image container (aspect 4:3) */}
                  <div className="relative aspect-[4/3] bg-[#EFECE6] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => onOpenProduct(product, selectedVariant)}
                      aria-label={`Xem chi tiết ${product.name}`}
                      className="block w-full h-full cursor-pointer text-left"
                    >
                      <SafeImage
                        src={product.image}
                        alt={`${product.name} — ${selectedVariant.name}`}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        fallbackLabel={product.name}
                      />
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenArTryOn(product, selectedVariant)}
                      aria-label={`Thử kính AR mẫu ${product.name}`}
                      className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-2 min-h-[36px] rounded-lg bg-[#FFFFFF]/92 backdrop-blur-xs text-xs font-medium text-[#141413] border border-[#141413]/10 hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#2C3E35]" aria-hidden="true" />
                      <span>Thử AR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleWishlist(product.id)}
                      aria-label={
                        isWishlisted
                          ? `Bỏ lưu ${product.name}`
                          : `Lưu ${product.name} vào danh sách yêu thích`
                      }
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#FFFFFF]/90 backdrop-blur-xs flex items-center justify-center text-[#141413] border border-[#141413]/10 hover:bg-[#FFFFFF] transition-colors cursor-pointer"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isWishlisted ? 'fill-[#2C3E35] text-[#2C3E35]' : 'text-[#5C5B57]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Card body with consistent field order */}
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      {/* Unboxed metadata with typographic separator */}
                      <div className="flex items-center justify-between gap-2 text-xs text-[#5C5B57] mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span>{product.categoryLabel}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">
                            {product.dimensions.lensWidth} □ {product.dimensions.bridge}
                          </span>
                        </div>
                        {product.tag && (
                          <span className="text-[#2C3E35] font-medium">{product.tag}</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenProduct(product, selectedVariant)}
                        className="text-left cursor-pointer group/title"
                      >
                        <h3 className="text-base font-semibold text-[#141413] group-hover/title:underline underline-offset-4">
                          {product.name}
                        </h3>
                      </button>

                      <p className="mt-1 text-xs text-[#5C5B57] line-clamp-2 leading-relaxed">
                        {product.material} · Trọng lượng {product.weightGrams}g
                      </p>
                    </div>

                    {/* Variant swatches + Price & Quick-Add */}
                    <div className="pt-3 border-t border-[#141413]/8 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2" role="group" aria-label="Chọn màu gọng">
                          {product.variants.map((variant) => {
                            const active = variant.id === selectedVariant.id;
                            return (
                              <button
                                key={variant.id}
                                type="button"
                                title={variant.name}
                                aria-label={`Màu ${variant.name}`}
                                aria-pressed={active}
                                onClick={() =>
                                  setActiveVariants((prev) => ({
                                    ...prev,
                                    [product.id]: variant.id,
                                  }))
                                }
                                className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                                  active
                                    ? 'ring-2 ring-offset-2 ring-[#141413] scale-105'
                                    : 'ring-1 ring-[#141413]/20 hover:scale-105'
                                }`}
                                style={{ backgroundColor: variant.hex }}
                              />
                            );
                          })}
                          <span className="text-xs text-[#5C5B57] ml-1 truncate max-w-[130px]">
                            {selectedVariant.name}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[15px] font-semibold text-[#141413] tabular-nums">
                          {formatVND(product.price)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenProduct(product, selectedVariant)}
                            className="px-3 py-2 min-h-[38px] text-xs font-medium text-[#141413] border border-[#141413]/15 rounded-lg hover:bg-[#EFECE6] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() => onQuickAdd(product, selectedVariant)}
                            aria-label={`Thêm ${product.name} (${defaultLens.name}) vào túi`}
                            className="inline-flex items-center gap-1 px-3 py-2 min-h-[38px] text-xs font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>Thêm vào túi</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
