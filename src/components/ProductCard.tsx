import React from "react";
import { Star, ShoppingCart, Eye, PackageX } from "lucide-react";
import { Product } from "../firebase";

interface ProductCardProps {
  key?: string;
  product: Product;
  onQuickView: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onQuickView, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group relative flex flex-col bg-white border border-slate-100 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-100/80 hover:-translate-y-1"
    >
      {/* Product Image Panel */}
      <div className="relative aspect-square overflow-hidden bg-slate-50">
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Dark overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Action Buttons Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            id={`quick-view-btn-${product.id}`}
            onClick={() => onQuickView(product)}
            className="p-3 bg-white text-slate-800 hover:bg-slate-900 hover:text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
            title="Quick View"
          >
            <Eye className="w-5 h-5" />
          </button>
          
          {!isOutOfStock && (
            <button
              id={`add-to-cart-quick-${product.id}`}
              onClick={() => onAddToCart(product)}
              className="p-3 bg-amber-500 text-slate-950 hover:bg-amber-600 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
              title="Add to Cart"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Featured Badge */}
        {product.featured && (
          <div className="absolute top-3 left-3 bg-slate-900/90 text-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-slate-800 backdrop-blur-sm">
            Curated
          </div>
        )}

        {/* Stock Alert Badge */}
        {isOutOfStock ? (
          <div className="absolute top-3 right-3 bg-rose-500 text-white text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
            Sold Out
          </div>
        ) : product.stock < 5 ? (
          <div className="absolute top-3 right-3 bg-amber-500/90 text-slate-950 text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
            Only {product.stock} Left
          </div>
        ) : null}
      </div>

      {/* Description Panel */}
      <div className="flex-1 flex flex-col p-5">
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1.5 block">
          {product.category}
        </span>
        
        <h3 className="font-sans font-medium text-slate-800 group-hover:text-amber-600 transition-colors text-base line-clamp-1 mb-1">
          {product.name}
        </h3>
        
        <p className="text-slate-400 text-xs line-clamp-2 mb-4 flex-1">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-50">
          <div>
            <span className="text-xs text-slate-400 block font-mono">Price</span>
            <span className="text-lg font-sans font-semibold text-slate-900">
              ${product.price}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 px-2.5 py-1 rounded-lg">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-slate-700">
              {product.rating.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
