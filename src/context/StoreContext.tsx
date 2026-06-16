/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { Product, Order, Coupon, SeasonalLookbook, UserFeedback } from '../types';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  lookbooks: SeasonalLookbook[];
  feedbacks: UserFeedback[];
  notifications: { id: string; title: string; message: string; date: string; type: 'sale' | 'arrival' | 'general' }[];
  isLoading: boolean;

  // Admin operations
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'creationDate'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  addUpcomingCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  addFeedback: (userName: string, userEmail: string, rating: number, message: string) => void;
  triggerSaleNotification: (title: string, message: string, type?: 'sale' | 'arrival' | 'general') => void;
  updateOrderStatus: (orderId: string, status: Order['deliveryStatus']) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Initial mock-up luxury sustainable minimalist products
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Aura Silk Dress',
    category: 'Dresses',
    price: 4900,
    originalPrice: 4900,
    description: 'A luxurious off-white silk dress featuring a minimalist slip cut, adjustable delicate straps, and a cowl neck finish. Sourced from organic mulberry silk fibers making it breathable and endlessly drapey.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 8, 'M': 5, 'L': 2, 'XL': 3, 'XXL': 2 },
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 14,
    creationDate: '2026-05-01T08:00:00Z',
    isNewArrival: true
  },
  {
    id: 'prod-2',
    name: 'Linum Tailored Blazer',
    category: 'Coats',
    price: 6400,
    originalPrice: 6400,
    description: 'An oversized, single-breasted blazer woven in sturdy organic Belgian linen. Tailored with neat notched lapels, two frontal welt pockets, and shell button closing. Pairs effortlessly with raw denim or tailored linen shorts.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 3, 'M': 6, 'L': 4, 'XL': 4, 'XXL': 1 },
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594744803329-e58b31de215f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548624149-f9c17d4d6351?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 22,
    creationDate: '2026-04-10T08:00:00Z',
    isNewArrival: false
  },
  {
    id: 'prod-3',
    name: 'Ribbed Knit Midi Slip',
    category: 'Knitwear',
    price: 3800,
    originalPrice: 3800,
    description: 'A close-fitting ribbed knit dress cut below the knee. Engineered with zero-waste whole garment knitting tech to produce a seamless finish that contours to your body with absolute flexibility and comfort.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 2, 'M': 3, 'L': 4, 'XL': 2, 'XXL': 1 },
    images: [
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 38,
    creationDate: '2026-02-15T08:00:00Z',
    isNewArrival: false
  },
  {
    id: 'prod-4',
    name: 'Raw Silk Pleated Trousers',
    category: 'Trousers',
    price: 5200,
    originalPrice: 5200,
    description: 'High-rise pleated trousers in rich textured raw silk. Features sharp pressed creases, side seam pockets, and a clean hook-and-bar bar waist belt closure. Naturally dyed using pomegranate peels.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 4, 'M': 5, 'L': 6, 'XL': 1, 'XXL': 3 },
    images: [
      'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 8,
    creationDate: '2026-05-18T08:00:00Z',
    isNewArrival: true
  },
  {
    id: 'prod-5',
    name: 'Elysian Wool Trench',
    category: 'Coats',
    price: 8900,
    originalPrice: 11000,
    description: 'Double-breasted trench silhouette woven in 100% fine Merino wool. Embellished with epaulettes, deep storm flaps, adjustable wrist straps, and a removable self-tie belt. This is the epitome of cold-weather elegance.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 2, 'M': 2, 'L': 1, 'XL': 3, 'XXL': 1 },
    images: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 3,
    creationDate: '2026-05-25T08:00:00Z',
    isNewArrival: true
  },
  {
    id: 'prod-6',
    name: 'Minimal Cotton Tee',
    category: 'Tees',
    price: 1800,
    originalPrice: 1800,
    description: 'An ultimate timeless wardrobe staple. Heavyweight 240GSM single-knit organic cotton jersey. Relaxed boxy shoulders with a tight rib collar detailing. Breathable, hypoallergenic, and extremely soft.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 25, 'M': 30, 'L': 20, 'XL': 15, 'XXL': 10 },
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 45,
    creationDate: '2026-01-10T08:00:00Z',
    isNewArrival: false
  },
  {
    id: 'prod-7',
    name: 'Suede Camel Wrap Coat',
    category: 'Coats',
    price: 9500,
    originalPrice: 9500,
    description: 'An ultra-soft recycled polyester suede wrap coat featuring deep tortoiseshell buckle cuffs, wide oversized lapels and double self-tie loops. Extremely light yet beautifully insulating for autumn shifts.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 4, 'M': 3, 'L': 5, 'XL': 2, 'XXL': 1 },
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1548624149-f9c17d4d6351?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 5,
    creationDate: '2026-04-20T08:00:00Z',
    isNewArrival: false
  },
  {
    id: 'prod-8',
    name: 'Pleated Silk Resort Shirt',
    category: 'Tees',
    price: 3400,
    originalPrice: 3400,
    description: 'Unisex resort collar button-up shirt featuring micro-accordion vertical pleats. Elegant drapes, light sand colorway, and breathable fabric that is completely moisture-wicking and fluid during high-summer nights.',
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: { 'S': 4, 'M': 1, 'L': 1, 'XL': 2, 'XXL': 1 },
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&auto=format&fit=crop&q=80'
    ],
    salesCount: 19,
    creationDate: '2026-03-01T08:00:00Z',
    isNewArrival: false
  }
];

