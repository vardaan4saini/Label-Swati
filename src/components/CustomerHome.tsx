/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import {
  Sparkles, Bell, Eye, ChevronLeft, ChevronRight, MessageCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// WhatsApp brand number — default for fallback chat messages
const WHATSAPP_NUMBER = '8368273725';

/**
 * Generates a WhatsApp redirect URL with a pre-filled message about the product.
 */
const getWhatsAppLink = (product: Product) => {
  if (product.whatsappLink) {
    let link = product.whatsappLink.trim();
    if (link && !/^https?:\/\//i.test(link)) {
      link = `https://${link}`;
    }
    return link;
  }
  const productUrl = `${window.location.origin}`;
  const message = `Hi! I'm interested in purchasing *${product.name}* (₹${product.price}). Here's the catalogue: ${productUrl}\n\nPlease share availability and ordering details. Thank you!`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};

export const CustomerHome: React.FC = () => {
  const {
    products,
    lookbooks,
    notifications,
  } = useStore();

  // Catalogue Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(12000);

  // Product detail modal
  const [selectedProductDetails, setSelectedProductDetails] = useState<Product | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);

  useEffect(() => {
    setActiveSlideIndex(0);
  }, [selectedProductDetails]);

  // Active Lookbook selection
  const [activeLookbookId, setActiveLookbookId] = useState<string>(lookbooks[0]?.id || '');

  // Daily alert notification toast
  const [toastAlert, setToastAlert] = useState<{ title: string; message: string } | null>(null);

  // Daily alert trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notifications.length > 0) {
        setToastAlert({
          title: `✨ ${notifications[0].title}`,
          message: notifications[0].message
        });
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [notifications]);

  // Filter products
  const filteredProducts = products.filter(p => {
    if (p.isUpcoming) return false; // Don't show upcoming items in catalogue
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSize = selectedSizeFilter === 'All' || p.sizes.includes(selectedSizeFilter);
    const matchPrice = p.price <= maxPrice;
    return matchCategory && matchSize && matchPrice;
  });

  // Lookbook
  const activeLookbookObj = lookbooks.find(l => l.id === activeLookbookId);

  // Unique categories from actual products
  const allCategories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16 relative">

      {/* 1. Notification Toast Alert */}
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
            <div className="mt-3 flex justify-end">
              <button
                onClick={() => setToastAlert(null)}
                className="text-[10px] uppercase tracking-widest text-white hover:underline bg-stone-800 px-2 py-1 rounded"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-stone-100 sticky top-0 z-30 font-sans">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">

          {/* Logo and Brand Title */}
          <button
            onClick={() => {
              setSelectedProductDetails(null);
              setSelectedCategory('All');
            }}
            className="flex items-center gap-3 hover:opacity-90 transition-opacity cursor-pointer text-left focus:outline-hidden"
          >
            <img src="/logo.jpg" alt="Label Swati Logo" className="h-10 md:h-12 w-auto shrink-0 object-contain rounded-md" />
            <div className="flex flex-col">
              <span className="text-base md:text-lg font-sans font-semibold tracking-[0.2em] text-stone-900 leading-none">L A B E L &nbsp;S W A T I</span>
              <span className="text-[7px] md:text-[8px] font-serif tracking-[0.16em] text-amber-800/80 uppercase mt-1">DESK TO DREAM</span>
            </div>
          </button>

          {/* WhatsApp Contact CTA */}
          <a
            href="https://wa.me/c/130576417824793"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-md active:scale-95"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">WhatsApp Catalogue</span>
          </a>
        </div>

        {/* Navigation */}
        <div className="border-t border-stone-100 bg-stone-50/50 py-2">
          <div className="max-w-7xl mx-auto px-4 md:px-8 flex gap-6 md:gap-8 justify-center text-xs uppercase tracking-widest text-stone-500 font-medium">
            <span className="text-black font-semibold">
              Collections Catalogue
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="space-y-12">

          {/* Seasonal Lookbook Spotlight */}
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
                    className={`px-3 py-1 text-[10px] font-mono border rounded ${activeLookbookId === lb.id ? 'bg-white text-black' : 'text-stone-300 border-white/20 hover:bg-white/10'
                      }`}
                  >
                    {lb.season}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Split layout: Categories sidebar + Catalogue Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* LEFT SIDEBAR: Filters */}
            <div className="lg:col-span-1 space-y-6">

              {/* Brand Profile */}
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

                {/* WhatsApp CTA in sidebar */}
                <a
                  href="https://wa.me/c/130576417824793"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-colors shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  View WhatsApp Catalogue
                </a>
              </div>

              {/* Categories */}
              <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-mono font-bold pb-1 border-b border-stone-100">
                  Collections & Categories
                </span>

                <div className="flex flex-col gap-1.5">
                  {allCategories.map(cat => {
                    const count = products.filter(p => !p.isUpcoming && (cat === 'All' || p.category === cat)).length;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`text-xs px-3.5 py-2.5 rounded-lg flex items-center justify-between transition-all cursor-pointer ${selectedCategory === cat
                          ? 'bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] text-white font-semibold'
                          : 'bg-stone-50 hover:bg-stone-100/80 text-stone-600'
                          }`}
                      >
                        <span>{cat}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-stone-200/60 text-stone-500'
                          }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Size Filter */}
              <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-mono font-bold pb-1 border-b border-stone-100">
                  Size Fit Selection
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {['All', 'XS', 'S', 'M', 'L', 'XL'].map(sz => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSizeFilter(sz)}
                      className={`text-xs py-2 rounded-lg border text-center transition-all cursor-pointer font-mono font-medium ${selectedSizeFilter === sz
                        ? 'border-[#9333EA] bg-[#9333EA] text-white shadow-xs font-bold'
                        : 'border-stone-200 text-stone-500 hover:border-[#C2410C]'
                        }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Scale */}
              <div className="bg-white p-5 rounded-xl border border-stone-150 space-y-4 font-sans shadow-xs">
                <span className="block text-[11px] uppercase tracking-wider text-stone-400 font-mono font-bold pb-1 border-b border-stone-100">
                  Budget Boundary
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

            {/* RIGHT CONTENT: PRODUCT CATALOGUE GRID */}
            <div className="lg:col-span-3 space-y-6">

              {/* Catalogue header */}
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

                          {/* Quick view button */}
                          <div className="absolute top-2 right-2 z-10">
                            <button
                              onClick={() => setSelectedProductDetails(prod)}
                              className="p-2 rounded-full cursor-pointer bg-white/80 hover:bg-white text-stone-500 hover:text-black shadow-xs transition-colors"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Inspect overlay */}
                          <button
                            onClick={() => setSelectedProductDetails(prod)}
                            className="absolute bottom-2 left-2 right-2 py-1.5 bg-black/85 hover:bg-black text-white text-[10px] font-mono tracking-widest rounded-md uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-400" /> View Details
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
                            {prod.originalPrice && prod.originalPrice !== prod.price && (
                              <span className="text-[10px] text-stone-400 line-through font-mono block">₹{prod.originalPrice}</span>
                            )}
                            <span className="text-xs font-bold text-stone-900 font-mono">₹{prod.price}</span>
                          </div>
                        </div>

                        {/* WhatsApp Buy Button */}
                        <a
                          href={getWhatsAppLink(prod)}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shadow-sm active:scale-95 ${totalInventoryLeft === 0
                            ? 'bg-stone-200 text-stone-400 pointer-events-none cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-md'
                            }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {totalInventoryLeft === 0 ? 'Out of Stock' : 'Buy on WhatsApp'}
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* PRODUCT DETAIL MODAL */}
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
                  title="Return to Catalogue"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> Back to Catalogue
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
                          className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${idx === activeSlideIndex ? 'bg-black w-3' : 'bg-white/60'
                            }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
                    {selectedProductDetails.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSlideIndex(idx)}
                        className={`relative w-11 h-14 shrink-0 rounded overflow-hidden border-2 bg-stone-50 transition-all cursor-pointer ${idx === activeSlideIndex ? 'border-black ring-1 ring-black/10 scale-102' : 'border-stone-200 hover:border-stone-400'
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
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-sm font-bold font-mono text-black">₹{selectedProductDetails.price}</p>
                        {selectedProductDetails.originalPrice && selectedProductDetails.originalPrice !== selectedProductDetails.price && (
                          <p className="text-xs font-mono text-stone-400 line-through">₹{selectedProductDetails.originalPrice}</p>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 leading-relaxed font-serif italic text-left">
                      "{selectedProductDetails.description}"
                    </p>

                    {/* Stock listing */}
                    <div>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-widest font-mono mb-2">Sizes & Availability:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                        {selectedProductDetails.sizes.map(sz => {
                          const quantity = selectedProductDetails.stock[sz] || 0;
                          return (
                            <div key={sz} className="p-2 border border-stone-150 rounded flex justify-between">
                              <span className="font-bold text-stone-700">{sz}</span>
                              <span className={quantity === 0 ? 'text-rose-500 font-bold' : quantity < 3 ? 'text-amber-600 font-semibold' : 'text-emerald-600'}>
                                {quantity === 0 ? 'Out Of Stock' : `${quantity} available`}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp CTA */}
                  <div className="pt-6 border-t border-stone-100 mt-6 space-y-3">
                    <a
                      href={getWhatsAppLink(selectedProductDetails)}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-2.5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-semibold rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Buy on WhatsApp
                    </a>
                    <p className="text-[10px] text-stone-400 text-center font-mono leading-relaxed">
                      Tap to message us on WhatsApp with this product. We'll confirm availability and guide you through the purchase!
                    </p>
                  </div>

                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
