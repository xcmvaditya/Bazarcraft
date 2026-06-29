import React, { useState } from "react";
import { X, Star, ShieldCheck, Truck, RefreshCw, Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { Product } from "../firebase";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductModal({ product, onClose, onAddToCart }: ProductModalProps) {
  if (!product) return null;
  const [quantity, setQuantity] = useState(1);
  const isOutOfStock = product.stock <= 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(q => q + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(q => q - 1);
    }
  };

  const handleAdd = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div id="product-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        id="product-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          id="product-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-slate-100/80 hover:bg-slate-900 hover:text-white rounded-full transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Product Image */}
        <div className="md:w-1/2 bg-slate-50 relative min-h-[300px] md:min-h-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          {product.featured && (
            <div className="absolute bottom-4 left-4 bg-slate-900 text-amber-400 text-xs font-mono font-bold tracking-wider uppercase px-3 py-1.5 rounded-full border border-slate-800">
              Curated Masterpiece
            </div>
          )}
        </div>

        {/* Right Side: Product Details */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
          {/* Category */}
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2 block">
            {product.category}
          </span>

          {/* Name */}
          <h2 className="text-2xl md:text-3xl font-sans font-semibold text-slate-900 mb-3 tracking-tight">
            {product.name}
          </h2>

          {/* Stars Rating */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? "text-amber-500 fill-amber-500"
                      : "text-slate-200"
                  }`}
                />
              ))}
              <span className="text-sm font-semibold text-slate-700 ml-1.5">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="text-xs text-slate-400 font-mono">
              {product.reviewsCount} customer reviews
            </span>
          </div>

          {/* Pricing */}
          <div className="mb-6 bg-slate-50 p-4 rounded-2xl flex items-baseline justify-between">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono mb-1">Price</span>
              <span className="text-3xl font-sans font-bold text-slate-950">${product.price}</span>
            </div>
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono mb-1 text-right">Inventory</span>
              {isOutOfStock ? (
                <span className="text-sm font-bold text-rose-500">Temporarily Sold Out</span>
              ) : (
                <span className="text-sm font-semibold text-slate-700 font-mono">
                  {product.stock} items available
                </span>
              )}
            </div>
          </div>

          {/* Long Description */}
          <div className="flex-1 mb-6">
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2 font-mono">Product overview</h4>
            <p className="text-slate-600 text-sm leading-relaxed font-sans">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Section */}
          <div className="space-y-4 border-t border-slate-100 pt-6">
            {!isOutOfStock && (
              <div className="flex items-center gap-4">
                <span className="text-sm font-sans font-medium text-slate-600">Quantity</span>
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 p-1">
                  <button
                    id="quantity-decrement-btn"
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-slate-900 transition-all disabled:opacity-40"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-mono font-semibold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    id="quantity-increment-btn"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock}
                    className="p-1.5 hover:bg-white hover:shadow-sm rounded-lg text-slate-500 hover:text-slate-900 transition-all disabled:opacity-40"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            <button
              id="add-to-cart-modal-action"
              onClick={handleAdd}
              disabled={isOutOfStock}
              className={`w-full py-4 px-6 rounded-2xl font-sans font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                isOutOfStock
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                  : "bg-amber-500 text-slate-950 hover:bg-amber-600 shadow-lg shadow-amber-500/10 active:scale-[0.98]"
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              {isOutOfStock ? "Sold Out" : "Add to Shopping Cart"}
            </button>
          </div>

          {/* Premium Guarantees */}
          <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-slate-100 text-[10px] text-slate-400 font-mono uppercase tracking-wider text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secure Pay</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-4 h-4 text-indigo-500" />
              <span>Fast Transit</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RefreshCw className="w-4 h-4 text-amber-500" />
              <span>Easy Return</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
