export type EyewearCategory = 'all' | 'sunglasses' | 'optical' | 'titanium';

export type FaceShapeId = 'all' | 'round' | 'square' | 'oval' | 'heart';

export interface ColorVariant {
  id: string;
  name: string;
  hex: string;
  lensTint: string;
}

export interface LensOption {
  id: string;
  name: string;
  description: string;
  priceDelta: number;
}

export interface EyewearProduct {
  id: string;
  sku: string;
  name: string;
  category: Exclude<EyewearCategory, 'all'>;
  categoryLabel: string;
  material: string;
  price: number;
  image: string;
  dimensions: {
    lensWidth: number;
    bridge: number;
    temple: number;
  };
  weightGrams: number;
  faceShapes: Exclude<FaceShapeId, 'all'>[];
  description: string;
  craftNote: string;
  tag?: string;
  variants: ColorVariant[];
}

export interface CartItem {
  cartKey: string;
  product: EyewearProduct;
  variant: ColorVariant;
  lens: LensOption;
  quantity: number;
}

export interface OrderReceipt {
  orderCode: string;
  customerName: string;
  phone: string;
  address: string;
  paymentMethod: 'cod' | 'transfer';
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  createdAt: string;
}

export interface AppointmentReceipt {
  bookingCode: string;
  fullName: string;
  phone: string;
  showroom: string;
  date: string;
  timeSlot: string;
  service: string;
}
