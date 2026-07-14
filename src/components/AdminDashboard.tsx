/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { 
  Package, AlertTriangle, 
  Trash2, Plus, ArrowLeft,
  Camera
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  onNavigateToCustomer: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToCustomer }) => {
  const {
    products,
    feedbacks,
    addProduct,
    updateProduct,
    deleteProduct,
    triggerSaleNotification
  } = useStore();

  // Active Admin Sub-Tab: 'inventory'
  const [adminTab, setAdminTab] = useState<'inventory'>('inventory');

  // Camera capture states
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: 640, height: 480 } 
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 300);
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access camera device. Please grant standard permissions.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas image to data URL
        const dataUrl = canvas.toDataURL('image/jpeg');
        setNewProdImage(dataUrl);
        stopCamera();
        triggerSaleNotification(
          'Photo Snapped Successfully!',
          'Camera frame captured and catalogued inside wardrobing database.',
          'general'
        );
      }
    }
  };

  // Product addition state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Dresses');
  const [newProdPrice, setNewProdPrice] = useState<number>(3500);
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdXSStock, setNewProdXSStock] = useState<number>(5);
  const [newProdSStock, setNewProdSStock] = useState<number>(10);
  const [newProdMStock, setNewProdMStock] = useState<number>(10);
  const [newProdLStock, setNewProdLStock] = useState<number>(5);
  const [newProdXLStock, setNewProdXLStock] = useState<number>(0);
  const [newProdXXLStock, setNewProdXXLStock] = useState<number>(0);
  const [newProdImage, setNewProdImage] = useState('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80');
  const [newProdImage2, setNewProdImage2] = useState('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80');
  const [newProdImage3, setNewProdImage3] = useState('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80');
  const [newProdImage4, setNewProdImage4] = useState('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80');
  const [newProdImage5, setNewProdImage5] = useState('https://images.unsplash.com/photo-1548624149-f9c17d4d6351?w=800&auto=format&fit=crop&q=80');
  const [newProdWhatsappLink, setNewProdWhatsappLink] = useState('');



  // Editing state for inventory stock override
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editStockXS, setEditStockXS] = useState<number>(0);
  const [editStockS, setEditStockS] = useState<number>(0);
  const [editStockM, setEditStockM] = useState<number>(0);
  const [editStockL, setEditStockL] = useState<number>(0);
  const [editStockXL, setEditStockXL] = useState<number>(0);
  const [editStockXXL, setEditStockXXL] = useState<number>(0);
  const [editWhatsappLink, setEditWhatsappLink] = useState('');

  // ALARMS AND DIAGNOSTICS CALCULATIONS
  // 1. Inventory Exhaustion Alarm: total aggregate stock < 5 or size completely out of stock
  const exhaustionAlarms = products.map(prod => {
    const totalStock = Object.values(prod.stock).reduce((a: number, b) => a + Number(b), 0) as number;
    const outOfStockSizes = prod.sizes.filter(sz => (prod.stock[sz] || 0) === 0);
    return {
      product: prod,
      totalStock,
      outOfStockSizes,
      isTriggered: totalStock < 5 || outOfStockSizes.length > 0
    };
  }).filter(alarm => alarm.isTriggered);

  // 2. Dead Inventory Alarm: Items in warehouse since long with zero/very low sales count (e.g. < 4 items sold)
  const deadInventoryAlarms = products.map(prod => {
    // Treat any item with < 4 sales and older creation standard as dead inventory potential
    const daysSinceCreation = Math.floor((Date.now() - new Date(prod.creationDate).getTime()) / (1000 * 60 * 60 * 24));
    return {
      product: prod,
      salesCount: prod.salesCount,
      daysInStock: daysSinceCreation || 15,
      isTriggered: prod.salesCount < 4 && daysSinceCreation > 10
    };
  }).filter(alarm => alarm.isTriggered);



  // Form submit for adding product
  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDescription) return;

    addProduct({
      name: newProdName,
      category: newProdCategory,
      price: newProdPrice,
      description: newProdDescription,
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      stock: {
        'S': newProdSStock,
        'M': newProdMStock,
        'L': newProdLStock,
        'XL': newProdXLStock,
        'XXL': newProdXXLStock
      },
      images: [
        newProdImage || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        newProdImage2 || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        newProdImage3 || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
        newProdImage4 || 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80',
        newProdImage5 || 'https://images.unsplash.com/photo-1548624149-f9c17d4d6351?w=800&auto=format&fit=crop&q=80'
      ],
      whatsappLink: newProdWhatsappLink || undefined
    });

    // Reset fields
    setNewProdName('');
    setNewProdDescription('');
    setNewProdPrice(3500);
    setNewProdImage('https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80');
    setNewProdImage2('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80');
    setNewProdImage3('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80');
    setNewProdImage4('https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80');
    setNewProdImage5('https://images.unsplash.com/photo-1548624149-f9c17d4d6351?w=800&auto=format&fit=crop&q=80');
    setNewProdWhatsappLink('');
    
    triggerSaleNotification(
      'New Collection Arrival!',
      `Brand new Label Swati style: [${newProdName}] has been catalogued. Available dimensions added to active inventory filters!`,
      'arrival'
    );
    alert('Product successfully catalogued under collection database!');
  };



  const handleOverrideProductDetails = (productId: string) => {
    updateProduct(productId, {
      stock: {
        'S': editStockS,
        'M': editStockM,
        'L': editStockL,
        'XL': editStockXL,
        'XXL': editStockXXL
      },
      whatsappLink: editWhatsappLink || undefined
    });
    setEditingProductId(null);
    alert('Garment details and stock quantities overridden successfully!');
  };

  return (
    <div className="bg-stone-50 min-h-screen text-stone-900 pb-16 font-sans">
      
      {/* Admin header */}
      <header className="bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] text-white py-5 sticky top-0 z-20 shadow-md">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateToCustomer}
              className="mr-2 px-2.5 py-1.5 bg-white text-[#4C1D95] hover:text-[#C2410C] text-[11px] font-mono font-bold rounded flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-xs group"
              id="admin-to-customer-back-btn"
              title="Return to Customer Storefront"
            >
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> BACK TO STORE
            </button>
            <div className="h-6 w-px bg-white/25 hidden md:block" />
              <img src="/logo.jpg" alt="Label Swati Logo" className="h-8 md:h-10 w-auto shrink-0 object-contain rounded-md opacity-95" />
            <div>
              <span className="text-[10px] tracking-widest text-[#FED7AA] font-mono uppercase font-bold block">Internal Warehousing Engine</span>
              <h1 className="text-sm font-bold tracking-tight uppercase font-mono">Label Swati Custom Admin Node</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onNavigateToCustomer}
              className="px-3 py-1.5 bg-white text-[#4C1D95] hover:text-[#C2410C] text-xs font-semibold rounded hover:bg-stone-50 flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return Customer portal
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT RAILS: SUB-TAB SWITCHING & DIAGNOSTIC ALARMS CARD */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Sidebar navigation tabs */}
            <div className="bg-white rounded-lg border border-stone-150 p-4 space-y-1 block">
              <span className="block text-[9px] text-stone-400 uppercase tracking-wider font-semibold font-mono pb-2 px-2.5">Control Center</span>
              
              <button
                onClick={() => setAdminTab('inventory')}
                className={`w-full py-2 px-3 rounded text-left text-xs font-medium flex items-center gap-2.5 transition-all outline-hidden ${
                  adminTab === 'inventory' ? 'bg-[#4C1D95] text-white font-semibold shadow-xs' : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Package className="w-4 h-4" /> Product & Warehouse
              </button>
            </div>

            {/* LIVE DIAGNOSTICS & HARDWARE ALARMS BLOCK */}
            <div className="bg-white rounded-lg border border-stone-150 p-4.5 space-y-4">
              <div className="border-b border-stone-100 pb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <h4 className="text-[10px] uppercase tracking-wider text-stone-400 font-mono font-bold">
                  Telemetry Alerts
                </h4>
              </div>

              {/* A. Inventory exhaustion alarm triggers */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                  ⚠️ Stock Exhaustion Alarms ({exhaustionAlarms.length})
                </span>
                
                {exhaustionAlarms.length === 0 ? (
                  <p className="text-[10px] text-stone-400 font-serif italic mt-1 pl-1">Aggregate warehouse stock levels nominal.</p>
                ) : (
                  <div className="space-y-1.5 mt-2">
                    {exhaustionAlarms.slice(0, 3).map(alarm => (
                      <div key={alarm.product.id} className="bg-rose-50 border border-rose-100 p-2 rounded text-[10px] font-mono leading-relaxed text-rose-800">
                        <p className="font-bold">LOW STOCK DETECTED</p>
                        <p className="mt-0.5">{alarm.product.name} aggregate availability total: <span className="font-bold underline">{alarm.totalStock} units</span>.</p>
                        {alarm.outOfStockSizes.length > 0 && <p className="text-[9px] text-rose-600 mt-0.5">Deficit sizes: {alarm.outOfStockSizes.join(', ')}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* B. Dead inventory alarm triggers */}
              <div>
                <span className="block text-[10px] uppercase font-semibold text-stone-500 tracking-wider">
                  ⚙️ Dead Inventory Alarms ({deadInventoryAlarms.length})
                </span>

                {deadInventoryAlarms.length === 0 ? (
                  <p className="text-[10px] text-stone-400 font-serif italic mt-1 pl-1">Nominal stock rotation values verified.</p>
                ) : (
                  <div className="space-y-1.5 mt-2">
                    {deadInventoryAlarms.slice(0, 3).map(alarm => (
                      <div key={alarm.product.id} className="bg-amber-50 border border-amber-200/50 p-2 rounded text-[10px] font-mono leading-relaxed text-amber-800">
                        <p className="font-bold">DEAD INVENTORY ALARM</p>
                        <p className="mt-0.5">{alarm.product.name} spent {alarm.daysInStock} days in stock with only <span className="underline font-bold">{alarm.salesCount} sold</span>.</p>
                        <p className="text-[9px] text-stone-500 mt-1">Recommendation: Restructure inside catalog spotlight or create targeted flat discount promo.</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* RIGHT SCREEN MAIN DESKTOP PANEL */}
          <div className="lg:col-span-9 space-y-8">
            
            {/* VIEW 2: DETAILED INVENTORY & GARMENT MULTIPLEXER */}
            {adminTab === 'inventory' && (
              <div className="space-y-8">
                
                {/* 1. Add new products section */}
                <div className="bg-white rounded-lg border border-stone-200 p-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-2 mb-4">
                    Catalogue new design into collection
                  </h3>

                  <form onSubmit={handleAddProductSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700">Garment Name</label>
                        <input 
                          type="text" 
                          required
                          value={newProdName}
                          onChange={(e) => setNewProdName(e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-250 rounded focus:bg-white"
                          placeholder="E.g. Cashmere Cream Wrap"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700">Display Category</label>
                        <select
                          value={newProdCategory}
                          onChange={(e) => setNewProdCategory(e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-250 rounded focus:bg-white"
                        >
                          {['Dresses', 'Coats', 'Knitwear', 'Trousers', 'Tees'].map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700">Base Retail Price (₹ INR)</label>
                        <input 
                          type="number" 
                          required
                          value={newProdPrice}
                          onChange={(e) => setNewProdPrice(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-250 rounded focus:bg-white font-mono"
                          placeholder="₹ Price size"
                        />
                      </div>
                      
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-stone-700">WhatsApp Product Link (Optional)</label>
                        <input 
                          type="text" 
                          value={newProdWhatsappLink}
                          onChange={(e) => setNewProdWhatsappLink(e.target.value)}
                          className="w-full text-xs p-2 bg-stone-50 border border-stone-250 rounded focus:bg-white font-mono"
                          placeholder="E.g., https://wa.me/p/... or custom"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-stone-150 pt-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">Product Images specified by 5 Different Angles</span>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => document.getElementById('gallery-file-upload')?.click()}
                            className="text-[10px] text-emerald-805 bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1 px-2.5 py-1 rounded border border-emerald-200 font-semibold cursor-pointer"
                          >
                            📁 Base Angle Upload
                          </button>
                          <input 
                            id="gallery-file-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  if (typeof reader.result === 'string') {
                                    setNewProdImage(reader.result);
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={startCamera}
                            className="text-[10px] text-purple-700 bg-purple-50 hover:bg-purple-150 flex items-center gap-1 px-2.5 py-1 rounded border border-purple-200 font-semibold cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" /> Base Cam Snap
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { label: 'Angle 1 (Primary Front)', get: newProdImage, set: setNewProdImage },
                          { label: 'Angle 2 (Back View)', get: newProdImage2, set: setNewProdImage2 },
                          { label: 'Angle 3 (Left Angle)', get: newProdImage3, set: setNewProdImage3 },
                          { label: 'Angle 4 (Right Angle)', get: newProdImage4, set: setNewProdImage4 },
                          { label: 'Angle 5 (Close-up/Raw)', get: newProdImage5, set: setNewProdImage5 }
                        ].map((imgEntry, idx) => (
                          <div key={idx} className="space-y-1.5 p-2 bg-stone-50 border border-stone-200 rounded-md flex flex-col justify-between">
                            <div>
                              <span className="block text-[10px] font-bold text-stone-700 font-mono mb-1">{imgEntry.label}</span>
                              <div className="relative aspect-3/4 rounded overflow-hidden border border-stone-250 bg-stone-200 mb-1.5 shadow-inner shadow-black/5">
                                {imgEntry.get ? (
                                  <img src={imgEntry.get} className="w-full h-full object-cover" alt={imgEntry.label} referrerPolicy="no-referrer" />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-[10px] text-stone-400 font-mono">No Image</div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <input 
                                type="text" 
                                required
                                value={imgEntry.get}
                                onChange={(e) => imgEntry.set(e.target.value)}
                                className="w-full text-[10px] p-1.5 bg-white border border-stone-300 rounded font-mono focus:ring-1 focus:ring-stone-500 truncate"
                                placeholder="Paste image link URL"
                              />
                              <button
                                type="button"
                                onClick={() => document.getElementById(`gallery-file-upload-${idx}`)?.click()}
                                className="w-full text-[9px] text-stone-600 bg-stone-200 hover:bg-stone-300 px-1 py-1 rounded font-semibold cursor-pointer"
                              >
                                Upload Image
                              </button>
                              <input 
                                id={`gallery-file-upload-${idx}`}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      if (typeof reader.result === 'string') {
                                        imgEntry.set(reader.result);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {showCamera && (
                      <div className="p-4 bg-stone-900 text-white rounded-lg border border-purple-500/40 relative space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-stone-850">
                          <div className="flex items-center gap-1.5 font-mono text-[10px] text-amber-400 font-bold tracking-wider">
                            <span className="w-2 h-2 bg-rose-600 rounded-full animate-ping" />
                            <span>LIVE WARDROBE CAMERA VIEWFINDER</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={stopCamera} 
                            className="text-[10px] text-stone-400 hover:text-white bg-stone-800 px-2 py-1 rounded"
                          >
                            Cancel
                          </button>
                        </div>

                        {cameraError ? (
                          <div className="p-4 bg-rose-950/40 text-rose-400 rounded-md border border-rose-900 text-xs text-center font-mono">
                            {cameraError}
                          </div>
                        ) : (
                          <div className="relative aspect-video max-w-sm mx-auto bg-black rounded overflow-hidden border border-stone-800 shadow-inner">
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              className="w-full h-full object-cover" 
                            />
                            <div className="absolute inset-0 border border-white/10 pointer-events-none" />
                          </div>
                        )}

                        <div className="flex justify-center gap-3 pt-1">
                          <button
                            type="button"
                            onClick={capturePhoto}
                            disabled={!!cameraError}
                            className="bg-gradient-to-r from-[#C2410C] via-[#9333EA] to-[#4C1D95] text-white font-semibold text-xs py-2 px-5 rounded-full flex items-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50 shadow-md"
                          >
                            <Camera className="w-4 h-4" /> Snap Wardrobe Photograph
                          </button>
                        </div>
                        
                        <canvas ref={canvasRef} className="hidden" />
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="block text-xs font-semibold text-stone-700">Artistic Campaign Description</label>
                      <textarea 
                        required
                        rows={2}
                        value={newProdDescription}
                        onChange={(e) => setNewProdDescription(e.target.value)}
                        className="w-full text-xs p-2 bg-stone-50 border border-stone-250 rounded focus:bg-white resize-y"
                        placeholder="Detail material sourcing, silhouette structure & seasonal inspiration..."
                      />
                    </div>

                    {/* Stock listing counters per size */}
                    <div>
                      <span className="block text-xs font-bold text-stone-400 font-mono uppercase tracking-wider mb-2">Configure size initial stocks:</span>
                      <div className="grid grid-cols-5 gap-2 text-xs font-mono">
                        {[
                          { size: 'S', get: newProdSStock, set: setNewProdSStock },
                          { size: 'M', get: newProdMStock, set: setNewProdMStock },
                          { size: 'L', get: newProdLStock, set: setNewProdLStock },
                          { size: 'XL', get: newProdXLStock, set: setNewProdXLStock },
                          { size: 'XXL', get: newProdXXLStock, set: setNewProdXXLStock },
                        ].map(st => (
                          <div key={st.size} className="space-y-0.5 text-center">
                            <span className="block font-semibold text-stone-600">{st.size}</span>
                            <input 
                              type="number" 
                              min="0"
                              value={st.get}
                              onChange={(e) => st.set(Math.max(0, parseInt(e.target.value) || 0))}
                              className="text-center w-full bg-stone-50 border border-stone-250 rounded p-1.5 focus:bg-white"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-black hover:bg-stone-850 text-white text-xs font-semibold uppercase tracking-widest rounded transition-colors"
                    >
                      Process Wardrobe Addition +
                    </button>
                  </form>
                </div>

                {/* 2. Warehouse list display & stock override capabilities */}
                <div className="bg-white rounded-lg border border-stone-200 overflow-hidden">
                  <div className="p-5 border-b border-stone-100 flex justify-between items-baseline">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900 font-mono">Dynamic Stocking ledger</h3>
                    <span className="text-[10px] text-stone-400 font-mono">{products.length} registered designs</span>
                  </div>

                  <div className="overflow-x-auto text-xs font-sans text-left">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-stone-50 text-stone-400 font-mono uppercase tracking-widest text-[9px] border-b border-stone-150">
                          <th className="py-3 px-4 font-normal">Garment Details</th>
                          <th className="py-3 px-4 font-normal">Category</th>
                          <th className="py-3 px-4 font-normal">Retail (₹)</th>
                          <th className="py-3 px-4 font-normal">Sales settled</th>
                          <th className="py-3 px-4 font-normal">Dimensions stock ledger</th>
                          <th className="py-3 px-4 font-normal text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                       {products.map(prod => (
                          <React.Fragment key={prod.id}>
                            <tr className="hover:bg-stone-50/40">
                              <td className="py-3 px-4 flex items-center gap-3">
                                <img 
                                  src={prod.images[0]} 
                                  alt={prod.name} 
                                  className="w-9 h-11 object-cover rounded bg-stone-100 border"
                                  referrerPolicy="no-referrer"
                                />
                                <div>
                                  <p className="font-bold text-stone-900">{prod.name}</p>
                                  <p className="text-[9px] text-stone-400 font-mono uppercase">ID: {prod.id}</p>
                                  {prod.whatsappLink ? (
                                    <p className="text-[9px] text-emerald-600 font-mono truncate max-w-[200px]" title={prod.whatsappLink}>
                                      🔗 Link: {prod.whatsappLink}
                                    </p>
                                  ) : (
                                    <p className="text-[9px] text-amber-600 font-mono">
                                      ⚠️ No Specific Link (Fallback Active)
                                    </p>
                                  )}
                                  <div className="flex items-center gap-2 mt-1">
                                    <button
                                      onClick={() => document.getElementById(`upload-${prod.id}`)?.click()}
                                      className="text-[9px] text-purple-700 bg-purple-50 hover:bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200 cursor-pointer font-sans font-semibold select-none"
                                    >
                                      📁 Edit Photo
                                    </button>
                                    <input
                                      id={`upload-${prod.id}`}
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onloadend = () => {
                                            if (typeof reader.result === 'string') {
                                              updateProduct(prod.id, {
                                                images: [reader.result, ...prod.images.slice(1)]
                                              });
                                              alert('Product image updated successfully in warehouse database!');
                                            }
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </div>
                                </div>
                              </td>

                              <td className="py-3 px-4">
                                <span className="bg-stone-100 text-stone-600 font-mono text-[10px] px-2 py-0.5 rounded font-medium">{prod.category}</span>
                              </td>

                              <td className="py-3 px-4 font-mono font-bold text-stone-800">
                                ₹{prod.price}
                              </td>

                              <td className="py-3 px-4 font-mono font-semibold text-emerald-700">
                                {prod.salesCount} units
                              </td>

                              <td className="py-3 px-4 font-mono leading-normal text-stone-500">
                                {Object.keys(prod.stock).map(sz => (
                                  <span key={sz} className="inline-block mr-2 text-[10px]">
                                    <span className="font-bold text-stone-700">{sz}:</span> {prod.stock[sz] || 0}
                                  </span>
                                ))}
                              </td>

                              <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setEditingProductId(editingProductId === prod.id ? null : prod.id);
                                    setEditStockXS(prod.stock['XS'] || 0);
                                    setEditStockS(prod.stock['S'] || 0);
                                    setEditStockM(prod.stock['M'] || 0);
                                    setEditStockL(prod.stock['L'] || 0);
                                    setEditStockXL(prod.stock['XL'] || 0);
                                    setEditStockXXL(prod.stock['XXL'] || 0);
                                    setEditWhatsappLink(prod.whatsappLink || '');
                                  }}
                                  className="text-[10px] font-mono px-2 py-1 border border-stone-250 text-stone-600 hover:text-black rounded"
                                >
                                  {editingProductId === prod.id ? 'Close' : 'Edit Product'}
                                </button>
                                <button
                                  onClick={() => {
                                    if(confirm(`Are you sure you want to permanently delete ${prod.name}?`)) {
                                      deleteProduct(prod.id);
                                    }
                                  }}
                                  className="text-[10px] font-mono px-2 py-1 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 hover:text-rose-700 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Delete design"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </td>
                            </tr>
                            {/* EXPANSED STOCK ADJUSTMENT ROW */}
                            {editingProductId === prod.id && (
                              <tr className="bg-stone-50/70 font-mono text-[11px]">
                                <td colSpan={6} className="p-4">
                                  <div className="space-y-4 max-w-2xl">
                                    <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4">
                                      <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px]">Overriding Stock values for {prod.name}:</span>
                                      <div className="flex gap-2 text-center">
                                        {['S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                                          const originalV = prod.stock[sz] || 0;
                                          const gets = { 'S': editStockS, 'M': editStockM, 'L': editStockL, 'XL': editStockXL, 'XXL': editStockXXL }[sz as ('S'|'M'|'L'|'XL'|'XXL')];
                                          const sets = {
                                            'S': setEditStockS,
                                            'M': setEditStockM,
                                            'L': setEditStockL,
                                            'XL': setEditStockXL,
                                            'XXL': setEditStockXXL
                                          }[sz as ('S'|'M'|'L'|'XL'|'XXL')];

                                          return (
                                            <div key={sz} className="w-14">
                                              <span className="block text-[10px] font-bold text-stone-500">{sz} (Orig: {originalV})</span>
                                              <input 
                                                type="number" 
                                                min="0"
                                                value={gets}
                                                onChange={(e) => sets(Math.max(0, parseInt(e.target.value) || 0))}
                                                className="bg-white border rounded text-center py-1 w-full mt-1 font-bold text-black"
                                              />
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-col gap-1.5 border-t border-stone-200/60 pt-3">
                                      <label className="block text-[10px] font-bold text-stone-500 uppercase">WhatsApp Catalogue Product URL</label>
                                      <div className="flex gap-2">
                                        <input 
                                          type="text" 
                                          value={editWhatsappLink}
                                          onChange={(e) => setEditWhatsappLink(e.target.value)}
                                          className="bg-white border rounded px-2 py-1.5 w-full text-xs font-mono text-black font-semibold"
                                          placeholder="E.g., https://wa.me/p/... or custom link"
                                        />
                                        <button
                                          onClick={() => handleOverrideProductDetails(prod.id)}
                                          className="py-1.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-sans font-semibold uppercase tracking-wider shrink-0"
                                        >
                                          Save Changes
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </main>

    </div>
  );
};