const DEFAULT_COUPONS: Coupon[] = [
  {
    code: 'SWATI10',
    discountValue: 10,
    type: 'percent',
    minCartValue: 2000,
    isActive: true,
    description: 'Get 10% OFF on all premium collections. Min order ₹2000.'
  },
  {
    code: 'FESTIVE500',
    discountValue: 500,
    type: 'flat',
    minCartValue: 5000,
    isActive: true,
    description: 'Enjoy flat ₹500 discount for shopping above ₹5000.'
  },
  {
    code: 'LAUNCH15',
    discountValue: 15,
    type: 'percent',
    minCartValue: 1500,
    isActive: true,
    description: 'Exclusive 15% discount for early adopters. Min order ₹1500.'
  }
];

const DEFAULT_LOOKBOOKS: SeasonalLookbook[] = [
  {
    id: 'look-1',
    title: 'Spring/Summer 2026: The Air We Breathe',
    season: 'Spring/Summer 2026',
    description: 'An ode to transparency and raw textures. Highlighting organzas, mulberry silks and naturally soft organic unbleached linens styled with spacious flowing silhouettes that integrate perfectly with the summer sun.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1000&auto=format&fit=crop&q=80',
    featuredProductIds: ['prod-1', 'prod-2', 'prod-4']
  },
  {
    id: 'look-2',
    title: 'Autumn/Winter 2026: Tactile Isolation',
    season: 'Autumn/Winter 2026',
    description: 'Woven with dense weighted double-breasted knit linings, organic boiled wool blankets and brushed suede textures designed to shield you while keeping a striking sculptural posture.',
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1000&auto=format&fit=crop&q=80',
    featuredProductIds: ['prod-3', 'prod-5']
  }
];

