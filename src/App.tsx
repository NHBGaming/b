/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { Check } from 'lucide-react';
import { ScrollProgressLine } from './components/MotionPrimitives';
import {
  CartItem,
  ColorVariant,
  EyewearCategory,
  EyewearProduct,
  FaceShapeId,
  LensOption,
} from './types/eyewear';
import { EYEWEAR_PRODUCTS, LENS_OPTIONS } from './data/eyewearData';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductCatalog } from './components/ProductCatalog';
import { FaceShapeGuide } from './components/FaceShapeGuide';
import { VrShowroomSection } from './components/VrShowroomSection';
import { ShowroomAndReviews } from './components/ShowroomAndReviews';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ArTryOnStudio } from './components/ArTryOnStudio';
import { CartDrawer } from './components/CartDrawer';
import { OpticalChatbot } from './components/OpticalChatbot';
import { Footer } from './components/Footer';

const STORAGE_CART_KEY = 'solis_optique_cart_v1';
const STORAGE_WISHLIST_KEY = 'solis_optique_wishlist_v1';

export default function App() {
  const [selectedCategory, setSelectedCategory] = useState<EyewearCategory>('all');
  const [selectedFaceShape, setSelectedFaceShape] = useState<FaceShapeId>('all');
  const [cartOpen, setCartOpen] = useState(false);

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CART_KEY);
      return saved ? (JSON.parse(saved) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_WISHLIST_KEY);
      return saved ? (JSON.parse(saved) as string[]) : [];
    } catch {
      return [];
    }
  });

  const [activeProductModal, setActiveProductModal] = useState<{
    product: EyewearProduct;
    variant: ColorVariant;
  } | null>(null);

  const [arStudioState, setArStudioState] = useState<{
    isOpen: boolean;
    product: EyewearProduct;
    variant: ColorVariant;
  }>({
    isOpen: false,
    product: EYEWEAR_PRODUCTS[0],
    variant: EYEWEAR_PRODUCTS[0].variants[0],
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota errors
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_WISHLIST_KEY, JSON.stringify(wishlistIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [wishlistIds]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const addToCart = (product: EyewearProduct, variant: ColorVariant, lens: LensOption) => {
    const cartKey = `${product.id}__${variant.id}__${lens.id}`;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.cartKey === cartKey);
      if (existing) {
        return prev.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { cartKey, product, variant, lens, quantity: 1 }];
    });
    setToastMessage(`Đã thêm ${product.name} (${variant.name}) vào túi hàng`);
  };

  const handleQuickAdd = (product: EyewearProduct, variant: ColorVariant) => {
    const defaultLens =
      product.category === 'sunglasses' ? LENS_OPTIONS.sunglasses[0] : LENS_OPTIONS.optical[0];
    addToCart(product, variant, defaultLens);
  };

  const handleOpenArTryOn = (product: EyewearProduct, variant: ColorVariant) => {
    setArStudioState({ isOpen: true, product, variant });
  };

  const handleUpdateQty = (cartKey: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveItem = (cartKey: string) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const handleToggleWishlist = (productId: string) => {
    setWishlistIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleApplyFaceFilter = (shape: FaceShapeId) => {
    setSelectedFaceShape(shape);
    setSelectedCategory('all');
    const el = document.getElementById('bo-suu-tap');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#F7F6F2] text-[#141413]">
        <ScrollProgressLine />
        <Navbar
        cartCount={totalCartCount}
        onOpenCart={() => setCartOpen(true)}
        onSelectCategory={setSelectedCategory}
      />

      <main className="flex-1">
        <HeroSection
          onExploreClick={() => scrollToSection('bo-suu-tap')}
          onGuideClick={() => scrollToSection('tu-van-dang-mat')}
        />

        <ProductCatalog
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedFaceShape={selectedFaceShape}
          onSelectFaceShape={setSelectedFaceShape}
          wishlistIds={wishlistIds}
          onToggleWishlist={handleToggleWishlist}
          onOpenProduct={(product, variant) => setActiveProductModal({ product, variant })}
          onOpenArTryOn={handleOpenArTryOn}
          onQuickAdd={handleQuickAdd}
        />

        <FaceShapeGuide
          onApplyFaceFilter={handleApplyFaceFilter}
          onOpenProduct={(product, variant) => setActiveProductModal({ product, variant })}
        />

        <VrShowroomSection
          onOpenArTryOn={handleOpenArTryOn}
          onQuickAdd={handleQuickAdd}
        />

        <ShowroomAndReviews />
      </main>

      <Footer onSelectCategory={setSelectedCategory} />

      <ProductDetailModal
        product={activeProductModal?.product ?? null}
        initialVariant={activeProductModal?.variant ?? null}
        isWishlisted={
          activeProductModal ? wishlistIds.includes(activeProductModal.product.id) : false
        }
        onToggleWishlist={handleToggleWishlist}
        onClose={() => setActiveProductModal(null)}
        onOpenArTryOn={handleOpenArTryOn}
        onAddToCart={addToCart}
      />

      <ArTryOnStudio
        isOpen={arStudioState.isOpen}
        initialProduct={arStudioState.product}
        initialVariant={arStudioState.variant}
        onClose={() => setArStudioState((prev) => ({ ...prev, isOpen: false }))}
        onQuickAdd={handleQuickAdd}
      />

      <CartDrawer
        isOpen={cartOpen}
        items={cartItems}
        onClose={() => setCartOpen(false)}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={() => setCartItems([])}
      />

      <OpticalChatbot currentProductName={activeProductModal?.product.name} />

      {/* Non-intrusive cart feedback toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 right-5 z-40 flex items-center gap-2.5 bg-[#141413] text-[#F7F6F2] px-4 py-3 rounded-xl shadow-lg text-xs font-medium border border-[#F7F6F2]/15"
        >
          <Check className="w-4 h-4 text-[#A7C4B5] shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setCartOpen(true);
            }}
            className="ml-2 underline underline-offset-4 text-[#F7F6F2] hover:text-[#A7C4B5] cursor-pointer whitespace-nowrap"
          >
            Xem túi
          </button>
        </div>
      )}
      </div>
    </MotionConfig>
  );
}
