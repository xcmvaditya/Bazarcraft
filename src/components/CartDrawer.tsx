import React, { useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, ClipboardCheck, ArrowLeft, Loader2, Sparkles, Smartphone, Banknote, Copy, Check, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, OrderItem } from "../firebase";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onPlaceOrder: (customer: { name: string; email: string; address: string; phone: string; paymentMethod: "COD" | "UPI" }) => Promise<void>;
  isSubmittingOrder: boolean;
  storeSettings?: {
    upiId: string;
    merchantName: string;
    upiEnabled: boolean;
  };
}

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onPlaceOrder,
  isSubmittingOrder,
  storeSettings = { upiId: "deepakdeb1967@okaxis", merchantName: "BazaarCraft Store", upiEnabled: true }
}: CartDrawerProps) {
  const [step, setStep] = useState<"cart" | "checkout" | "success">("cart");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [upiId, setUpiId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% simulated tax
  const shipping = subtotal > 150 ? 0 : 15; // Free shipping over $150
  const total = subtotal + tax + shipping;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "Full Name is required";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Valid Email is required";
    if (!address.trim()) newErrors.address = "Shipping Address is required";
    if (!phone.trim()) newErrors.phone = "Phone Number is required";
    if (paymentMethod === "UPI" && !upiId.trim()) {
      newErrors.upi = "UPI ID is required (e.g. name@okhdfcbank)";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onPlaceOrder({ name, email, address, phone, paymentMethod });
    setStep("success");
    // Clear form
    setName("");
    setEmail("");
    setAddress("");
    setPhone("");
    setUpiId("");
  };

  const resetAll = () => {
    setStep("cart");
    onClose();
  };

  return (
    <div id="cart-drawer-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
      {/* Click outside to close (only if not on success or submitting) */}
      <div 
        className="absolute inset-0 -z-10" 
        onClick={() => {
          if (step !== "success" && !isSubmittingOrder) onClose();
        }} 
      />

      <motion.div
        id="cart-drawer-container"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl relative"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            <h2 className="font-sans font-semibold text-slate-900 text-lg">
              {step === "cart" && "Shopping Basket"}
              {step === "checkout" && "Complete Purchase"}
              {step === "success" && "Success Placed"}
            </h2>
          </div>
          <button
            id="cart-drawer-close"
            onClick={resetAll}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Steps */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === "cart" && (
              <motion.div
                key="cart-step"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="p-6 flex flex-col h-full justify-between"
              >
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="p-4 bg-slate-50 rounded-full mb-4">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-700 font-sans font-semibold">Your basket is empty</p>
                    <p className="text-slate-400 text-xs mt-1 max-w-xs">
                      Explore our premium artisan collection and add products to start your order.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        id={`cart-item-${item.product.id}`}
                        key={item.product.id}
                        className="flex items-center gap-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          referrerPolicy="no-referrer"
                          className="w-16 h-16 object-cover rounded-xl bg-slate-100"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
                            {item.product.category}
                          </p>
                          <h4 className="font-sans font-medium text-slate-800 text-sm truncate">
                            {item.product.name}
                          </h4>
                          <span className="font-sans text-xs font-semibold text-slate-500 mt-1 block">
                            ${item.product.price} each
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <button
                            id={`cart-remove-${item.product.id}`}
                            onClick={() => onRemoveItem(item.product.id!)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center border border-slate-200 rounded-lg bg-white p-0.5">
                            <button
                              id={`cart-dec-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id!, -1)}
                              className="p-1 hover:bg-slate-50 rounded text-slate-500"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center text-xs font-mono font-bold text-slate-700">
                              {item.quantity}
                            </span>
                            <button
                              id={`cart-inc-${item.product.id}`}
                              onClick={() => onUpdateQuantity(item.product.id!, 1)}
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 hover:bg-slate-50 rounded text-slate-500 disabled:opacity-35"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {step === "checkout" && (
              <motion.form
                key="checkout-step"
                onSubmit={handleCheckoutSubmit}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="p-6 space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Basket
                  </button>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                    Secure checkout
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                      Full Name
                    </label>
                    <input
                      id="checkout-name-input"
                      type="text"
                      placeholder="Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                    {errors.name && <p className="text-rose-500 text-xs mt-1 font-mono">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                      Email Address
                    </label>
                    <input
                      id="checkout-email-input"
                      type="email"
                      placeholder="jane@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                    {errors.email && <p className="text-rose-500 text-xs mt-1 font-mono">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                      Shipping Address
                    </label>
                    <textarea
                      id="checkout-address-input"
                      placeholder="Street, City, Zip Code, Country"
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all resize-none"
                    />
                    {errors.address && <p className="text-rose-500 text-xs mt-1 font-mono">{errors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5 font-mono">
                      Phone Number
                    </label>
                    <input
                      id="checkout-phone-input"
                      type="tel"
                      placeholder="+1 (555) 019-2834"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500 focus:bg-white transition-all"
                    />
                    {errors.phone && <p className="text-rose-500 text-xs mt-1 font-mono">{errors.phone}</p>}
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2 pt-1">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 font-mono">
                      Payment Method
                    </label>
                    {storeSettings.upiEnabled ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setPaymentMethod("COD");
                            const nextErrors = { ...errors };
                            delete nextErrors.upi;
                            setErrors(nextErrors);
                          }}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${
                            paymentMethod === "COD"
                              ? "bg-amber-500/10 border-amber-500 text-slate-900 font-medium shadow-sm shadow-amber-500/5"
                              : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
                          }`}
                        >
                          <Banknote className={`w-5 h-5 mb-1 ${paymentMethod === "COD" ? "text-amber-500" : "text-slate-400"}`} />
                          <span className="text-xs font-sans font-semibold">Cash on Delivery</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setPaymentMethod("UPI")}
                          className={`flex flex-col items-center justify-center p-3.5 rounded-xl border transition-all ${
                            paymentMethod === "UPI"
                              ? "bg-amber-500/10 border-amber-500 text-slate-900 font-medium shadow-sm shadow-amber-500/5"
                              : "bg-slate-50/50 border-slate-200 text-slate-500 hover:bg-slate-100/50 hover:text-slate-800"
                          }`}
                        >
                          <Smartphone className={`w-5 h-5 mb-1 ${paymentMethod === "UPI" ? "text-amber-500" : "text-slate-400"}`} />
                          <span className="text-xs font-sans font-semibold">UPI / Instant Pay</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="w-full flex items-center justify-center gap-3 p-3.5 rounded-xl border bg-amber-500/10 border-amber-500 text-slate-900 font-medium shadow-sm shadow-amber-500/5"
                      >
                        <Banknote className="w-5 h-5 text-amber-500" />
                        <span className="text-xs font-sans font-semibold">Cash on Delivery (Only option enabled)</span>
                      </button>
                    )}
                  </div>

                  {paymentMethod === "UPI" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4"
                    >
                      {/* Dynamic Scan & Pay UPI QR Code */}
                      <div className="flex flex-col items-center justify-center text-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-sans font-semibold text-slate-800">
                          <QrCode className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>Scan QR Code to Pay Instantly</span>
                        </div>

                        {/* QR Image Container */}
                        <div className="relative p-2 bg-slate-50 border border-slate-100 rounded-xl">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                              `upi://pay?pa=${storeSettings.upiId}&pn=${encodeURIComponent(
                                storeSettings.merchantName
                              )}&am=${total}&cu=INR`
                            )}`}
                            alt="UPI QR Code"
                            referrerPolicy="no-referrer"
                            className="w-40 h-40 object-contain rounded-lg"
                          />
                          <div className="absolute inset-0 border-2 border-amber-500/10 rounded-xl pointer-events-none" />
                        </div>

                        {/* Amount and Merchant Details */}
                        <div className="space-y-1">
                          <p className="text-lg font-sans font-bold text-slate-950 tracking-tight">
                            ₹{total} <span className="text-[10px] text-slate-500 font-normal">({total} USD equivalent)</span>
                          </p>
                          <p className="text-[11px] text-slate-500 font-sans">
                            Pay to: <span className="font-semibold text-slate-700">{storeSettings.merchantName}</span>
                          </p>
                        </div>

                        {/* Copy UPI ID Button */}
                        <div className="w-full pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(storeSettings.upiId);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200/80 rounded-lg text-[11px] font-sans font-semibold flex items-center justify-center gap-1.5 transition-all"
                          >
                            {copied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 font-bold">UPI ID Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy UPI ID: <span className="font-mono text-slate-500 select-all">{storeSettings.upiId}</span></span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Customer UPI ID Input */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold">
                          Your UPI ID (For payment verification)
                        </label>
                        <input
                          id="upi-id-input"
                          type="text"
                          placeholder="e.g. yourname@paytm or 9876543210@ybl"
                          value={upiId}
                          onChange={(e) => {
                            setUpiId(e.target.value);
                            if (e.target.value.trim()) {
                              const nextErrors = { ...errors };
                              delete nextErrors.upi;
                              setErrors(nextErrors);
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-mono"
                        />
                        {errors.upi && <p className="text-rose-500 text-[10px] font-mono">{errors.upi}</p>}
                      </div>
                      
                      <div className="text-[10px] text-slate-500 leading-normal bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                        ✨ <strong>Scan with any app:</strong> Google Pay, PhonePe, Paytm, or BHIM scan karke transfer complete karein. Order instant processing me चला jayega!
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Secure Card Simulation Note */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100/50 mt-6 text-xs text-amber-800 flex items-start gap-2.5 font-sans leading-relaxed">
                  <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Simulation Sandboxed</span>
                    We use Firebase cloud datastore to process this transaction. No physical currency is exchanged.
                  </div>
                </div>
              </motion.form>
            )}

            {step === "success" && (
              <motion.div
                key="success-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 border border-emerald-100 animate-bounce">
                  <ClipboardCheck className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-sans font-bold text-slate-900 mb-2">Order Confirmed!</h3>
                <p className="text-slate-500 text-sm max-w-xs mb-8">
                  Your purchase details have been securely logged. The active merchant will process your shipment in the Admin Console shortly!
                </p>
                <button
                  id="checkout-success-close"
                  onClick={resetAll}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                >
                  Continue Browsing
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Drawer Footer (Price totals & button only visible during Cart / Checkout stages) */}
        {step !== "success" && cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/40">
            <div className="space-y-2.5 mb-6 text-sm">
              <div className="flex justify-between text-slate-500 font-sans">
                <span>Subtotal</span>
                <span className="font-mono font-semibold text-slate-700">${subtotal}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-sans">
                <span>Simulated Tax (8%)</span>
                <span className="font-mono font-semibold text-slate-700">${tax}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-sans">
                <span>Shipping</span>
                <span className="font-mono font-semibold text-slate-700">
                  {shipping === 0 ? "FREE" : `$${shipping}`}
                </span>
              </div>
              <div className="h-[1px] bg-slate-100 my-2" />
              <div className="flex justify-between font-sans text-base font-semibold text-slate-900">
                <span>Total Amount</span>
                <span className="font-mono font-bold text-slate-950">${total}</span>
              </div>
            </div>

            {step === "cart" ? (
              <button
                id="cart-drawer-checkout-btn"
                onClick={() => setStep("checkout")}
                className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10 active:scale-[0.98]"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                id="checkout-form-submit-btn"
                onClick={handleCheckoutSubmit}
                disabled={isSubmittingOrder}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-sans font-semibold rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.98] disabled:opacity-55"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving to Cloud...
                  </>
                ) : (
                  <>
                    Place Secure Order (${total})
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