const DEFAULT_ORDERS: Order[] = [
  {
    id: 'ORD-93021',
    userId: 'user-swati-1',
    userName: 'Aanya Sharma',
    userContact: '+919876543210',
    userAddress: '402, Signature Residency, GK II, New Delhi, India - 110048',
    items: [
      {
        productId: 'prod-1',
        productName: 'Aura Silk Dress',
        productImage: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        size: 'S',
        quantity: 1,
        priceAtPurchase: 4900
      },
      {
        productId: 'prod-6',
        productName: 'Minimal Cotton Tee',
        productImage: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        size: 'M',
        quantity: 2,
        priceAtPurchase: 1800
      }
    ],
    subtotal: 8500,
    discountCoinsApplied: 10,
    discountCouponApplied: 850,
    couponCodeUsed: 'SWATI10',
    totalPaid: 7640,
    paymentMethod: 'Credit/Debit Card',
    paymentId: 'TXN-SW-8193021A4',
    deliveryStatus: 'Delivered',
    date: '2026-06-05T14:24:00Z'
  },
  {
    id: 'ORD-84910',
    userId: 'user-swati-2',
    userName: 'Kabir Mehta',
    userContact: '+918123456789',
    userAddress: 'Block C-5, Ocean Heights, Worli Sea Face, Mumbai - 400030',
    items: [
      {
        productId: 'prod-3',
        productName: 'Ribbed Knit Midi Slip',
        productImage: 'https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=800&auto=format&fit=crop&q=80',
        size: 'M',
        quantity: 1,
        priceAtPurchase: 3800
      }
    ],
    subtotal: 3800,
    discountCoinsApplied: 0,
    discountCouponApplied: 0,
    totalPaid: 3800,
    paymentMethod: 'COD',
    paymentId: 'COD-SW-920412E',
    deliveryStatus: 'Shipped',
    date: '2026-06-08T09:12:00Z'
  }
];

const DEFAULT_FEEDBACKS: UserFeedback[] = [
  {
    id: 'feed-1',
    userName: 'Tanya Goel',
    userEmail: 'tanya@gmail.com',
    rating: 5,
    message: 'The Aura Silk Dress is pure absolute magic. Fits perfectly around my shoulders, draping elegant folds. Fast delivery too!',
    date: '2026-06-04T12:00:00Z'
  },
  {
    id: 'feed-2',
    userName: 'Rakesh Verma',
    userEmail: 'rakesh.v@yahoo.com',
    rating: 4,
    message: 'Excellent quality linen blazer. A tiny bit bulkier on the shoulder than expected, but lovely textured material.',
    date: '2026-06-07T16:45:00Z'
  }
];

const DEFAULT_NOTIFICATIONS: StoreContextType['notifications'] = [
  {
    id: 'notif-1',
    title: 'Autumn/Winter 26 Collection Teaser',
    message: 'Unveiling the Tactile Isolation AW line starting next Friday. Explore structured knit coats and suede layers today in lookbook.',
    date: '2026-06-10T09:00:00Z',
    type: 'arrival'
  },
  {
    id: 'notif-2',
    title: 'Mid-Year Architectural Sale',
    message: 'Receive flat 15% off utilizing LAUNCH15. Excludes raw trousers but includes silk items.',
    date: '2026-06-09T08:30:00Z',
    type: 'sale'
  }
];

// ─── Supabase Mapper Utilities ─────────────────────────────────────────────

const mapProductFromDb = (row: any): Product => ({
  id: row.id,
  name: row.name,
  category: row.category,
  price: Number(row.price),
  originalPrice: row.original_price ? Number(row.original_price) : undefined,
  description: row.description,
  sizes: row.sizes || [],
  stock: row.stock || {},
  images: row.images || [],
  salesCount: Number(row.sales_count || 0),
  creationDate: row.creation_date,
  isNewArrival: !!row.is_new_arrival,
  isUpcoming: !!row.is_upcoming,
  whatsappLink: row.whatsapp_link || undefined,
});

const mapProductToDb = (p: Partial<Product>) => {
  const row: any = {};
  if (p.id !== undefined) row.id = p.id;
  if (p.name !== undefined) row.name = p.name;
  if (p.category !== undefined) row.category = p.category;
  if (p.price !== undefined) row.price = p.price;
  if (p.originalPrice !== undefined) row.original_price = p.originalPrice;
  if (p.description !== undefined) row.description = p.description;
  if (p.sizes !== undefined) row.sizes = p.sizes;
  if (p.stock !== undefined) row.stock = p.stock;
  if (p.images !== undefined) row.images = p.images;
  if (p.salesCount !== undefined) row.sales_count = p.salesCount;
  if (p.creationDate !== undefined) row.creation_date = p.creationDate;
  if (p.isNewArrival !== undefined) row.is_new_arrival = p.isNewArrival;
  if (p.isUpcoming !== undefined) row.is_upcoming = p.isUpcoming;
  if (p.whatsappLink !== undefined) row.whatsapp_link = p.whatsappLink;
  return row;
};

