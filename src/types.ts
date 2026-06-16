/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  category: string; // e.g. "Dresses", "Tees", "Coats", "Knitwear"
  price: number;
  originalPrice?: number; // Wishlist without discounted price, but cart has details
  description: string;
  sizes: string[]; // e.g. ["XS", "S", "M", "L", "XL"]
  stock: Record<string, number>; // Size -> Quantity
  images: string[]; // Multiple images for 360° or gallery
  salesCount: number;
  creationDate: string; // ISO string to check dead inventory
  isNewArrival?: boolean;
  isUpcoming?: boolean;
  whatsappLink?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  size: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  id: string; // order unique tracking id
  userId: string;
  userName: string;
  userContact: string; 
  userAddress: string;
  items: OrderItem[];
  subtotal: number;
  discountCoinsApplied: number; // 1 LS coin = 1 rupee
  discountCouponApplied: number;
  couponCodeUsed?: string;
  totalPaid: number;
  paymentMethod: 'Credit/Debit Card' | 'Digital Wallet' | 'UPI/Net Banking' | 'COD';
  paymentId: string; // unique payment tracking tracker
  deliveryStatus: 'Pending' | 'Shipped' | 'Delivered';
  date: string;
}


export interface Coupon {
  code: string;
  discountValue: number; // value of discount
  type: 'percent' | 'flat';
  minCartValue: number;
  isActive: boolean;
  description: string;
}

export interface SeasonalLookbook {
  id: string;
  title: string;
  season: string; // e.g. "Summer/Spring 2026", "Autumn/Winter 2026"
  description: string;
  image: string;
  featuredProductIds: string[];
}

export interface UserFeedback {
  id: string;
  userName: string;
  userEmail: string;
  rating: number;
  message: string;
  date: string;
}
