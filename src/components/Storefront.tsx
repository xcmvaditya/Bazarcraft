import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw, Layers, Star, Sparkles, ShoppingBag, Eye, History, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, getOrders, getProducts } from "../firebase";
import ProductCard from "./ProductCard";

interface StorefrontProps {
  products: Product[];
  isLoading: boolean;
  onRefresh: () => void;
  onAddToCart: (product: Product) => void;
  onQuickView: (product: Product) => void;
  orders: Order[];
}

export default function Storefront({
  products,
  isLoading,
  onRefresh,
  onAddToCart,
  onQuickView,
  orders
}: StorefrontProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "rating">("featured");
  const [showOrdersDrawer, setShowOrdersDrawer] = useState(false);

  // Derive unique categories dynamically
  const categories = ["All", ...Array.from(new Set(products.map(p => p.category)))];

  // Filter and Sort Products
  const filteredProducts = products
    .filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.description.toLowerCase().includes(search.toLowerCase());
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      // Default / featured
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return 0;
    });

  return (
    <div id="storefront-view" className="flex flex-col min-h-screen bg-slate-50/50 pb-20">
      
      {/* Premium Hero Banner */}
      <div className="relative overflow-hidden bg-slate-950 text-white py-12 px-6 sm:px-12 md:px-16 border-b border-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(245,158,11,0.08),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 text-amber-400 text-xs font-mono px-3 py-1 rounded-full border border-amber-500/25">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              SOCIALLY SUSTAINABLE & HANDCRAFTED
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-bold tracking-tight text-white leading-[1.1]">
              Elevating daily rituals through <span className="text-amber-500 font-serif italic font-normal">conscious</span> design.
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg leading-relaxed font-sans">
              Discover our exclusive editorial collection of modular workspace instruments, heirloom tech accessories, and tailor-made apparel.
            </p>
          </div>
          <div className="hidden lg:block relative w-80 h-44 border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/60 p-4 shadow-2xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-mono text-slate-500">LIMITED ISSUE 001</span>
              <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">INSTOCK</span>
            </div>
            <h3 className="font-sans font-medium text-slate-200 text-sm">Walnut Desk Sculpt Organizer</h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">Meticulously carved American sustainable walnut featuring secure magnetic phone alignments.</p>
            <div className="mt-4 flex justify-between items-center">
              <span className="text-base font-bold text-amber-500 font-mono">$85.00</span>
              <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-800 px-2 py-1 rounded">DESIGN AWARD</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Filter Sidebar Menu */}
          <aside id="storefront-filters-sidebar" className="w-full lg:w-64 bg-white border border-slate-100 p-6 rounded-2xl shrink-0 space-y-6 shadow-sm">
            {/* Search Input */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Find Instruments</h4>
              <div className="relative">
                <input
                  id="search-products-input"
                  type="text"
                  placeholder="Keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Category Filter Menu */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Categories</h4>
              <div className="flex flex-wrap lg:flex-col gap-1">
                {categories.map((cat) => (
                  <button
                    id={`filter-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-left px-3 py-2 rounded-xl text-xs font-sans font-medium transition-all w-full flex items-center justify-between ${
                      selectedCategory === cat
                        ? "bg-slate-900 text-white"
                        : "bg-transparent text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && (
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Menu */}
            <div className="space-y-2 pt-2 border-t border-slate-50">
              <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold">Sort Settings</h4>
              <div className="relative">
                <select
                  id="sort-products-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans cursor-pointer appearance-none"
                >
                  <option value="featured">Featured / Curated</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated ⭐</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Orders History Drawer Trigger */}
            <button
              id="view-orders-history-btn"
              onClick={() => setShowOrdersDrawer(true)}
              className="w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-sans font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-200/30"
            >
              <History className="w-4 h-4 text-slate-500" />
              My Orders ({orders.length})
            </button>

            {/* Reset Button */}
            <button
              id="reset-filters-btn"
              onClick={() => {
                setSearch("");
                setSelectedCategory("All");
                setSortBy("featured");
              }}
              className="w-full py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400 hover:text-slate-800 text-center transition-colors border-t border-slate-50 pt-4"
            >
              Reset Filters
            </button>
          </aside>

          {/* Right Product Grid */}
          <main className="flex-1 w-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="font-sans font-semibold text-slate-900 text-xl">Selected Curation</h2>
                <span className="text-xs font-mono text-slate-400">({filteredProducts.length} items)</span>
              </div>
              
              <button
                id="refresh-storefront-btn"
                onClick={onRefresh}
                disabled={isLoading}
                className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                title="Sync database items"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-amber-500" : ""}`} />
              </button>
            </div>

            {/* Catalog list or Loader */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 animate-pulse">
                    <div className="aspect-square bg-slate-100 rounded-xl" />
                    <div className="h-4 bg-slate-100 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-8 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl py-24 text-center max-w-lg mx-auto">
                <Layers className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <h3 className="font-sans font-semibold text-slate-800 text-base">No matching instruments found</h3>
                <p className="text-slate-400 text-xs mt-1 px-8 leading-relaxed">
                  Try clearing your search query, selecting another category menu item, or adding custom designs using the merchant Admin Console!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onQuickView={onQuickView}
                    onAddToCart={onAddToCart}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* Slide-over User Orders History Drawer */}
      <AnimatePresence>
        {showOrdersDrawer && (
          <div id="orders-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
            <div className="absolute inset-0 -z-10" onClick={() => setShowOrdersDrawer(false)} />
            <motion.div
              id="orders-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" />
                  <h2 className="font-sans font-semibold text-lg">My Purchase Records</h2>
                </div>
                <button
                  id="close-orders-drawer"
                  onClick={() => setShowOrdersDrawer(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Orders List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <Clock className="w-8 h-8 text-slate-300 mb-3" />
                    <p className="font-sans font-semibold text-slate-700 text-sm">No transaction history</p>
                    <p className="text-slate-400 text-xs mt-1">Place items into your basket and complete a simulated checkout.</p>
                  </div>
                ) : (
                  orders.map((ord) => (
                    <div
                      id={`history-order-${ord.id}`}
                      key={ord.id}
                      className="border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">ORDER ID</span>
                          <span className="text-xs font-mono font-bold text-slate-700">{ord.id?.substring(0, 12)}...</span>
                        </div>
                        <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full font-bold ${
                          ord.status === "Delivered" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                          ord.status === "Shipped" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" :
                          ord.status === "Processing" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                          ord.status === "Cancelled" ? "bg-rose-50 text-rose-600 border border-rose-100" :
                          "bg-amber-50 text-amber-700 border border-amber-100"
                        }`}>
                          {ord.status}
                        </span>
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      {/* Items Ordered */}
                      <div className="space-y-2">
                        {ord.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs text-slate-600">
                            <span className="truncate max-w-[200px]">{item.name} <span className="text-slate-400 font-mono">x{item.quantity}</span></span>
                            <span className="font-mono">${item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="h-[1px] bg-slate-100" />

                      <div className="flex justify-between items-center text-xs font-sans">
                        <span className="text-slate-400 font-medium">Total Paid</span>
                        <span className="font-mono font-bold text-slate-900">${ord.totalAmount}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