const mapOrderFromDb = (row: any): Order => ({
  id: row.id,
  userId: row.user_id,
  userName: row.user_name,
  userContact: row.user_contact,
  userAddress: row.user_address,
  items: row.items || [],
  subtotal: Number(row.subtotal),
  discountCoinsApplied: Number(row.discount_coins_applied || 0),
  discountCouponApplied: Number(row.discount_coupon_applied || 0),
  couponCodeUsed: row.coupon_code_used || undefined,
  totalPaid: Number(row.total_paid),
  paymentMethod: row.payment_method,
  paymentId: row.payment_id,
  deliveryStatus: row.delivery_status,
  date: row.date,
});

const mapCouponFromDb = (row: any): Coupon => ({
  code: row.code,
  discountValue: Number(row.discount_value),
  type: row.type,
  minCartValue: Number(row.min_cart_value),
  isActive: !!row.is_active,
  description: row.description,
});

const mapCouponToDb = (c: Partial<Coupon>) => {
  const row: any = {};
  if (c.code !== undefined) row.code = c.code;
  if (c.discountValue !== undefined) row.discount_value = c.discountValue;
  if (c.type !== undefined) row.type = c.type;
  if (c.minCartValue !== undefined) row.min_cart_value = c.minCartValue;
  if (c.isActive !== undefined) row.is_active = c.isActive;
  if (c.description !== undefined) row.description = c.description;
  return row;
};

const mapFeedbackFromDb = (row: any): UserFeedback => ({
  id: row.id,
  userName: row.user_name,
  userEmail: row.user_email,
  rating: Number(row.rating),
  message: row.message,
  date: row.date,
});

const mapFeedbackToDb = (f: Partial<UserFeedback>) => {
  const row: any = {};
  if (f.id !== undefined) row.id = f.id;
  if (f.userName !== undefined) row.user_name = f.userName;
  if (f.userEmail !== undefined) row.user_email = f.userEmail;
  if (f.rating !== undefined) row.rating = f.rating;
  if (f.message !== undefined) row.message = f.message;
  if (f.date !== undefined) row.date = f.date;
  return row;
};

const mapNotificationFromDb = (row: any): StoreContextType['notifications'][number] => ({
  id: row.id,
  title: row.title,
  message: row.message,
  date: row.date,
  type: row.type,
});

const mapNotificationToDb = (n: Partial<StoreContextType['notifications'][number]>) => {
  const row: any = {};
  if (n.id !== undefined) row.id = n.id;
  if (n.title !== undefined) row.title = n.title;
  if (n.message !== undefined) row.message = n.message;
  if (n.date !== undefined) row.date = n.date;
  if (n.type !== undefined) row.type = n.type;
  return row;
};

