import React from "react";
import { ShoppingCart, Store, ShieldAlert, Sparkles } from "lucide-react";

interface HeaderProps {
  mode: "customer" | "admin";
  onModeChange: (mode: "customer" | "admin") => void;
  cartCount: number;
  onOpenCart: () => void;
}

export default function Header({ mode, onModeChange, cartCount, onOpenCart }: HeaderProps) {
  return (
    <header
      id="app-header"
      className={`sticky top-0 z-40 w-full transition-all duration-300 border-b ${
        mode === "admin"
          ? "bg-slate-900 border-slate-800 text-white"
          : "bg-white/85 border-slate-100 text-slate-900 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Identity */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/10 shrink-0">
            <Sparkles className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <h1 className="font-sans font-bold tracking-tight text-lg leading-none">
              Bazaar<span className="text-amber-500">Craft</span>
            </h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mt-1 block leading-none">
              ARTISAN RETAILED
            </span>
          </div>
        </div>

        {/* Central Segment Toggler (Mode Switcher) */}
        <div className={`p-1 rounded-xl flex items-center gap-1 border ${
          mode === "admin" 
            ? "bg-slate-950 border-slate-800" 
            : "bg-slate-100/80 border-slate-200/30"
        }`}>
          <button
            id="toggle-mode-customer"
            onClick={() => onModeChange("customer")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
              mode === "customer"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Store className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Storefront</span>
          </button>
          
          <button
            id="toggle-mode-admin"
            onClick={() => onModeChange("admin")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-sans font-semibold transition-all ${
              mode === "admin"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "text-slate-400 hover:text-slate-700"
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Admin Console</span>
          </button>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-4">
          {mode === "customer" ? (
            <button
              id="header-cart-btn"
              onClick={onOpenCart}
              className="relative p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-slate-700 group-hover:text-slate-900" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 text-slate-950 text-[10px] font-mono font-bold rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartCount}
                </span>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5 text-xs text-amber-400 font-mono font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              SECURE SESSION
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
