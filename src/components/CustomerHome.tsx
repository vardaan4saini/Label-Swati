/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, Coupon } from '../types';
import { 
  ShoppingBag, Heart, User, Sparkles, Share2, Ticket, Check, Copy, 
  Trash2, Plus, Minus, ArrowRight, ArrowLeft, Wallet, Users, MessageCircle, 
  Instagram, Smartphone, Bell, Eye, Info, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
interface CustomerHomeProps {
  onNavigateToAdmin: () => void;
}

export const CustomerHome: React.FC<CustomerHomeProps> = ({ onNavigateToAdmin }) => {
  const {
    products,
    orders,
    currentUser,
    coupons,
    lookbooks,
    wishlist,
    cart,
    notifications,
    addToWishlist,
    removeFromWishlist,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    registerUser,
    logoutUser,
    placeOrder,
    triggerSaleNotification
  } = useStore();

  // Active Screen: 'shop' | 'wishlist' | 'cart' | 'profile'
  const [activeTab, setActiveTab] = useState<'shop' | 'wishlist' | 'cart' | 'profile'>('shop');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(12000); // edit price range dynamically
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [selectedProductDetails]);
  
  // Registration Dialog/States (Mandatory user account profile)
  const [showRegModal, setShowRegModal] = useState<boolean>(false);
  const [regName, setRegName] = useState('');
  const [regContact, setRegContact] = useState('');
  const [regAddress, setRegAddress] = useState('');

  // checkout states
  const [showCheckout, setShowCheckout] = useState(false);
  const [chkName, setChkName] = useState('');
  const [chkContact, setChkContact] = useState('');
  const [chkAddress, setChkAddress] = useState('');
  const [chkPayment, setChkPayment] = useState<'Credit/Debit Card' | 'Digital Wallet' | 'UPI/Net Banking' | 'COD'>('Credit/Debit Card');
  const [chkCouponApplied, setChkCouponApplied] = useState<string>('');
  const [orderSuccessDetails, setOrderSuccessDetails] = useState<{ orderId: string, trackingId: string } | null>(null);

  // Share Cart simulation modal
  const [showShareCartModal, setShowShareCartModal] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // Active Lookbook selection
  const [activeLookbookId, setActiveLookbookId] = useState<string>(lookbooks[0]?.id || '');

  // Daily alert notification queue
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string } | null>(null);

  // Pre-fill user details during checkout if they already exist
  useEffect(() => {
    if (currentUser) {
      setChkName(currentUser.name);
      setChkContact(currentUser.contactNumber);
      setChkAddress(currentUser.address);
    }
  }, [currentUser, showCheckout]);

  // Daily alert trigger simulator
  useEffect(() => {
    // Show high value promo toast on first load
    const timer = setTimeout(() => {
      setToastAlert({
        title: '✨ Label Swati Daily Arrival Alert',
        message: 'The unbleached linen Autumn blazer and raw silk resort items are back in stock. Check out lookbook collections!'
      });
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSize = selectedSizeFilter === 'All' || p.sizes.includes(selectedSizeFilter);
    const matchPrice = p.price <= maxPrice;
    return matchCategory && matchSize && matchPrice;
  });

  // Calculate Cart Metrics
  const cartSubtotal = cart.reduce((acc, item) => {
    const prod = products.find(p => p.id === item.productId);
    return acc + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const isAdminNumber = (num: string): boolean => {
    const clean = num.replace(/[^0-9]/g, '');
    return clean.endsWith('9876543210') || clean.endsWith('9999999999');
  };

  // Handle register submission
  const handleRegisterUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regContact || !regAddress) return;
    registerUser(regName, regContact, regAddress);
    setShowRegModal(false);

    if (isAdminNumber(regContact)) {
      triggerSaleNotification(
        'Admin Access Authenticated',
        `Master credentials resolved for [${regContact}]. Entering Swati Admin Dashboard Node...`,
        'general'
      );
      setToastAlert({
        title: '🔐 Admin Authorization Approved',
        message: 'Admin mobile contact verified. Launching master dashboard system...'
      });
      setTimeout(() => {
        onNavigateToAdmin();
      }, 1500);
    } else {
      triggerSaleNotification(
        'Account Created Successfully!',
        `Welcome to Label Swati. You have been assigned an official customer account profile. Enjoy exploring our collections!`,
        'general'
      );
      // show success alert
      setToastAlert({
        title: '🎁 Welcome Member Bonus!',
        message: 'Your custom account is active. Enjoy custom silhouettes & premium seasonal wear.'
      });
    }
  };

  // Switch lookbook carousel target
  const activeLookbookObj = lookbooks.find(l => l.id === activeLookbookId);

  // Checkout order placement
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowRegModal(true);
      return;
    }
    const res = placeOrder(
      { name: chkName, contact: chkContact, address: chkAddress },
      chkPayment,
      0, // No coins applied
      chkCouponApplied || undefined
    );

    if (res.success && res.orderId) {
      const matchOrder = orders.find(o => o.id === res.orderId) || orders[0];
      setOrderSuccessDetails({
        orderId: res.orderId,
        trackingId: matchOrder ? matchOrder.paymentId : 'TXN-SW-UNKNOWN'
      });
      setShowCheckout(false);
      setChkCouponApplied('');
      
      // Toast notification for purchase success
      setToastAlert({
        title: '🎉 Order Completed!',
        message: `High couture is coming home. Order tracking ID: ${res.orderId}.`
      });
    } else {
      alert(res.error || 'An error occurred during order processing.');
    }
  };

  // Share Cart code copy
  const getShareCartLink = () => {
    const list = cart.map(item => {
      const prod = products.find(p => p.id === item.productId);
      return `${item.quantity}x ${prod?.name || 'Item'} (${item.size})`;
    }).join(', ');
    return `Hey! Love these pieces on Label Swati: [${list}]. View our luxury collections: ${window.location.origin}/`;
  };

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(getShareCartLink());
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Simulate receiving incoming sales pop-ups
  const handleTriggerSaleMock = () => {
    const discountSales = [
      { t: '⚡ Flash Midnight Launch Event', m: 'Limited Edition Silk Slip dress models are now eligible for SWATI10 coupon. Up to 10% off!' },
      { t: '🍂 Autumn/Winter Drops Unveiled', m: 'The new Tactile Isolation Lookbook contains wool blend items. Inspect under lookbook and preview with 360 AI Try-On!' },
      { t: '🎁 Local Bank Cash Back Scheme', m: 'Complete checkouts using Net Banking or Digital Wallets to verify credit cashback up to ₹250 back.' }
    ];
    const picked = discountSales[Math.floor(Math.random() * discountSales.length)];
    setToastAlert({ title: picked.t, message: picked.m });
    triggerSaleNotification(picked.t, picked.m, 'sale');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16 relative">
      
      {/* 1. Daily Day-to-Day Notifications Toast Alert Banner */}
      <AnimatePresence>
        {toastAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-black text-white p-5 rounded-lg shadow-xl z-50 border border-stone-800"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <Bell className="w-5 h-5 text-amber-300 animate-bounce shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs uppercase tracking-wider font-semibold font-mono text-stone-100">{toastAlert.title}</h5>
                  <p className="text-xs text-stone-300 mt-1 font-sans leading-relaxed">{toastAlert.message}</p>
                </div>
              </div>
              <button 
                onClick={() => setToastAlert(null)}
                className="text-stone-400 hover:text-white text-xs font-mono px-1 bg-stone-900 rounded"
              >
                ✕
              </button>
            </div>
            {/* Quick action button inside daily toast */}
            <div className="mt-3 flex justify-end gap-2">
              <button 
                onClick={() => {
                  setActiveTab('shop');
                  setToastAlert(null);
                }} 
                className="text-[10px] uppercase tracking-widest text-white hover:underline bg-stone-800 px-2 py-1 rounded"
              >
                Explore Catalog
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Container */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-30 font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          
          {/* Logo and Brand Title at Left Upright */}
          <div className="flex items-center gap-2.5">
            {activeTab !== 'shop' && (
              <button
                onClick={() => {
                  setActiveTab('shop');
                  setSelectedProductDetails(null);
                }}
                className="mr-1 py-1.5 px-3 text-[11px] text-stone-700 bg-stone-100 hover:bg-stone-200 border border-stone-300 hover:border-stone-400 rounded-md flex items-center gap-1.5 font-mono font-bold cursor-pointer transition-all active:scale-95 shadow-2xs group"
                id="global-customer-back-btn"
                title="Back to Catalog"
              >
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> BACK
              </button>
            )}

            <button 
              onClick={() => {
                setActiveTab('shop');
                setSelectedProductDetails(null);
              }} 
              className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer text-left focus:outline-hidden"
            >
              <svg width="36" height="44" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
                <defs>
                  <linearGradient id="ganeshaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#C2410C" />
                    <stop offset="50%" stopColor="#9333EA" />
                    <stop offset="100%" stopColor="#4C1D95" />
                  </linearGradient>
                </defs>
                {/* Outer Head/Crown curve precisely matching image */}
                <path 
                  d="M 48,22 C 48,22 45,14 58,14 C 69,14 74,24 74,35 C 74,43 68,49 61,49" 
                  stroke="url(#ganeshaGrad)" 
                  strokeWidth="4" 
                  strokeLinecap="round" 
                  fill="none" 
                />
                {/* Almond Eye of Ganesha */}
                <path 
                  d="M 53,29 C 55,27 57,29 57,30 C 57,32 54,33 53,33 C 51,33 50,31 53,29 Z" 
                  fill="url(#ganeshaGrad)" 
                />
                {/* Three detailed horizontal wrinkles/trunk lines on the right cheek */}
                <path d="M 64,36 C 66,37 68,37 69,38" stroke="url(#ganeshaGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 64,40 C 66,41 68,41 69,42" stroke="url(#ganeshaGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <path d="M 63,44 C 65,45 67,45 68,46" stroke="url(#ganeshaGrad)" strokeWidth="2.5" strokeLinecap="round" />
                {/* Main swooping Ganesha back outer S curve */}
                <path 
                  d="M 46,26 C 36,30 34,43 40,54 C 45,62 54,62 58,54 C 62,45 54,38 47,43 C 41,47 41,58 47,64 C 54,70 65,71 65,80 C 65,89 55,93 46,93" 
                  stroke="url(#ganeshaGrad)" 
                  strokeWidth="4.5" 
                  strokeLinecap="round" 
                  fill="none" 
                />
                {/* Ganesha front inner trunk loop spiral curve */}
                <path 
                  d="M 52,47 C 49,55 45,64 52,71 C 59,79 71,79 71,67 C 71,56 59,53 52,61 C 47,67 48,76 53,82 C 59,88 71,88 71,77" 
                  stroke="url(#ganeshaGrad)" 
                  strokeWidth="3.5" 
                  strokeLinecap="round" 
                  fill="none" 
                />
              </svg>
              <div className="flex flex-col">
                <span className="text-base md:text-lg font-sans font-semibold tracking-[0.3em] text-stone-900 leading-none">S W A T I</span>
                <span className="text-[7px] md:text-[8px] font-serif tracking-[0.16em] text-amber-800/80 uppercase mt-1">DESK TO DREAM</span>
              </div>
            </button>
          </div>

          {/* Action Hub */}
          <div className="flex items-center gap-3 md:gap-5">

            {/* Simulated Live Alert Trigger */}
            <button
              onClick={handleTriggerSaleMock}
              title="Test Receiving Daily Store Alert Pop-up"
              className="p-1.5 text-stone-500 hover:text-black hover:bg-stone-100 rounded-full transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full" />
            </button>

            <button 
              onClick={() => setActiveTab('wishlist')}
              className={`p-1.5 hover:text-black transition-colors relative ${activeTab === 'wishlist' ? 'text-black' : 'text-stone-400'}`}
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button 
              onClick={() => setActiveTab('cart')}
              className={`p-1.5 hover:text-black transition-colors relative ${activeTab === 'cart' ? 'text-black' : 'text-stone-400'}`}
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-black text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-mono font-bold">
                  {cart.reduce((ac, c) => ac + c.quantity, 0)}
                </span>
              )}
            </button>

            <button 
              onClick={() => currentUser ? setActiveTab('profile') : setShowRegModal(true)}
              className={`p-1.5 hover:text-black transition-colors flex items-center gap-1 ${
                activeTab === 'profile' ? 'text-black' : 'text-stone-400'
              }`}
            >
              <User className="w-5 h-5" />
              {currentUser && (
                <span className="text-xs font-semibold text-stone-800 hidden md:inline truncate max-w-[85px]">
                  Hi, {currentUser.name.split(' ')[0]}
                </span>
              )}
            </button>
          </div>

        </div>

        {/* Global Nav Paths */}
        <div className="border-t border-stone-100 bg-stone-50/50 py-2">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-6 md:gap-8 justify-center text-xs uppercase tracking-widest text-stone-500 font-medium">
            <button 
              onClick={() => { setActiveTab('shop'); setSelectedCategory('All'); }}
              className={`hover:text-black transition-colors ${activeTab === 'shop' ? 'text-black font-semibold' : ''}`}
            >
              Collections Catalog
            </button>
            <button 
              onClick={() => { setActiveTab('profile'); }}
              className={`hover:text-black transition-colors ${activeTab === 'profile' ? 'text-black font-semibold' : ''}`}
            >
              My Profile
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        {/* VIEW 1: SHOPPING CATALOG & LOOKBOOKS */}
        {activeTab === 'shop' && (
          <div className="space-y-12">
            
            {/* Seasonal Lookbook spotlight header */}
            {activeLookbookObj && (
              <div className="relative rounded-xl overflow-hidden bg-stone-900 text-white min-h-[380px] md:min-h-[460px] flex flex-col justify-end p-6 md:p-12 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-transparent z-10" />
                <img 
                  src={activeLookbookObj.image} 
                  alt={activeLookbookObj.title} 
                  className="absolute inset-0 w-full h-full object-cover opacity-75 z-0"
                  referrerPolicy="no-referrer"
                />
                
                {/* Lookbook info panel */}
                <div className="relative z-15 max-w-2xl font-sans">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-stone-300 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-sm">
                    Seasonal Campaign: {activeLookbookObj.season}
                  </span>
                  
                  <h2 className="text-2xl md:text-4xl font-serif tracking-wide mt-3 text-white leading-tight">
                    {activeLookbookObj.title}
                  </h2>
                  
                  <p className="text-xs md:text-sm text-stone-300 mt-2 font-serif italic max-w-xl leading-relaxed">
                    "{activeLookbookObj.description}"
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2 items-center">
                    <span className="text-[11px] font-mono text-stone-300">Spotlight Wardrobe:</span>
                    {activeLookbookObj.featuredProductIds.map(fid => {
                      const spotlightP = products.find(p => p.id === fid);
                      if (!spotlightP) return null;
                      return (
                        <button
                          key={fid}
                          onClick={() => setSelectedProductDetails(spotlightP)}
                          className="text-[11px] font-mono bg-white text-black px-2.5 py-1 rounded hover:bg-stone-200 transition-colors"
                        >
                          {spotlightP.name} →
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Alternate Campaign indicators */}
                <div className="absolute bottom-4 right-4 z-20 flex gap-2">
                  {lookbooks.map(lb => (
                    <button
                      key={lb.id}
                      onClick={() => setActiveLookbookId(lb.id)}
                      className={`px-3 py-1 text-[10px] font-mono border rounded ${
                        activeLookbookId === lb.id ? 'bg-white text-black' : 'text-stone-300 border-white/20 hover:bg-white/10'
                      }`}
                    >
                      {lb.season}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Split layout for Categories on Left & Catalog Grid on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
              
              {/* LEFT SIDEBAR: Categories, Size Fits, Price Scale & Loyalty Wallet Overview */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* 1. Brand Profile & Active Indicator */}
                <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                    <span className="text-[10px] uppercase tracking-widest text-stone-400 font-mono font-bold">ACTIVE SHOWROOM</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 font-serif">Label Swati</h4>
                    <p className="text-[11px] text-stone-500 leading-normal mt-1">
                      Sustainable luxury, handwoven organic textiles, and circular couture bespoke styles.
                    </p>
                  </div>
                </div>

                {/* 2. Visual Categories List */}
                <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                  <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-mono font-bold pb-1 border-b border-stone-100">
                    Collections & Categories
                  </span>
                  
                  <div className="flex flex-col gap-1.5">
                    {['All', 'Dresses', 'Coats', 'Knitwear', 'Trousers', 'Tees'].map(cat => {
                      const count = products.filter(p => cat === 'All' || p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${
                            selectedCategory === cat 
                              ? 'bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] text-white font-semibold' 
                              : 'bg-stone-50 hover:bg-stone-100/80 text-stone-600'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-stone-200/60 text-stone-500'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Size Filter */}
                <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                  <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-mono font-bold pb-1 border-b border-stone-100">
                    Size Fit selection
                  </span>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['All', 'XS', 'S', 'M', 'L', 'XL'].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setSelectedSizeFilter(sz)}
                        className={`text-xs py-2 rounded-lg border text-center transition-all cursor-pointer font-mono font-medium ${
                          selectedSizeFilter === sz 
                            ? 'border-[#9333EA] bg-[#9333EA] text-white shadow-xs font-bold' 
                            : 'border-stone-200 text-stone-500 hover:border-[#C2410C]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Price Scale */}
                <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                  <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-mono font-bold pb-1 border-b border-stone-100">
                    Budget boundary
                  </span>
                  
                  <div>
                    <div className="flex justify-between text-xs text-stone-500 font-mono mb-2">
                      <span>Maximum:</span>
                      <span className="font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">₹{maxPrice}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1500" 
                      max="15000" 
                      step="500"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                      className="w-full accent-black h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                      <span>₹1,500</span>
                      <span>₹15,000</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT CONTENT: PRODUCT CATALOG GRID */}
              <div className="lg:col-span-3 space-y-6">
                
                {/* Catalog header */}
                <div className="flex justify-between items-baseline mb-6 font-sans border-b border-stone-100 pb-3">
                  <h3 className="text-lg font-bold tracking-tight text-neutral-900 border-l-2 border-stone-950 pl-3">
                    {selectedCategory === 'All' ? 'Whole Seasonal Wardrobe' : selectedCategory}
                  </h3>
                  <span className="text-xs text-stone-500 font-mono">{filteredProducts.length} Piece(s) listed</span>
                </div>

                {filteredProducts.length === 0 ? (
                  <div className="bg-white p-12 text-center rounded-lg border border-stone-200 font-sans">
                    <p className="text-stone-400 text-sm">No items matching current filters. Try setting a wider price scale.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-8 font-sans">
                    {filteredProducts.map(prod => {
                      const isLoved = wishlist.includes(prod.id);
                      const totalInventoryLeft = Object.values(prod.stock).reduce((a: number, b) => a + Number(b), 0);

                      return (
                        <div key={prod.id} className="group relative flex flex-col">
                          <div className="relative aspect-3/4 w-full bg-stone-100 rounded-lg overflow-hidden border border-stone-100 shadow-xs">
                            <img 
                              src={prod.images[0]} 
                              alt={prod.name} 
                              className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                            />
                            
                            {/* Badges */}
                            {prod.isNewArrival && (
                              <span className="absolute top-2 left-2 bg-amber-500/90 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded">
                                NEW ARRIVAL
                              </span>
                            )}
                            {totalInventoryLeft === 0 && (
                              <span className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-mono tracking-wider px-2 py-0.5 rounded">
                                OUT OF STOCK
                              </span>
                            )}

                            {/* Action overlay */}
                            <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10">
                              <button
                                onClick={() => isLoved ? removeFromWishlist(prod.id) : addToWishlist(prod.id)}
                                className={`p-2 rounded-full cursor-pointer shadow-xs transition-colors ${
                                  isLoved ? 'bg-rose-50 text-rose-500' : 'bg-white/80 hover:bg-white text-stone-500 hover:text-black'
                                }`}
                              >
                                <Heart className={`w-4 h-4 ${isLoved ? 'fill-current' : ''}`} />
                              </button>
                              
                              <button
                                onClick={() => {
                                  setSelectedProductDetails(prod);
                                }}
                                className="p-2 rounded-full cursor-pointer bg-white/80 hover:bg-white text-stone-500 hover:text-black shadow-xs transition-colors"
                                title="Details and size specs"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Inspect Product Specs and Slides */}
                            <button
                              onClick={() => {
                                setSelectedProductDetails(prod);
                              }}
                              className="absolute bottom-2 left-2 right-2 py-1.5 bg-black/85 hover:bg-black text-white text-[10px] font-mono tracking-widest rounded-md uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Sparkles className="w-3 h-3 text-amber-400" /> View 5 Angle Slides
                            </button>
                          </div>

                          {/* Title details */}
                          <div className="mt-3 flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-semibold text-stone-800 hover:underline cursor-pointer" onClick={() => setSelectedProductDetails(prod)}>
                                {prod.name}
                              </h4>
                              <p className="text-[10px] text-stone-500 mt-0.5 font-mono">
                                Sizes: {prod.sizes.join(', ')}
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-bold text-stone-900 font-mono">₹{prod.price}</span>
                            </div>
                          </div>

                          {/* Size triggers or quick purchase */}
                          <div className="mt-2.5 flex gap-1">
                            {prod.sizes.map(sz => {
                              const availableAmt = prod.stock[sz] || 0;
                              return (
                                <button
                                  key={sz}
                                  disabled={availableAmt === 0}
                                  onClick={() => {
                                    addToCart(prod.id, sz, 1);
                                    setToastAlert({
                                      title: 'Added to shopping cart',
                                      message: `${prod.name} (Size ${sz}) placed in cart.`
                                    });
                                  }}
                                  className={`text-[10px] flex-1 py-1 text-center font-mono rounded border transition-all ${
                                    availableAmt === 0 
                                      ? 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed' 
                                      : 'border-stone-200 font-semibold text-stone-600 hover:bg-black hover:text-white hover:border-black'
                                  }`}
                                >
                                  {sz}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* VIEW 3: LOVED WISHLIST (Displays original base/standard prizes only as requested) */}
        {activeTab === 'wishlist' && (
          <div className="space-y-6 font-sans">
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-xl font-bold text-stone-900">Loved Wardrobe Collection</h2>
              <p className="text-xs text-stone-500 mt-1">
                Your selected wishlist. Displayed with clean standard, non-discounted pricing values.
              </p>
            </div>

            {wishlist.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-lg border border-stone-200">
                <Heart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Your loved list is currently empty. Visit catalog page to save styles.</p>
                <button onClick={() => setActiveTab('shop')} className="mt-4 px-4 py-2 bg-black text-white text-xs font-semibold rounded">
                  Explore Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {wishlist.map(id => {
                  const prod = products.find(p => p.id === id);
                  if (!prod) return null;
                  return (
                    <div key={prod.id} className="bg-white rounded-lg overflow-hidden border border-stone-200 shadow-xs flex flex-col p-4 relative group">
                      
                      {/* Delete cross */}
                      <button 
                        onClick={() => removeFromWishlist(prod.id)}
                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full hover:text-rose-500 text-stone-400 border border-stone-100 z-10 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="aspect-3/4 bg-stone-50 rounded overflow-hidden">
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="mt-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">{prod.name}</h4>
                          <p className="text-[10px] text-stone-500 mt-1">Category: {prod.category}</p>
                          
                          {/* CRITICAL: "wishlist of liked products without discounted prize" */}
                          {/* We display only the pure original price (no cross discount tags) */}
                          <p className="text-sm font-semibold text-stone-900 font-mono mt-2">
                            ₹{prod.originalPrice || prod.price}
                          </p>
                        </div>

                        {/* Move to cart selector */}
                        <div className="mt-4 border-t border-stone-100 pt-3">
                          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">Move to cart:</p>
                          <div className="flex gap-1">
                            {prod.sizes.map(sz => (
                              <button
                                key={sz}
                                onClick={() => {
                                  addToCart(prod.id, sz, 1);
                                  removeFromWishlist(prod.id);
                                  setToastAlert({
                                    title: 'Moved style to cart',
                                    message: `${prod.name} in size ${sz} moved to active bag.`
                                  });
                                }}
                                className="text-[10px] flex-1 py-1 border border-stone-250 hover:bg-black hover:text-white font-mono rounded"
                              >
                                {sz}
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 4: ACTIVE SHOPPING BAG & CHECKOUT FORM */}
        {activeTab === 'cart' && (
          <div className="space-y-6 font-sans">
            <div className="border-b border-stone-200 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-stone-900">Your Collective Bag</h2>
                <p className="text-xs text-stone-500 mt-1">Customize your size selections or apply promotional coupon codes.</p>
              </div>
              {cart.length > 0 && (
                <button 
                  onClick={() => setShowShareCartModal(true)} 
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs rounded font-medium flex items-center gap-1.5 transition-colors border border-stone-200"
                >
                  <Share2 className="w-3.5 h-3.5" /> Share Cart with Friends
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="bg-white p-16 text-center rounded-lg border border-stone-200">
                <ShoppingBag className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-stone-500 text-sm">Your collective bag is currently empty.</p>
                <button onClick={() => setActiveTab('shop')} className="mt-4 px-4 py-2 bg-black text-white text-xs font-semibold rounded">
                  Explore Wardrobe
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Cart Items (7 Cols) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  {cart.map((item, idx) => {
                    const prod = products.find(p => p.id === item.productId);
                    if (!prod) return null;
                    return (
                      <div key={`${item.productId}-${item.size}-${idx}`} className="flex gap-4 p-4 bg-white rounded-lg border border-stone-150 shadow-xs relative">
                        <img 
                          src={prod.images[0]} 
                          alt={prod.name} 
                          className="w-20 h-24 object-cover object-center rounded bg-stone-50 border border-stone-100"
                          referrerPolicy="no-referrer"
                        />
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between">
                              <h4 className="text-xs font-bold text-stone-900 leading-normal">{prod.name}</h4>
                              <button 
                                onClick={() => removeFromCart(item.productId, item.size)}
                                className="text-stone-400 hover:text-rose-500 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            
                            <p className="text-[10px] text-stone-500 mt-0.5">Size selected: <span className="font-bold text-stone-700">{item.size}</span></p>
                          </div>

                          <div className="flex justify-between items-baseline mt-4">
                            {/* Quantity buttons */}
                            <div className="flex items-center border border-stone-250 rounded">
                              <button 
                                onClick={() => updateCartQuantity(item.productId, item.size, item.quantity - 1)}
                                className="p-1 hover:bg-stone-50 text-stone-400 hover:text-black"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-3 text-xs font-mono font-bold">{item.quantity}</span>
                              <button 
                                onClick={() => updateCartQuantity(item.productId, item.size, item.quantity + 1)}
                                className="p-1 hover:bg-stone-50 text-stone-400 hover:text-black"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              {/* If product has discounted price show here */}
                              {prod.originalPrice && prod.originalPrice !== prod.price ? (
                                <p className="text-[10px] text-stone-400 line-through">₹{prod.originalPrice * item.quantity}</p>
                              ) : null}
                              <p className="text-sm font-bold text-stone-900 font-mono">₹{prod.price * item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal & Checkout billing details (5 Cols) */}
                <div className="lg:col-span-5 xl:col-span-4 bg-white p-5 rounded-lg border border-stone-200 space-y-5 h-fit">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-150 pb-2 flex items-center gap-1">
                    <Ticket className="w-4 h-4" /> Order Bill Summary
                  </h3>

                  {/* CUSTOMER MEMBER DETAIL SUMMARY */}
                  {!currentUser ? (
                    <div className="bg-amber-50/50 p-3.5 rounded border border-amber-200/50 text-stone-700 text-xs leading-relaxed space-y-1">
                      <p className="font-semibold">⚠️ Logged out visitor checkout</p>
                      <p className="text-[11px] text-stone-500">
                        Create your Label Swati member account to manage order tracking and shipping addresses dynamically.
                      </p>
                      <button 
                        onClick={() => setShowRegModal(true)} 
                        className="text-[11px] font-semibold text-black uppercase tracking-wider hover:underline block pt-1.5"
                      >
                        Create Member Account →
                      </button>
                    </div>
                  ) : (
                    <div className="bg-stone-50 p-3 py-2.5 rounded border border-stone-200 text-[11px] text-stone-600 space-y-1">
                      <p className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider">✓ Active Member Session</p>
                      <p className="truncate"><span className="font-medium text-stone-700">Account Owner:</span> {currentUser.name}</p>
                      <p className="truncate"><span className="font-medium text-stone-700">Ship-To Address:</span> {currentUser.address || 'Address not set'}</p>
                    </div>
                  )}

                  {/* COUPON DISCOUNT MODULE */}
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-stone-700">Coupon Code</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={chkCouponApplied}
                        onChange={(e) => setChkCouponApplied(e.target.value.toUpperCase())}
                        className="bg-white border border-stone-250 text-xs px-3 py-2 rounded w-full font-mono focus:outline-hidden"
                        placeholder="E.g. SWATI10, LAUNCH15"
                      />
                    </div>
                    
                    {/* List active coupons suggestions helper */}
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {coupons.filter(c => c.isActive).map(cp => (
                        <button
                          key={cp.code}
                          onClick={() => {
                            if (cartSubtotal >= cp.minCartValue) {
                              setChkCouponApplied(cp.code);
                              setToastAlert({
                                title: 'Applied coupon suggestion',
                                message: `Discount coupon ${cp.code} active for this checkout!`
                              });
                            } else {
                              alert(`This coupon requires minimum order value of ₹${cp.minCartValue}. Current subtotal is ₹${cartSubtotal}.`);
                            }
                          }}
                          className={`text-[9px] font-mono border px-2 py-0.5 rounded transition-all ${
                            chkCouponApplied === cp.code 
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700 font-bold' 
                              : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-500'
                          }`}
                          title={`${cp.description}`}
                        >
                          {cp.code}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Billing Table */}
                  <div className="border-t border-stone-200 pt-3.5 space-y-2.5 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Cart subtotal:</span>
                      <span className="text-stone-900">₹{cartSubtotal}</span>
                    </div>

                    {chkCouponApplied && coupons.some(c => c.code === chkCouponApplied && c.isActive) && (
                      <div className="flex justify-between text-rose-600">
                        <span>Coupon ({chkCouponApplied}) discount:</span>
                        <span>
                          - ₹{(() => {
                            const cp = coupons.find(c => c.code === chkCouponApplied)!;
                            if (cartSubtotal < cp.minCartValue) return 0;
                            return cp.type === 'percent' 
                              ? Math.round((cartSubtotal * cp.discountValue) / 100) 
                              : cp.discountValue;
                          })()}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-500">
                      <span>Eco and Delivery fee:</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>

                    <div className="flex justify-between text-sm font-bold border-t border-stone-150 pt-2.5 text-stone-900">
                      <span className="font-sans">Payable Total:</span>
                      <span>
                        ₹{(() => {
                          const cp = coupons.find(c => c.code === chkCouponApplied && c.isActive);
                          let cpDiscount = 0;
                          if (cp && cartSubtotal >= cp.minCartValue) {
                            cpDiscount = cp.type === 'percent' 
                              ? Math.round((cartSubtotal * cp.discountValue) / 100) 
                              : cp.discountValue;
                          }
                          return Math.max(0, cartSubtotal - cpDiscount);
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Form Switcher or Place Trigger */}
                  {!showCheckout ? (
                    <button
                      onClick={() => {
                        if (!currentUser) {
                          setShowRegModal(true);
                        } else {
                          setShowCheckout(true);
                        }
                      }}
                      className="w-full py-3 bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] hover:opacity-95 text-white text-xs uppercase tracking-widest font-semibold rounded hover:scale-[1.01] transition-all flex items-center justify-center gap-1 shadow-md"
                    >
                      Process Checkout <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => setShowCheckout(false)} 
                      className="w-full text-center text-xs text-stone-400 hover:text-stone-600 font-semibold"
                    >
                      ← Return to Edit Cart Items
                    </button>
                  )}

                </div>

              </div>
            )}

            {/* CHECKOUT SUBMISSION CONTAINER */}
            <AnimatePresence>
              {showCheckout && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-white rounded-lg border border-stone-200 overflow-hidden mt-6"
                >
                  <form onSubmit={handlePlaceOrder} className="p-6 md:p-8 space-y-6">
                    <div className="border-b border-stone-150 pb-3 flex justify-between items-baseline">
                      <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                        Shipping Address & Payment Verification
                      </h4>
                      <span className="text-[10px] font-mono bg-stone-100 text-stone-500 px-2 py-0.5 rounded uppercase">Verified profile: {currentUser?.id}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">Full Name</label>
                        <input 
                          type="text" 
                          required
                          value={chkName}
                          onChange={(e) => setChkName(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded text-xs focus:bg-white"
                          placeholder="Your complete name"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-stone-700">Contact Number</label>
                        <input 
                          type="tel" 
                          required
                          value={chkContact}
                          onChange={(e) => setChkContact(e.target.value)}
                          className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded text-xs focus:bg-white"
                          placeholder="Mobile number with zip"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-stone-700">Detailed Shipping Residence Address</label>
                      <textarea 
                        required
                        rows={3}
                        value={chkAddress}
                        onChange={(e) => setChkAddress(e.target.value)}
                        className="w-full p-2.5 bg-stone-50 border border-stone-250 rounded text-xs focus:bg-white resize-y"
                        placeholder="House No, Building, Area, Street, Landmark, Pin code"
                      />
                    </div>

                    {/* PAYMENT METHOD SELECTION */}
                    <div className="space-y-3">
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 font-mono">
                        Select Gateways & Local Channels
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { id: 'Credit/Debit Card', subtitle: 'Visa, Master, AMEX' },
                          { id: 'Digital Wallet', subtitle: 'Paytm, Google Pay, Apple Pay' },
                          { id: 'UPI/Net Banking', subtitle: 'Direct Local Bank wire' },
                          { id: 'COD', subtitle: 'Cash on Delivery (ID generated)' }
                        ].map(pay => (
                          <button
                            key={pay.id}
                            type="button"
                            onClick={() => setChkPayment(pay.id as any)}
                            className={`p-3 rounded border text-left flex flex-col justify-between transition-all ${
                              chkPayment === pay.id 
                                ? 'border-black bg-stone-50 shadow-xs ring-1 ring-black' 
                                : 'border-stone-200 hover:bg-stone-50/50'
                            }`}
                          >
                            <span className="text-xs font-bold text-stone-900">{pay.id}</span>
                            <span className="text-[10px] text-stone-400 font-medium mt-1">{pay.subtitle}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 border-t border-stone-150 pt-5">
                      <button
                        type="button"
                        onClick={() => setShowCheckout(false)}
                        className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 bg-black hover:bg-stone-850 text-white text-xs uppercase tracking-widest font-semibold rounded shadow-xs"
                      >
                        Complete Order Purchase →
                      </button>
                    </div>

                  </form>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        )}

        {/* VIEW 5: USER ACCOUNT PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-8 font-sans">
            
            {/* Header Block */}
            <div className="border-b border-stone-200 pb-4">
              <h2 className="text-xl font-bold text-stone-900">Your Label Swati Member Profile</h2>
              <p className="text-xs text-stone-500 mt-1">Manage your contact details, active shipping logs, and past designer order history.</p>
            </div>

            {currentUser ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. Profile information detail card (4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-lg border border-stone-200 space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-stone-100 border border-stone-250 text-stone-600 uppercase text-lg font-bold rounded-full flex items-center justify-center mx-auto mb-3">
                      {currentUser.name.substring(0, 2)}
                    </div>
                    <h3 className="text-sm font-bold text-stone-900">{currentUser.name}</h3>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5 uppercase tracking-wider">Verified Member</p>
                    
                    <div className="mt-3 pt-2.5 border-t border-stone-100 flex flex-col gap-2">
                      <button 
                        onClick={() => {
                          logoutUser();
                          setToastAlert({
                            title: '👋 Logged Out Successfully',
                            message: 'Your active session has been cleared.'
                          });
                        }}
                        className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 font-mono text-[10px] uppercase tracking-wider rounded border border-stone-200 transition-colors font-medium"
                      >
                        Sign Out / Switch Account
                      </button>

                      {isAdminNumber(currentUser.contactNumber) && (
                        <div className="p-3 bg-gradient-to-br from-amber-50 to-purple-50 rounded-md border border-amber-200 text-left mt-2 space-y-2">
                          <p className="text-[9px] font-bold tracking-wider text-amber-700 font-mono uppercase">🔐 Master Admin Identified</p>
                          <p className="text-[10px] text-stone-600 leading-normal">
                            Registered on master system. Press below to launch full warehouse & order logs.
                          </p>
                          <button 
                            onClick={onNavigateToAdmin}
                            className="w-full py-1.5 bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] text-white hover:opacity-90 font-mono text-[9px] font-bold uppercase tracking-wider rounded transition-opacity shadow-xs"
                          >
                            Launch Admin Panel Node
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-stone-100 text-xs">
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-wider text-semibold mb-0.5">Mobile Contact:</span>
                      <span className="text-stone-800 font-mono">{currentUser.contactNumber}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-wider text-semibold mb-0.5">Primary Residence:</span>
                      <span className="text-stone-700 leading-relaxed block">{currentUser.address || 'Click Checkout or consult help to specify primary custom address'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Sharing campaign and digital link shares (8 cols) */}
                <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-stone-200 space-y-6">
                  <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
                    <Users className="w-4.5 h-4.5 text-black" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                      Share The Label Swati Wardrobe
                    </h3>
                  </div>

                  <p className="text-xs text-stone-600 leading-relaxed">
                    Love our high couture drapes, custom silhouettes, and bespoke designs? Invite your direct colleagues and circles! Copy your custom catalogue lookbook link below and share our seasonal luxury wear on WhatsApp, Instagram, or email.
                  </p>

                  {/* Share code box */}
                  <div className="bg-stone-50 p-4 rounded-md border border-stone-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-mono">My Design Portfolio Link:</span>
                      <span className="text-xs font-mono text-stone-600 leading-relaxed truncate block max-w-sm">{getShareCartLink()}</span>
                    </div>

                    <div className="flex gap-2.5">
                      <button
                        onClick={handleCopyShareLink}
                        className="py-2.5 px-4 bg-black hover:bg-stone-850 active:bg-stone-900 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors"
                      >
                        {copiedText ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Link
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Link
                          </>
                        )}
                      </button>

                      <a 
                        href={`https://wa.me/?text=${encodeURIComponent(getShareCartLink())}`}
                        target="_blank" 
                        rel="noreferrer"
                        className="p-2.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 rounded hover:bg-emerald-100 transition-colors"
                        title="Share on WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(getShareCartLink());
                          alert('Instagram Direct Share Clipboard loaded. Open Instagram and paste link dynamically!');
                        }}
                        className="p-2.5 bg-pink-50 text-pink-700 font-bold border border-pink-200 rounded hover:bg-pink-100 transition-colors"
                        title="Share on Instagram"
                      >
                        <Instagram className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* PAST PURCHASE LOGS */}
                  <div className="pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 font-mono mb-4">
                      My Past Orders History
                    </h4>

                    {orders.filter(o => o.userId === currentUser.id).length === 0 ? (
                      <p className="text-xs text-stone-400 font-sans italic p-4 bg-stone-50 text-center rounded">
                        You haven't processed any purchases yet. Your invoices appear here with custom tracking details.
                      </p>
                    ) : (
                      <div className="space-y-3.5">
                        {orders.filter(o => o.userId === currentUser.id).map(ord => (
                          <div key={ord.id} className="p-4 bg-stone-50 rounded-lg border border-stone-150 text-xs font-sans">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-stone-200 pb-2 mb-3">
                              <div>
                                <p className="font-bold text-stone-900 font-mono">Order: {ord.id}</p>
                                <span className="text-[10px] text-stone-400 font-serif italic">Placed {new Date(ord.date).toLocaleDateString()}</span>
                              </div>
                              <span className={`px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-full ${
                                ord.deliveryStatus === 'Delivered' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : ord.deliveryStatus === 'Shipped' 
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              }`}>
                                {ord.deliveryStatus}
                              </span>
                            </div>

                            <div className="space-y-1 bg-white p-2.5 rounded border border-stone-100">
                              {ord.items.map((it, idx) => (
                                <div key={idx} className="flex justify-between text-[11px] text-stone-600">
                                  <span>{it.quantity}x {it.productName} ({it.size})</span>
                                  <span className="font-mono">₹{it.priceAtPurchase * it.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-2 text-[11px] text-stone-500 font-sans">
                              <div>
                                <p><span className="font-semibold text-stone-700 font-mono">Unique Tracking Payment ID:</span> {ord.paymentId}</p>
                                <p className="mt-0.5"><span className="font-semibold text-stone-700">Method used:</span> {ord.paymentMethod}</p>
                              </div>
                              <div className="md:text-right border-t md:border-t-0 border-stone-200 pt-2 md:pt-0">
                                <p>Subtotal: ₹{ord.subtotal}</p>
                                {ord.discountCoinsApplied > 0 && <p className="text-rose-600">Special Discount: -₹{ord.discountCoinsApplied}</p>}
                                {ord.discountCouponApplied > 0 && <p className="text-rose-600">Coupon Used: -₹{ord.discountCouponApplied}</p>}
                                <p className="text-stone-900 font-bold text-xs font-mono mt-0.5">Total Invoiced: ₹{ord.totalPaid}</p>
                              </div>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white p-12 text-center rounded-lg border border-stone-250 font-sans">
                <User className="w-10 h-10 text-stone-300 mx-auto mb-3 animate-pulse" />
                <p className="text-stone-500 text-sm">Please register your member credentials to log into your exclusive wallet profile.</p>
                <button 
                  onClick={() => setShowRegModal(true)} 
                  className="mt-4 px-5 py-2.5 bg-black text-white text-xs font-semibold rounded uppercase tracking-wider"
                >
                  Create Member Account Now
                </button>
              </div>
            )}

          </div>
        )}

      </main>

      {/* POP-UP MODAL 1: PRODUCT SPECIFIC DETAIL DIALOG */}
      <AnimatePresence>
        {selectedProductDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto relative p-6 md:p-8 font-sans"
            >
              <button 
                onClick={() => setSelectedProductDetails(null)}
                className="absolute top-4 right-4 text-stone-400 hover:text-black font-semibold text-lg p-1.5 hover:bg-stone-50 rounded"
                title="Close"
              >
                ✕
              </button>

              <div className="flex justify-between items-center border-b border-stone-150 pb-3 mb-5 mt-2">
                <button 
                  onClick={() => setSelectedProductDetails(null)}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-black font-semibold uppercase tracking-wider cursor-pointer group"
                  title="Return to Shop Catalog"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Store
                </button>
                <div className="text-right pr-8">
                  <span className="text-[10px] tracking-widest text-[#9333EA] font-mono uppercase font-bold">Couture Spec Sheet</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                
                {/* Images gallery slide */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h5 className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">Interactive Angle Slideshow</h5>
                    <span className="text-[10px] font-mono bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-bold">
                      Slide {activeSlideIndex + 1} of {selectedProductDetails.images.length}
                    </span>
                  </div>
                  
                  {/* Aspect Box with controls */}
                  <div className="relative aspect-3/4 rounded overflow-hidden bg-stone-50 border border-stone-200 group/slide shadow-xs">
                    <img 
                      src={selectedProductDetails.images[activeSlideIndex] || selectedProductDetails.images[0]} 
                      alt={`${selectedProductDetails.name} angle representation`} 
                      className="w-full h-full object-cover transition-all duration-300"
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* Navigation Chevrons */}
                    {selectedProductDetails.images.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            setActiveSlideIndex(prev => (prev === 0 ? selectedProductDetails.images.length - 1 : prev - 1));
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-stone-800 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 z-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        
                        <button
                          onClick={() => {
                            setActiveSlideIndex(prev => (prev === selectedProductDetails.images.length - 1 ? 0 : prev + 1));
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/70 hover:bg-white text-stone-800 shadow-sm flex items-center justify-center transition-all cursor-pointer hover:scale-105 z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Dot indicators */}
                    <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5 z-10">
                      {selectedProductDetails.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveSlideIndex(idx)}
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === activeSlideIndex ? 'bg-black w-3' : 'bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thumbnails pointer list - up to all images (typically 5 slides) */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                    {selectedProductDetails.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`relative w-11 h-14 shrink-0 rounded overflow-hidden border-2 bg-stone-50 transition-all cursor-pointer ${
                          idx === activeSlideIndex ? 'border-black ring-1 ring-black/10 scale-102' : 'border-stone-200 hover:border-stone-400'
                        }`}
                      >
                        <img 
                          src={img} 
                          alt={`Angle thumb ${idx + 1}`} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Technical data pane */}
                <div className="flex flex-col justify-between">
                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 bg-stone-100 px-2 py-0.5 rounded">{selectedProductDetails.category}</span>
                      <h3 className="text-lg font-bold text-stone-900 mt-1.5">{selectedProductDetails.name}</h3>
                      <p className="text-sm font-bold font-mono text-black mt-1">₹{selectedProductDetails.price}</p>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-serif italic text-left">
                      "{selectedProductDetails.description}"
                    </p>

                    {/* Stock listing details as requested */}
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-mono mb-2">Sizes Stock Availability:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        {selectedProductDetails.sizes.map(sz => {
                          const quantity = selectedProductDetails.stock[sz] || 0;
                          return (
                            <div key={sz} className="p-2 border border-stone-150 rounded flex justify-between">
                              <span className="font-bold text-stone-700">{sz}</span>
                              <span className={quantity === 0 ? 'text-rose-500 font-bold' : quantity < 3 ? 'text-amber-600 font-semibold' : 'text-stone-500'}>
                                {quantity === 0 ? 'Out Of Stock' : `${quantity} pieces`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-stone-100 mt-6">
                    <button
                      onClick={() => {
                        const inStockSize = selectedProductDetails.sizes.find(sz => (selectedProductDetails.stock[sz] || 0) > 0);
                        if (inStockSize) {
                          addToCart(selectedProductDetails.id, inStockSize, 1);
                          setSelectedProductDetails(null);
                          setToastAlert({
                            title: 'Bagged wardrobe piece',
                            message: `${selectedProductDetails.name} (Size ${inStockSize}) successfully added.`
                          });
                        } else {
                          alert('This wardrobe item is completely out of stock.');
                        }
                      }}
                      className="w-full py-2.5 bg-black hover:bg-stone-850 text-white text-xs uppercase tracking-widest font-semibold rounded cursor-pointer transition-colors text-center"
                    >
                      Quick Add Available Stock
                    </button>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POP-UP MODAL 2: MANDATORY USER REGISTRATION PROFILE */}
      <AnimatePresence>
        {showRegModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-sm w-full relative p-6 font-sans shadow-xl border border-stone-100"
            >
              <button 
                onClick={() => setShowRegModal(false)}
                className="absolute top-3 right-3 text-stone-400 hover:text-black font-semibold text-sm p-1 hover:bg-stone-50 rounded"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <span className="text-[10px] font-mono tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded uppercase">MEMBER PROFILE</span>
                <h3 className="text-sm font-bold text-stone-900 mt-2 font-serif uppercase tracking-widest">Create Your Swati Member Account</h3>
                <p className="text-[11px] text-stone-500 mt-1 leading-normal">
                  Create a custom user profile to track your orders, manage primary shipping addresses, and apply discount codes.
                </p>
              </div>

              <form onSubmit={handleRegisterUser} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-700">Your Full Name</label>
                  <input 
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full text-xs p-2 border border-stone-250 rounded focus:border-black"
                    placeholder="E.g. Tanya Goel"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-700">Contact Number (Indian standard)</label>
                  <input 
                    type="tel"
                    required
                    value={regContact}
                    onChange={(e) => setRegContact(e.target.value)}
                    className="w-full text-xs p-2 border border-stone-250 rounded focus:border-black"
                    placeholder="E.g. +91 98XXX XXX01"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-stone-700">Home shipping address</label>
                  <textarea 
                    required
                    rows={2}
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    className="w-full text-xs p-2 border border-stone-250 rounded focus:border-black resize-none"
                    placeholder="Street name, landmark, City, pin"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] hover:opacity-95 text-white text-xs uppercase tracking-widest font-semibold rounded transition-opacity mt-3 shadow-md"
                >
                  Create Member Account →
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POP-UP MODAL 3: SHARE CART WITH OTHER PLATFORMS (Community Building) */}
      <AnimatePresence>
        {showShareCartModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full relative p-6 font-sans border border-stone-100"
            >
              <button 
                onClick={() => setShowShareCartModal(false)}
                className="absolute top-3 right-3 text-stone-400 hover:text-black font-semibold text-sm p-1 hover:bg-stone-50 rounded"
              >
                ✕
              </button>

              <div className="text-center mb-5">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Share Bag with Companions</h3>
                <p className="text-[11px] text-stone-400 mt-1 leading-normal">
                  Send your curated luxury shopping list with friends and companions directly on social platforms.
                </p>
              </div>

              <div className="bg-stone-50 p-3 rounded text-[11px] border border-stone-200 text-stone-600 font-mono text-left leading-relaxed max-h-32 overflow-y-auto mb-5 italic select-all">
                "{getShareCartLink()}"
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                
                <a 
                  href={`https://wa.me/?text=${encodeURIComponent(getShareCartLink())}`}
                  target="_blank" 
                  rel="noreferrer"
                  onClick={() => setShowShareCartModal(false)}
                  className="p-3 bg-emerald-50 text-emerald-700/90 font-bold border border-emerald-250/50 rounded flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors text-xs"
                >
                  <MessageCircle className="w-4 h-4" /> Share WhatsApp
                </a>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getShareCartLink());
                    alert('Loaded to clipboard! Open Instagram DMs and paste freely.');
                    setShowShareCartModal(false);
                  }}
                  className="p-3 bg-pink-50 text-pink-700 font-bold border border-pink-250/50 rounded flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors text-xs"
                >
                  <Instagram className="w-4 h-4" /> Instagram DM
                </button>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(getShareCartLink());
                    alert('Loaded to clipboard! Drag into your Snap message directly.');
                    setShowShareCartModal(false);
                  }}
                  className="p-3 bg-amber-50 text-amber-700/90 font-bold border border-amber-250/50 rounded flex items-center justify-center gap-2 hover:bg-amber-100 transition-colors text-xs"
                >
                  <Smartphone className="w-4 h-4" /> Snapchat Link
                </button>

                <button
                  onClick={handleCopyShareLink}
                  className="p-3 bg-black text-white font-bold rounded flex items-center justify-center gap-2 hover:bg-stone-850 transition-colors text-xs"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />} 
                  {copiedText ? 'Copied Link' : 'Copy Direct Link'}
                </button>

              </div>
              <p className="text-[10px] text-stone-400 text-center mt-4">
                *Quickly copy and paste direct links to share collections on social apps!
              </p>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* POP-UP MODAL 4: SUCCESS OF COMPLETED CHECKOUT ORDER */}
      <AnimatePresence>
        {orderSuccessDetails && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg max-w-md w-full relative p-6 md:p-8 font-sans border border-stone-100 shadow-2xl text-center"
            >
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                <Check className="w-6 h-6 font-bold" />
              </div>

              <h3 className="text-base font-bold text-stone-900 font-serif">Purchase Catalogued Successfully</h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                Thank you for choosing Label Swati. Your customized order has been compiled and is ready for eco-friendly processing.
              </p>

              <div className="my-6 p-4 rounded-md bg-stone-50 border border-stone-150 space-y-2 text-xs text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px]">Unique Customer Order ID:</span>
                  <span className="text-stone-900 font-bold">{orderSuccessDetails.orderId}</span>
                </div>
                <div className="flex justify-between border-t border-stone-150 pt-2">
                  <span className="text-stone-400 uppercase tracking-widest text-[10px]">Unique Payment Trace ID:</span>
                  <span className="text-stone-900 font-bold">{orderSuccessDetails.trackingId}</span>
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded text-[11px] text-stone-600 leading-normal mb-5 flex items-start gap-1.5 text-left border border-stone-200">
                <Info className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                <p>
                  Your delivery has been scheduled! Order status and tracking links are available inside your member profile. Check back dynamically to track progress.
                </p>
              </div>

              <div className="flex gap-2 mx-auto justify-center">
                <button
                  onClick={() => {
                    setOrderSuccessDetails(null);
                    setActiveTab('profile');
                  }}
                  className="py-2.5 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded whitespace-nowrap"
                >
                  View Order Logs
                </button>
                <button
                  onClick={() => setOrderSuccessDetails(null)}
                  className="py-2.5 px-6 bg-black hover:bg-stone-850 text-white text-xs font-semibold rounded uppercase tracking-widest hover:scale-102 transition-transform"
                >
                  Continue Shop
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
