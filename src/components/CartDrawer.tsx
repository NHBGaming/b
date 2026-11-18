import { FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { CartItem, OrderReceipt } from '../types/eyewear';
import { formatVND } from '../data/eyewearData';
import { SafeImage } from './SafeImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQty: (cartKey: string, delta: number) => void;
  onRemoveItem: (cartKey: string) => void;
  onClearCart: () => void;
}

const FREE_SHIPPING_THRESHOLD = 2000000;
const STANDARD_SHIPPING_FEE = 35000;

export function CartDrawer({
  isOpen,
  items,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'confirmed'>('cart');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer'>('cod');
  const [errorMsg, setErrorMsg] = useState('');
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && items.length > 0 && step === 'confirmed') {
      setStep('cart');
    }
  }, [isOpen, items.length, step]);

  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + (item.product.price + item.lens.priceDelta) * item.quantity,
    0
  );
  const shippingFee =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
  const total = subtotal + shippingFee;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const handleCheckoutSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (customerName.trim().length < 2) {
      setErrorMsg('Vui lòng nhập họ tên người nhận.');
      return;
    }
    if (!/^[0-9+\s]{9,14}$/.test(phone.trim())) {
      setErrorMsg('Vui lòng nhập số điện thoại liên hệ hợp lệ.');
      return;
    }
    if (address.trim().length < 8) {
      setErrorMsg('Vui lòng nhập địa chỉ giao hàng chi tiết.');
      return;
    }

    setErrorMsg('');
    const receipt: OrderReceipt = {
      orderCode: `SO-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod,
      items: [...items],
      subtotal,
      shippingFee,
      total,
      createdAt: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setOrderReceipt(receipt);
    onClearCart();
    setStep('confirmed');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Túi hàng và thanh toán"
      className="fixed inset-0 z-50 flex justify-end bg-[#141413]/50 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#F7F6F2] h-full flex flex-col border-l border-[#141413]/15 shadow-2xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#141413]/10 flex items-center justify-between">
          <h2 className="font-serif text-xl font-medium text-[#141413]">
            {step === 'cart' && `Túi hàng (${items.reduce((a, b) => a + b.quantity, 0)})`}
            {step === 'checkout' && 'Thông tin giao hàng'}
            {step === 'confirmed' && 'Xác nhận đơn hàng'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng túi hàng"
            className="w-10 h-10 rounded-full flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'confirmed' && orderReceipt ? (
            <div className="space-y-6">
              <div className="bg-[#FFFFFF] rounded-xl p-6 border border-[#2C3E35]/20 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-[#2C3E35] shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-mono font-medium text-[#2C3E35]">
                      ĐƠN HÀNG #{orderReceipt.orderCode} ĐÃ XÁC NHẬN
                    </div>
                    <h3 className="text-base font-semibold text-[#141413] mt-0.5">
                      Đang chuẩn bị đóng gói tại xưởng
                    </h3>
                  </div>
                </div>

                <div className="text-xs text-[#5C5B57] space-y-1.5 pt-3 border-t border-[#141413]/10">
                  <div>
                    <span className="text-[#141413] font-medium">Người nhận: </span>
                    {orderReceipt.customerName} ({orderReceipt.phone})
                  </div>
                  <div>
                    <span className="text-[#141413] font-medium">Địa chỉ: </span>
                    {orderReceipt.address}
                  </div>
                  <div>
                    <span className="text-[#141413] font-medium">Thanh toán: </span>
                    {orderReceipt.paymentMethod === 'cod'
                      ? 'Thanh toán khi nhận hàng (COD)'
                      : 'Chuyển khoản ngân hàng'}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#141413]/10 space-y-2">
                  {orderReceipt.items.map((item) => (
                    <div
                      key={item.cartKey}
                      className="flex justify-between gap-2 text-xs text-[#141413]"
                    >
                      <span>
                        {item.quantity}x {item.product.name} ({item.variant.name})
                      </span>
                      <span className="tabular-nums font-medium shrink-0">
                        {formatVND((item.product.price + item.lens.priceDelta) * item.quantity)}
                      </span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-[#141413]/10 flex justify-between text-sm font-semibold text-[#141413]">
                    <span>Tổng thanh toán</span>
                    <span className="tabular-nums">{formatVND(orderReceipt.total)}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStep('cart');
                  onClose();
                }}
                className="w-full py-3 px-5 min-h-[44px] text-sm font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer"
              >
                Tiếp tục khám phá bộ sưu tập
              </button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <ShoppingBag className="w-10 h-10 text-[#5C5B57] stroke-[1.25] mb-3" />
              <h3 className="font-serif text-xl text-[#141413] mb-1.5">
                Túi hàng đang trống
              </h3>
              <p className="text-sm text-[#5C5B57] max-w-xs mb-6">
                Khám phá các thiết kế kính mát và gọng cận thủ công để thêm vào túi hàng của bạn.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 min-h-[40px] text-xs font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer"
              >
                Xem bộ sưu tập
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-5">
              {/* Free shipping threshold indicator */}
              <div className="p-3.5 rounded-lg bg-[#EFECE6] text-xs text-[#141413]">
                {remainingForFreeShipping === 0 ? (
                  <span className="font-medium text-[#2C3E35]">
                    Đơn hàng của bạn đủ điều kiện miễn phí giao hàng toàn quốc.
                  </span>
                ) : (
                  <span>
                    Mua thêm{' '}
                    <strong className="tabular-nums">
                      {formatVND(remainingForFreeShipping)}
                    </strong>{' '}
                    để được miễn phí vận chuyển.
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const unitPrice = item.product.price + item.lens.priceDelta;
                  return (
                    <div
                      key={item.cartKey}
                      className="flex gap-4 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#141413]/10"
                    >
                      <div className="w-24 aspect-[4/3] rounded-lg overflow-hidden bg-[#EFECE6] shrink-0">
                        <SafeImage
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-semibold text-[#141413] truncate">
                              {item.product.name}
                            </h3>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.cartKey)}
                              aria-label={`Xóa ${item.product.name} khỏi túi`}
                              className="text-[#5C5B57] hover:text-[#141413] p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-[#5C5B57] mt-0.5">
                            {item.variant.name} · {item.lens.name}
                          </p>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="inline-flex items-center border border-[#141413]/15 rounded-md bg-[#F7F6F2]">
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartKey, -1)}
                              aria-label="Giảm số lượng"
                              className="w-8 h-8 flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-7 text-center text-xs font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQty(item.cartKey, 1)}
                              aria-label="Tăng số lượng"
                              className="w-8 h-8 flex items-center justify-center text-[#141413] hover:bg-[#EFECE6] cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className="text-sm font-semibold text-[#141413] tabular-nums">
                            {formatVND(unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="co-name" className="block text-xs font-medium text-[#141413] mb-1.5">
                  Họ và tên người nhận
                </label>
                <input
                  id="co-name"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413]"
                />
              </div>

              <div>
                <label htmlFor="co-phone" className="block text-xs font-medium text-[#141413] mb-1.5">
                  Số điện thoại
                </label>
                <input
                  id="co-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0909 123 456"
                  required
                  className="w-full px-3.5 py-2.5 min-h-[42px] text-sm bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413] tabular-nums"
                />
              </div>

              <div>
                <label htmlFor="co-address" className="block text-xs font-medium text-[#141413] mb-1.5">
                  Địa chỉ nhận hàng
                </label>
                <textarea
                  id="co-address"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  required
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#141413]/15 rounded-lg text-[#141413]"
                />
              </div>

              <div className="space-y-2">
                <span className="block text-xs font-medium text-[#141413]">
                  Phương thức thanh toán
                </span>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-lg border text-left text-xs cursor-pointer ${
                      paymentMethod === 'cod'
                        ? 'border-[#2C3E35] bg-[#FFFFFF] font-medium text-[#141413]'
                        : 'border-[#141413]/15 text-[#5C5B57]'
                    }`}
                  >
                    Thanh toán khi nhận hàng (COD) — Kiểm tra kính trước khi trả tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    className={`p-3 rounded-lg border text-left text-xs cursor-pointer ${
                      paymentMethod === 'transfer'
                        ? 'border-[#2C3E35] bg-[#FFFFFF] font-medium text-[#141413]'
                        : 'border-[#141413]/15 text-[#5C5B57]'
                    }`}
                  >
                    Chuyển khoản ngân hàng (VietQR)
                  </button>
                </div>
              </div>

              {errorMsg && (
                <p role="alert" className="text-xs font-medium text-[#991B1B]">
                  {errorMsg}
                </p>
              )}
            </form>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && step !== 'confirmed' && (
          <div className="p-6 border-t border-[#141413]/10 bg-[#FFFFFF] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#5C5B57]">
                <span>Tạm tính</span>
                <span className="tabular-nums">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5C5B57]">
                <span>Phí vận chuyển</span>
                <span className="tabular-nums">
                  {shippingFee === 0 ? 'Miễn phí' : formatVND(shippingFee)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-[#141413] pt-2 border-t border-[#141413]/10">
                <span>Tổng cộng</span>
                <span className="tabular-nums">{formatVND(total)}</span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-6 min-h-[44px] text-sm font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer"
              >
                Tiến hành đặt hàng
              </button>
            ) : (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="px-4 py-3 min-h-[44px] text-xs font-medium border border-[#141413]/20 text-[#141413] rounded-lg hover:bg-[#EFECE6] cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  className="flex-1 py-3 px-6 min-h-[44px] text-sm font-medium bg-[#141413] text-[#F7F6F2] rounded-lg hover:bg-[#2C3E35] transition-colors cursor-pointer"
                >
                  Hoàn tất đơn hàng
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
