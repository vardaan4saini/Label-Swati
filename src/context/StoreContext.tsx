/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Order, UserAccount, Coupon, SeasonalLookbook, UserFeedback, OrderItem } from '../types';

interface StoreContextType {
  products: Product[];
  orders: Order[];
  users: UserAccount[];
  currentUser: UserAccount | null;
  coupons: Coupon[];
  lookbooks: SeasonalLookbook[];
  feedbacks: UserFeedback[];
  wishlist: string[]; // Product IDs
  cart: { productId: string; size: string; quantity: number }[];
  notifications: { id: string; title: string; message: string; date: string; type: 'sale' | 'arrival' | 'general' }[];
  
  // App operations
  addProduct: (product: Omit<Product, 'id' | 'salesCount' | 'creationDate'>) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  placeOrder: (
    shippingDetails: { name: string; contact: string; address: string },
    paymentMethod: Order['paymentMethod'],
    coinsToRedeem: number,
    couponCode?: string
  ) => { success: boolean; orderId?: string; error?: string };
  registerUser: (name: string, contactNumber: string, address: string) => UserAccount;
  setCurrentUserById: (id: string) => void;
  logoutUser: () => void;
  updateCurrentUserProfile: (profile: Partial<UserAccount>) => void;
  addUpcomingCoupon: (coupon: Coupon) => void;
  deleteCoupon: (code: string) => void;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  addToCart: (productId: string, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateCartQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
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

const DEFAULT_USERS: UserAccount[] = [
  {
    id: 'user-swati-1',
    name: 'Aanya Sharma',
    contactNumber: '+919876543210',
    address: '402, Signature Residency, GK II, New Delhi, India - 110048',
    referralCode: 'AANYA02',
    slCoins: 120, // Preloaded LS coins
    referralsCount: 4
  },
  {
    id: 'user-swati-2',
    name: 'Kabir Mehta',
    contactNumber: '+918123456789',
    address: 'Block C-5, Ocean Heights, Worli Sea Face, Mumbai - 400030',
    referralCode: 'KABIR89',
    slCoins: 45,
    referralsCount: 1
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
    discountCouponApplied: 850, // 10% of 8500
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

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Autumn/Winter 26 Collection Teaser',
    message: 'Unveiling the Tactile Isolation AW line starting next Friday. Explore structured knit coats and suede layers today in lookbook.',
    date: '2026-06-10T09:00:00Z',
    type: 'arrival' as const
  },
  {
    id: 'notif-2',
    title: 'Mid-Year Architectural Sale',
    message: 'Receive flat 15% off utilizing LAUNCH15. Excludes raw trousers but includes silk items.',
    date: '2026-06-09T08:30:00Z',
    type: 'sale' as const
  }
];

// Safe proxy wrapper around localStorage to catch and handle QuotaExceededError gracefully
const ls = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('[LocalStorage] getItem failed:', e);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch (error: any) {
      console.warn(`[LocalStorage] Failed to set key "${key}":`, error);
      const isQuotaError = 
        error?.name === 'QuotaExceededError' || 
        error?.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
        error?.code === 22 || 
        error?.code === 1014 || 
        error?.message?.toLowerCase().includes('quota') || 
        error?.message?.toLowerCase().includes('exceeded');

      if (isQuotaError) {
        if (key === 'sw_products') {
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed)) {
              // Strip massive base64 images and replace them with standard mock placeholders to fit within local storage quota
              const pruned = parsed.map((p: any) => ({
                ...p,
                image: p.image?.startsWith('data:image') 
                  ? 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80' 
                  : p.image,
                images: p.images 
                  ? p.images.map((img: string) => img?.startsWith('data:image') 
                    ? 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80' 
                    : img) 
                  : []
              }));
              localStorage.setItem(key, JSON.stringify(pruned));
              console.log('[LocalStorage] Successfully saved pruned products database within quota constraints.');
            }
          } catch (innerErr) {
            console.error('[LocalStorage] Failed to parse and prune products state:', innerErr);
          }
        } else if (key === 'sw_orders' || key === 'sw_feedbacks' || key === 'sw_notifs') {
          // Slice older entries to conserve space
          try {
            const parsed = JSON.parse(value);
            if (Array.isArray(parsed) && parsed.length > 20) {
              localStorage.setItem(key, JSON.stringify(parsed.slice(0, 20)));
              console.log(`[LocalStorage] Saved top 20 items of key "${key}" to preserve quota space.`);
            }
          } catch (innerErr) {}
        }
      }
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('[LocalStorage] removeItem failed:', e);
    }
  }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [lookbooks, setLookbooks] = useState<SeasonalLookbook[]>([]);
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<{ productId: string; size: string; quantity: number }[]>([]);
  const [notifications, setNotifications] = useState<StoreContextType['notifications']>([]);

  // Load state from localStorage on mount and sync with Server
  useEffect(() => {
    try {
      const storedProducts = ls.getItem('sw_products');
      const storedOrders = ls.getItem('sw_orders');
      const storedUsers = ls.getItem('sw_users');
      const storedCurUser = ls.getItem('sw_current_user');
      const storedCoupons = ls.getItem('sw_coupons');
      const storedLookbooks = ls.getItem('sw_lookbooks');
      const storedFeedbacks = ls.getItem('sw_feedbacks');
      const storedWishlist = ls.getItem('sw_wishlist');
      const storedCart = ls.getItem('sw_cart');
      const storedNotifs = ls.getItem('sw_notifs');

      let lProducts = DEFAULT_PRODUCTS;
      let lOrders = DEFAULT_ORDERS;
      let lCoupons = DEFAULT_COUPONS;
      let lLookbooks = DEFAULT_LOOKBOOKS;
      let lFeedbacks = DEFAULT_FEEDBACKS;
      let lNotifs = DEFAULT_NOTIFICATIONS;

      if (storedProducts) {
        lProducts = JSON.parse(storedProducts);
        setProducts(lProducts);
      } else {
        setProducts(DEFAULT_PRODUCTS);
        ls.setItem('sw_products', JSON.stringify(DEFAULT_PRODUCTS));
      }

      if (storedOrders) {
        lOrders = JSON.parse(storedOrders);
        setOrders(lOrders);
      } else {
        setOrders(DEFAULT_ORDERS);
        ls.setItem('sw_orders', JSON.stringify(DEFAULT_ORDERS));
      }

      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
        if (storedCurUser) {
          const cur = JSON.parse(storedCurUser);
          const activeUser = parsedUsers.find((u: UserAccount) => u.id === cur.id);
          setCurrentUser(activeUser || parsedUsers[0]);
        } else {
          setCurrentUser(parsedUsers[0]);
          ls.setItem('sw_current_user', JSON.stringify(parsedUsers[0]));
        }
      } else {
        setUsers(DEFAULT_USERS);
        setCurrentUser(DEFAULT_USERS[0]);
        ls.setItem('sw_users', JSON.stringify(DEFAULT_USERS));
        ls.setItem('sw_current_user', JSON.stringify(DEFAULT_USERS[0]));
      }

      if (storedCoupons) {
        lCoupons = JSON.parse(storedCoupons);
        setCoupons(lCoupons);
      } else {
        setCoupons(DEFAULT_COUPONS);
        ls.setItem('sw_coupons', JSON.stringify(DEFAULT_COUPONS));
      }

      if (storedLookbooks) {
        lLookbooks = JSON.parse(storedLookbooks);
        setLookbooks(lLookbooks);
      } else {
        setLookbooks(DEFAULT_LOOKBOOKS);
        ls.setItem('sw_lookbooks', JSON.stringify(DEFAULT_LOOKBOOKS));
      }

      if (storedFeedbacks) {
        lFeedbacks = JSON.parse(storedFeedbacks);
        setFeedbacks(lFeedbacks);
      } else {
        setFeedbacks(DEFAULT_FEEDBACKS);
        ls.setItem('sw_feedbacks', JSON.stringify(DEFAULT_FEEDBACKS));
      }

      if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      if (storedCart) setCart(JSON.parse(storedCart));

      if (storedNotifs) {
        lNotifs = JSON.parse(storedNotifs);
        setNotifications(lNotifs);
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
        ls.setItem('sw_notifs', JSON.stringify(DEFAULT_NOTIFICATIONS));
      }

      // Sync central store state immediately
      const syncOnMount = async () => {
        try {
          const res = await fetch('/api/state');
          if (res.ok) {
            const serverData = await res.json();
            if (serverData && serverData.products && serverData.products.length > 0) {
              setProducts(serverData.products);
              setOrders(serverData.orders || []);
              setCoupons(serverData.coupons || []);
              setFeedbacks(serverData.feedbacks || []);
              setNotifications(serverData.notifications || []);
              ls.setItem('sw_products', JSON.stringify(serverData.products));
              ls.setItem('sw_orders', JSON.stringify(serverData.orders || []));
              ls.setItem('sw_coupons', JSON.stringify(serverData.coupons || []));
              ls.setItem('sw_feedbacks', JSON.stringify(serverData.feedbacks || []));
              ls.setItem('sw_notifs', JSON.stringify(serverData.notifications || []));
            } else {
              // Server state is empty/newly booted, seed it with the current default collections
              await fetch('/api/state', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  products: lProducts,
                  orders: lOrders,
                  coupons: lCoupons,
                  feedbacks: lFeedbacks,
                  notifications: lNotifs
                })
              });
            }
          }
        } catch (err) {
          console.error("Mount sync with central DB failed:", err);
        }
      };
      
      syncOnMount();

    } catch (e) {
      console.error('Error loading localStorage state for Label Swati', e);
    }
  }, []);

  // Periodic polling for multi-device realtime synchronization
  useEffect(() => {
    const handlePoll = async () => {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const serverData = await res.json();
          if (serverData && serverData.products && serverData.products.length > 0) {
            if (JSON.stringify(serverData.products) !== JSON.stringify(products) && products.length > 0) {
              setProducts(serverData.products);
              ls.setItem('sw_products', JSON.stringify(serverData.products));
            }
            if (JSON.stringify(serverData.orders) !== JSON.stringify(orders) && orders.length > 0) {
              setOrders(serverData.orders);
              ls.setItem('sw_orders', JSON.stringify(serverData.orders));
            }
            if (JSON.stringify(serverData.coupons) !== JSON.stringify(coupons) && coupons.length > 0) {
              setCoupons(serverData.coupons);
              ls.setItem('sw_coupons', JSON.stringify(serverData.coupons));
            }
            if (JSON.stringify(serverData.feedbacks) !== JSON.stringify(feedbacks) && feedbacks.length > 0) {
              setFeedbacks(serverData.feedbacks);
              ls.setItem('sw_feedbacks', JSON.stringify(serverData.feedbacks));
            }
            if (JSON.stringify(serverData.notifications) !== JSON.stringify(notifications) && notifications.length > 0) {
              setNotifications(serverData.notifications);
              ls.setItem('sw_notifs', JSON.stringify(serverData.notifications));
            }
          }
        }
      } catch (e) {
        // Suppress errors during reload
      }
    };

    const timer = setInterval(handlePoll, 4000);
    return () => clearInterval(timer);
  }, [products, orders, coupons, feedbacks, notifications]);

  // Push individual changes to Express database
  const pushStateToServer = async (partialState: any) => {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialState)
      });
    } catch (err) {
      console.error("Failed to sync partial state to server:", err);
    }
  };

  // Save utility wrappers
  const saveProducts = (prods: Product[]) => {
    setProducts(prods);
    ls.setItem('sw_products', JSON.stringify(prods));
    pushStateToServer({ products: prods });
  };

  const saveOrders = (ords: Order[]) => {
    setOrders(ords);
    ls.setItem('sw_orders', JSON.stringify(ords));
    pushStateToServer({ orders: ords });
  };

  const saveUsers = (us: UserAccount[]) => {
    setUsers(us);
    ls.setItem('sw_users', JSON.stringify(us));
  };

  const saveCurUser = (user: UserAccount | null) => {
    setCurrentUser(user);
    if (user) {
      ls.setItem('sw_current_user', JSON.stringify(user));
      // update user list too
      const updatedList = users.map(u => u.id === user.id ? user : u);
      saveUsers(updatedList);
    } else {
      ls.removeItem('sw_current_user');
    }
  };

  const saveCoupons = (cps: Coupon[]) => {
    setCoupons(cps);
    ls.setItem('sw_coupons', JSON.stringify(cps));
    pushStateToServer({ coupons: cps });
  };

  const saveFeedbacks = (fbs: UserFeedback[]) => {
    setFeedbacks(fbs);
    ls.setItem('sw_feedbacks', JSON.stringify(fbs));
    pushStateToServer({ feedbacks: fbs });
  };

  // State modification handlers
  const addProduct = (newProd: Omit<Product, 'id' | 'salesCount' | 'creationDate'>) => {
    const fresh: Product = {
      ...newProd,
      id: `prod-${Date.now()}`,
      salesCount: 0,
      creationDate: new Date().toISOString()
    };
    const updated = [fresh, ...products];
    saveProducts(updated);
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    const modified = products.map(p => p.id === id ? { ...p, ...updated } : p);
    saveProducts(modified);
  };

  const deleteProduct = (id: string) => {
    const modified = products.filter(p => p.id !== id);
    saveProducts(modified);
  };

  const registerUser = (name: string, contactNumber: string, address: string) => {
    const codePrefix = name.substring(0, 5).toUpperCase().replace(/\s/g, '');
    const referralCode = `${codePrefix}${Math.floor(10 + Math.random() * 90)}`;
    
    const freshUser: UserAccount = {
      id: `usr-${Date.now()}`,
      name,
      contactNumber,
      address,
      referralCode,
      slCoins: 0, 
      referralsCount: 0
    };

    const updatedWithNew = [...users, freshUser];
    saveUsers(updatedWithNew);
    saveCurUser(freshUser);

    return freshUser;
  };

  const setCurrentUserById = (id: string) => {
    const target = users.find(u => u.id === id);
    if (target) {
      saveCurUser(target);
    }
  };

  const logoutUser = () => {
    saveCurUser(null);
  };

  const updateCurrentUserProfile = (profile: Partial<UserAccount>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...profile };
      saveCurUser(updated);
    }
  };

  const addUpcomingCoupon = (newCoupon: Coupon) => {
    const updated = [newCoupon, ...coupons];
    saveCoupons(updated);
  };

  const deleteCoupon = (code: string) => {
    const updated = coupons.filter(c => c.code !== code);
    saveCoupons(updated);
  };

  const addToWishlist = (productId: string) => {
    if (!wishlist.includes(productId)) {
      const updated = [...wishlist, productId];
      setWishlist(updated);
      ls.setItem('sw_wishlist', JSON.stringify(updated));
    }
  };

  const removeFromWishlist = (productId: string) => {
    const updated = wishlist.filter(id => id !== productId);
    setWishlist(updated);
    ls.setItem('sw_wishlist', JSON.stringify(updated));
  };

  const addToCart = (productId: string, size: string, quantity = 1) => {
    const itemIdx = cart.findIndex(c => c.productId === productId && c.size === size);
    let updated;
    if (itemIdx > -1) {
      updated = cart.map((c, i) => i === itemIdx ? { ...c, quantity: c.quantity + quantity } : c);
    } else {
      updated = [...cart, { productId, size, quantity }];
    }
    setCart(updated);
    ls.setItem('sw_cart', JSON.stringify(updated));
  };

  const removeFromCart = (productId: string, size: string) => {
    const updated = cart.filter(c => !(c.productId === productId && c.size === size));
    setCart(updated);
    ls.setItem('sw_cart', JSON.stringify(updated));
  };

  const updateCartQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    const updated = cart.map(c => (c.productId === productId && c.size === size) ? { ...c, quantity } : c);
    setCart(updated);
    ls.setItem('sw_cart', JSON.stringify(updated));
  };

  const clearCart = () => {
    setCart([]);
    ls.setItem('sw_cart', JSON.stringify([]));
  };

  const addFeedback = (userName: string, userEmail: string, rating: number, message: string) => {
    const feed: UserFeedback = {
      id: `feed-${Date.now()}`,
      userName,
      userEmail,
      rating,
      message,
      date: new Date().toISOString()
    };
    const updated = [feed, ...feedbacks];
    saveFeedbacks(updated);
  };

  const triggerSaleNotification = (title: string, message: string, type: 'sale' | 'arrival' | 'general' = 'general') => {
    const freshNotif = {
      id: `notif-${Date.now()}`,
      title,
      message,
      date: new Date().toISOString(),
      type
    };
    const updated = [freshNotif, ...notifications];
    setNotifications(updated);
    ls.setItem('sw_notifs', JSON.stringify(updated));
    pushStateToServer({ notifications: updated });
  };

  const updateOrderStatus = (orderId: string, status: Order['deliveryStatus']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, deliveryStatus: status } : o);
    saveOrders(updated);
  };

  const placeOrder = (
    shippingDetails: { name: string; contact: string; address: string },
    paymentMethod: Order['paymentMethod'],
    coinsToRedeem: number,
    couponCode?: string
  ) => {
    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty' };
    }

    if (!currentUser) {
      return { success: false, error: 'Please register or log in first' };
    }

    // Verify stock availability
    for (const item of cart) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod) {
        return { success: false, error: `Product not found` };
      }
      const available = prod.stock[item.size] || 0;
      if (available < item.quantity) {
        return { success: false, error: `Sorry, only ${available} unit(s) of ${prod.name} (Size ${item.size}) in stock.` };
      }
    }

    // Calculate billing
    let subtotal = 0;
    const orderItems: OrderItem[] = cart.map(item => {
      const prod = products.find(p => p.id === item.productId)!;
      subtotal += prod.price * item.quantity;
      return {
        productId: prod.id,
        productName: prod.name,
        productImage: prod.images[0],
        size: item.size,
        quantity: item.quantity,
        priceAtPurchase: prod.price
      };
    });

    // Handle coins redemption
    let coinsDiscount = 0;
    if (coinsToRedeem > 0) {
      // Must not exceed wallet balance or order subtotal
      coinsDiscount = Math.min(coinsToRedeem, currentUser.slCoins, subtotal);
    }

    // Handle coupon code discount
    let couponDiscount = 0;
    if (couponCode) {
      const cp = coupons.find(c => c.code.toUpperCase() === couponCode.toUpperCase() && c.isActive);
      if (cp) {
        if (subtotal >= cp.minCartValue) {
          if (cp.type === 'percent') {
            couponDiscount = Math.round((subtotal * cp.discountValue) / 100);
          } else {
            couponDiscount = cp.discountValue;
          }
        }
      }
    }

    const totalPaid = Math.max(0, subtotal - coinsDiscount - couponDiscount);
    const trackingNo = Math.floor(10000 + Math.random() * 90000);
    const orderId = `ORD-${trackingNo}`;
    
    // Payment Tracking ID structure
    let paymentId = '';
    if (paymentMethod === 'COD') {
      paymentId = `COD-SW-${trackingNo}`;
    } else {
      paymentId = `TXN-SW-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }

    const freshOrder: Order = {
      id: orderId,
      userId: currentUser.id,
      userName: shippingDetails.name,
      userContact: shippingDetails.contact,
      userAddress: shippingDetails.address,
      items: orderItems,
      subtotal,
      discountCoinsApplied: coinsDiscount,
      discountCouponApplied: couponDiscount,
      couponCodeUsed: couponCode,
      totalPaid,
      paymentMethod,
      paymentId,
      deliveryStatus: 'Pending',
      date: new Date().toISOString()
    };

    // 1. Deduct Product Stock & Increase Sales count
    const updatedProducts = products.map(prod => {
      const cartMatches = cart.filter(c => c.productId === prod.id);
      if (cartMatches.length > 0) {
        const itemStock = { ...prod.stock };
        let addedSales = 0;
        cartMatches.forEach(match => {
          if (itemStock[match.size] !== undefined) {
            itemStock[match.size] = Math.max(0, itemStock[match.size] - match.quantity);
            addedSales += match.quantity;
          }
        });
        return {
          ...prod,
          stock: itemStock,
          salesCount: prod.salesCount + addedSales
        };
      }
      return prod;
    });

    const updatedUser: UserAccount = {
      ...currentUser
    };

    // Save all changes
    saveProducts(updatedProducts);
    saveOrders([freshOrder, ...orders]);
    saveCurUser(updatedUser);
    
    // Clear shopping cart
    setCart([]);
    ls.removeItem('sw_cart');

    return { success: true, orderId };
  };

  return (
    <StoreContext.Provider value={{
      products,
      orders,
      users,
      currentUser,
      coupons,
      lookbooks,
      feedbacks,
      wishlist,
      cart,
      notifications,
      addProduct,
      updateProduct,
      deleteProduct,
      placeOrder,
      registerUser,
      setCurrentUserById,
      logoutUser,
      updateCurrentUserProfile,
      addUpcomingCoupon,
      deleteCoupon,
      addToWishlist,
      removeFromWishlist,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
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