// ───────────────────────────────────────────────────────────────────────────

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [lookbooks, setLookbooks] = useState<SeasonalLookbook[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [notifications, setNotifications] = useState<StoreContextType['notifications']>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ── 1. Bootstrap: fetch Supabase on mount ──
  useEffect(() => {
    const bootstrap = async () => {
      setLookbooks(DEFAULT_LOOKBOOKS);

      // --- Supabase Database Load ---
      try {
        // Check if database needs seeding
        const { count, error: countErr } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        if (!countErr && (count === 0 || count === null)) {
          console.log('[Supabase] Database is empty. Seeding defaults...');
          await Promise.all([
            supabase.from('products').insert(DEFAULT_PRODUCTS.map(mapProductToDb)),
            supabase.from('coupons').insert(DEFAULT_COUPONS.map(mapCouponToDb)),
            supabase.from('feedbacks').insert(DEFAULT_FEEDBACKS.map(mapFeedbackToDb)),
            supabase.from('notifications').insert(DEFAULT_NOTIFICATIONS.map(mapNotificationToDb)),
          ]);
        }

        // Fetch all tables
        const [
          { data: dbProducts },
          { data: dbOrders },
          { data: dbCoupons },
          { data: dbFeedbacks },
          { data: dbNotifications },
        ] = await Promise.all([
          supabase.from('products').select('*').order('creation_date', { ascending: false }),
          supabase.from('orders').select('*').order('date', { ascending: false }),
          supabase.from('coupons').select('*'),
          supabase.from('feedbacks').select('*').order('date', { ascending: false }),
          supabase.from('notifications').select('*').order('date', { ascending: false }),
        ]);

        setProducts(dbProducts ? dbProducts.map(mapProductFromDb) : DEFAULT_PRODUCTS);
        setOrders(dbOrders ? dbOrders.map(mapOrderFromDb) : DEFAULT_ORDERS);
        setCoupons(dbCoupons ? dbCoupons.map(mapCouponFromDb) : DEFAULT_COUPONS);
        setFeedbacks(dbFeedbacks ? dbFeedbacks.map(mapFeedbackFromDb) : DEFAULT_FEEDBACKS);
        setNotifications(dbNotifications ? dbNotifications.map(mapNotificationFromDb) : DEFAULT_NOTIFICATIONS);

      } catch (err) {
        console.error('[Bootstrap] Supabase connection failed. Falling back to defaults:', err);
        setProducts(DEFAULT_PRODUCTS);
        setOrders(DEFAULT_ORDERS);
        setCoupons(DEFAULT_COUPONS);
        setFeedbacks(DEFAULT_FEEDBACKS);
        setNotifications(DEFAULT_NOTIFICATIONS);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  // ── 2. Real-time Supabase subscriptions (Admin → Storefront sync) ──
  useEffect(() => {
    const handleProductChange = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newProd = mapProductFromDb(payload.new);
        setProducts(prev => [newProd, ...prev.filter(p => p.id !== newProd.id)]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedProd = mapProductFromDb(payload.new);
        setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
      } else if (payload.eventType === 'DELETE') {
        setProducts(prev => prev.filter(p => p.id !== payload.old.id));
      }
    };

    const handleOrderChange = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newOrder = mapOrderFromDb(payload.new);
        setOrders(prev => [newOrder, ...prev.filter(o => o.id !== newOrder.id)]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedOrder = mapOrderFromDb(payload.new);
        setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
      } else if (payload.eventType === 'DELETE') {
        setOrders(prev => prev.filter(o => o.id !== payload.old.id));
      }
    };

    const handleCouponChange = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newCoupon = mapCouponFromDb(payload.new);
        setCoupons(prev => [newCoupon, ...prev.filter(c => c.code !== newCoupon.code)]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedCoupon = mapCouponFromDb(payload.new);
        setCoupons(prev => prev.map(c => c.code === updatedCoupon.code ? updatedCoupon : c));
      } else if (payload.eventType === 'DELETE') {
        setCoupons(prev => prev.filter(c => c.code !== payload.old.code));
      }
    };

    const handleFeedbackChange = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newFB = mapFeedbackFromDb(payload.new);
        setFeedbacks(prev => [newFB, ...prev.filter(f => f.id !== newFB.id)]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedFB = mapFeedbackFromDb(payload.new);
        setFeedbacks(prev => prev.map(f => f.id === updatedFB.id ? updatedFB : f));
      } else if (payload.eventType === 'DELETE') {
        setFeedbacks(prev => prev.filter(f => f.id !== payload.old.id));
      }
    };

    const handleNotifChange = (payload: any) => {
      if (payload.eventType === 'INSERT') {
        const newNotif = mapNotificationFromDb(payload.new);
        setNotifications(prev => [newNotif, ...prev.filter(n => n.id !== newNotif.id)]);
      } else if (payload.eventType === 'UPDATE') {
        const updatedNotif = mapNotificationFromDb(payload.new);
        setNotifications(prev => prev.map(n => n.id === updatedNotif.id ? updatedNotif : n));
      } else if (payload.eventType === 'DELETE') {
        setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
      }
    };

    const channel = supabase
      .channel('store-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, handleProductChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, handleOrderChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, handleCouponChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedbacks' }, handleFeedbackChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, handleNotifChange)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (newProd: Omit<Product, 'id' | 'salesCount' | 'creationDate'>) => {
    const fresh: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      creationDate: new Date().toISOString()
    };
    
    setProducts(prev => [fresh, ...prev]);
    const { error } = await supabase.from('products').insert(mapProductToDb(fresh));
    if (error) {
      console.error('[Supabase] addProduct failed:', error);
      alert(`Database Error (Add Product): ${error.message}`);
    }
  };

  const updateProduct = async (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updated } : p));
    const { error } = await supabase.from('products').update(mapProductToDb(updated)).eq('id', id);
    if (error) {
      console.error('[Supabase] updateProduct failed:', error);
      alert(`Database Error (Update Product): ${error.message}`);
    }
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('[Supabase] deleteProduct failed:', error);
      alert(`Database Error (Delete Product): ${error.message}`);
    }
  };

  const addUpcomingCoupon = async (newCoupon: Coupon) => {
    setCoupons(prev => [newCoupon, ...prev]);
    const { error } = await supabase.from('coupons').insert(mapCouponToDb(newCoupon));
    if (error) {
      console.error('[Supabase] addUpcomingCoupon failed:', error);
      alert(`Database Error (Add Coupon): ${error.message}`);
    }
  };

  const deleteCoupon = async (code: string) => {
    setCoupons(prev => prev.filter(c => c.code !== code));
    const { error } = await supabase.from('coupons').delete().eq('code', code);
    if (error) {
      console.error('[Supabase] deleteCoupon failed:', error);
      alert(`Database Error (Delete Coupon): ${error.message}`);
    }
  };

  const addFeedback = async (userName: string, userEmail: string, rating: number, message: string) => {
    const feed: UserFeedback = {
      id: `feed-${Date.now()}`,
      userName,
      userEmail,
      rating,
      message,
      date: new Date().toISOString()
    };
    setFeedbacks(prev => [feed, ...prev]);
    const { error } = await supabase.from('feedbacks').insert(mapFeedbackToDb(feed));
    if (error) {
      console.error('[Supabase] addFeedback failed:', error);
      alert(`Database Error (Add Feedback): ${error.message}`);
    }
  };

  const triggerSaleNotification = async (title: string, message: string, type: 'sale' | 'arrival' | 'general' = 'general') => {
    const freshNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      type
    };
    setNotifications(prev => [freshNotif, ...prev]);
    const { error } = await supabase.from('notifications').insert(mapNotificationToDb(freshNotif));
    if (error) {
      console.error('[Supabase] triggerSaleNotification failed:', error);
      alert(`Database Error (Add Notification): ${error.message}`);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['deliveryStatus']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, deliveryStatus: status } : o));
    const { error } = await supabase.from('orders').update({ delivery_status: status }).eq('id', orderId);
    if (error) {
      console.error('[Supabase] updateOrderStatus failed:', error);
      alert(`Database Error (Update Order): ${error.message}`);
    }
  };

  return (
    <StoreContext.Provider value={{
      products,
      orders,
      coupons,
      lookbooks,
      feedbacks,
      notifications,
      isLoading,
      addProduct,
      updateProduct,
      deleteProduct,
      addUpcomingCoupon,
      deleteCoupon,
      addFeedback,
      triggerSaleNotification,
      updateOrderStatus
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
