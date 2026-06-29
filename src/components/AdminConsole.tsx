import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Edit, 
  CheckCircle, 
  X, 
  RefreshCw, 
  ArrowRight,
  User,
  MapPin,
  Phone,
  Mail,
  Sliders,
  Sparkles,
  Search,
  Lock,
  Settings,
  Smartphone,
  QrCode
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Product, Order, saveProduct, deleteProduct, updateOrderStatus, StoreSettings } from "../firebase";

interface AdminConsoleProps {
  products: Product[];
  orders: Order[];
  isLoading: boolean;
  onRefresh: () => void;
  onToast: (text: string, type: "success" | "error" | "info") => void;
  adminPassword?: string;
  onUpdatePassword?: (newPass: string) => void;
  onLockSession?: () => void;
  storeSettings?: StoreSettings;
  onUpdateStoreSettings?: (newSettings: StoreSettings) => Promise<void>;
}

export default function AdminConsole({
  products,
  orders,
  isLoading,
  onRefresh,
  onToast,
  adminPassword = "admin123",
  onUpdatePassword,
  onLockSession,
  storeSettings = { upiId: "deepakdeb1967@okaxis", merchantName: "BazaarCraft Store", upiEnabled: true },
  onUpdateStoreSettings
}: AdminConsoleProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "products" | "orders" | "inventory" | "settings">("dashboard");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Settings Change Password Form State
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  
  // New Product Form State
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodDescription, setProdDescription] = useState("");
  const [prodCategory, setProdCategory] = useState("Tech Gear");
  const [prodImageUrl, setProdImageUrl] = useState("");
  const [prodStock, setProdStock] = useState("");
  const [prodFeatured, setProdFeatured] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Search filter for products and orders
  const [prodSearch, setProdSearch] = useState("");
  const [ordSearch, setOrdSearch] = useState("");

  // Store Settings (UPI & QR) State
  const [storeUpiId, setStoreUpiId] = useState(storeSettings.upiId);
  const [storeMerchantName, setStoreMerchantName] = useState(storeSettings.merchantName);
  const [storeUpiEnabled, setStoreUpiEnabled] = useState(storeSettings.upiEnabled);

  // Keep state in sync with loaded props
  useEffect(() => {
    setStoreUpiId(storeSettings.upiId);
    setStoreMerchantName(storeSettings.merchantName);
    setStoreUpiEnabled(storeSettings.upiEnabled);
  }, [storeSettings.upiId, storeSettings.merchantName, storeSettings.upiEnabled]);

  // ------------------------------------------------------------------------
  // CALCULATE DASHBOARD STATS
  // ------------------------------------------------------------------------
  const activeOrders = orders.filter(o => o.status !== "Delivered" && o.status !== "Cancelled");
  const totalOrdersCount = orders.length;
  
  // Total Revenue from Shipped & Delivered orders
  const totalRevenue = orders
    .filter(o => o.status === "Delivered" || o.status === "Shipped" || o.status === "Processing")
    .reduce((acc, curr) => acc + curr.totalAmount, 0);

  const lowStockProducts = products.filter(p => p.stock < 10);
  const lowStockCount = lowStockProducts.length;

  // Category distribution calculation
  const categorySales: Record<string, number> = {};
  orders.forEach(ord => {
    ord.items.forEach(it => {
      // Find matching product to get category
      const p = products.find(prod => prod.name === it.name);
      const cat = p ? p.category : "Tech Gear";
      categorySales[cat] = (categorySales[cat] || 0) + (it.price * it.quantity);
    });
  });

  const categoriesList = Object.keys(categorySales);
  const maxCategorySalesValue = Math.max(...Object.values(categorySales), 1);

  // ------------------------------------------------------------------------
  // CRUD ACTIONS
  // ------------------------------------------------------------------------
  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setProdName("");
    setProdPrice("");
    setProdDescription("");
    setProdCategory("Tech Gear");
    setProdImageUrl("");
    setProdStock("");
    setProdFeatured(false);
    setShowProductForm(true);
  };

  const handleOpenEditForm = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdPrice(prod.price.toString());
    setProdDescription(prod.description);
    setProdCategory(prod.category);
    setProdImageUrl(prod.imageUrl);
    setProdStock(prod.stock.toString());
    setProdFeatured(prod.featured);
    setShowProductForm(true);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim() || !prodPrice || !prodStock || !prodDescription.trim()) {
      onToast("Please complete all required form fields", "error");
      return;
    }

    setIsSavingProduct(true);
    try {
      // Automatic professional mock images based on category if empty
      let finalImg = prodImageUrl.trim();
      if (!finalImg) {
        if (prodCategory === "Tech Gear") {
          finalImg = "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800";
        } else if (prodCategory === "Home & Office") {
          finalImg = "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800";
        } else {
          finalImg = "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800";
        }
      }

      const pData: Product = {
        id: editingProduct ? editingProduct.id : undefined,
        name: prodName,
        price: parseFloat(prodPrice),
        description: prodDescription,
        category: prodCategory,
        imageUrl: finalImg,
        stock: parseInt(prodStock),
        featured: prodFeatured,
        rating: editingProduct ? editingProduct.rating : 4.5,
        reviewsCount: editingProduct ? editingProduct.reviewsCount : 1
      };

      await saveProduct(pData);
      onToast(editingProduct ? "Product updated successfully!" : "New product created in Firestore!", "success");
      setShowProductForm(false);
      onRefresh();
    } catch (err) {
      console.error(err);
      onToast("Error writing to database. Check security rules.", "error");
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProductAction = async (prodId: string) => {
    if (confirm("Are you sure you want to delete this product? This is permanent in Firestore.")) {
      try {
        await deleteProduct(prodId);
        onToast("Product deleted successfully", "success");
        onRefresh();
      } catch (err) {
        onToast("Error deleting item", "error");
      }
    }
  };

  const handleUpdateOrderStatusAction = async (orderId: string, status: Order["status"]) => {
    try {
      await updateOrderStatus(orderId, status);
      onToast(`Order marked as ${status}`, "success");
      onRefresh();
    } catch (err) {
      onToast("Error updating order status", "error");
    }
  };

  return (
    <div id="admin-view" className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)] bg-slate-950 text-slate-100">
      
      {/* Sidebar Command Rail */}
      <aside id="admin-sidebar" className="w-full lg:w-64 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-6 shrink-0 flex flex-col justify-between">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">Merchant Panel</span>
            <button 
              id="admin-sync-btn"
              onClick={onRefresh}
              className="p-1 hover:bg-slate-800 rounded text-amber-500 transition-colors"
              title="Refresh Firestore Workspace"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <nav id="admin-navigation-menu" className="space-y-1.5">
            <button
              id="admin-nav-dashboard"
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              <span>Dashboard Overview</span>
            </button>

            <button
              id="admin-nav-products"
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                activeTab === "products"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Package className="w-4 h-4 shrink-0" />
              <span>Manage Products</span>
            </button>

            <button
              id="admin-nav-orders"
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                activeTab === "orders"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Live Orders Tracker</span>
              {activeOrders.length > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeOrders.length}
                </span>
              )}
            </button>

            <button
              id="admin-nav-inventory"
              onClick={() => setActiveTab("inventory")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                activeTab === "inventory"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Inventory Restock</span>
              {lowStockCount > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/35 text-[10px] font-mono font-bold flex items-center justify-center">
                  {lowStockCount}
                </span>
              )}
            </button>

            <button
              id="admin-nav-settings"
              onClick={() => setActiveTab("settings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-sans font-medium transition-all ${
                activeTab === "settings"
                  ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/10"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/40"
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Console Settings</span>
            </button>
          </nav>
        </div>

        {/* Console stats indicator footer */}
        <div className="pt-6 border-t border-slate-800/60 space-y-4">
          {onLockSession && (
            <button
              id="admin-sidebar-lock-btn"
              onClick={onLockSession}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-rose-950/40 hover:text-rose-400 text-slate-300 text-xs font-sans font-semibold rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              Lock Session
            </button>
          )}
          <div className="hidden lg:block text-slate-500 space-y-2">
            <div className="flex justify-between text-[10px] font-mono">
              <span>FIRESTORE STATUS</span>
              <span className="text-emerald-400">● SYNCED</span>
            </div>
            <p className="text-[10px] leading-relaxed font-sans">
              BazaarCraft Cloud database runs behind direct read-write security rules.
            </p>
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-6 sm:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* TAB: DASHBOARD OVERVIEW */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dash"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">Business Intel</h2>
                  <p className="text-slate-400 text-sm mt-1">Real-time telemetry and order statistics fetched from Cloud Firestore.</p>
                </div>
                <div className="text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                  TOTAL VALUE STREAM: <span className="text-amber-400 font-bold font-mono">${totalRevenue}</span>
                </div>
              </div>

              {/* Statistics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Total Revenue</span>
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">${totalRevenue}</span>
                    <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-0.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +12.4%
                    </span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">EXCLUDES PENDING & CANCELLED TRANSACTIONS</div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Total Orders</span>
                    <ShoppingBag className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold font-mono text-white">{totalOrdersCount}</span>
                    <span className="text-xs text-slate-400 font-sans">recorded</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">
                    {activeOrders.length} ORDERS CURRENTLY REQUIRING SHIPPING
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Critical Inventory</span>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold font-mono ${lowStockCount > 0 ? "text-amber-500 animate-pulse" : "text-white"}`}>
                      {lowStockCount}
                    </span>
                    <span className="text-xs text-slate-400 font-sans">items understocked</span>
                  </div>
                  <div className="text-[10px] font-mono text-slate-500">THRESHOLD IS SET AT LESS THAN 10 UNITS</div>
                </div>
              </div>

              {/* Graphical Analysis Widget */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Sales Growth By Category */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                    <Layers className="w-4 h-4 text-slate-500" />
                    Revenue distribution by Category
                  </h3>
                  {categoriesList.length === 0 ? (
                    <div className="h-44 flex flex-col items-center justify-center text-center text-slate-500">
                      <p className="text-xs font-mono">No category sales calculated yet.</p>
                      <p className="text-[10px] text-slate-600 mt-1">Change incoming pending orders status to 'Processing' or 'Shipped'.</p>
                    </div>
                  ) : (
                    <div className="space-y-4 h-44 flex flex-col justify-center">
                      {categoriesList.map((cat) => {
                        const val = categorySales[cat] || 0;
                        const percentage = Math.round((val / maxCategorySalesValue) * 100);
                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-sans">
                              <span className="text-slate-300 font-medium">{cat}</span>
                              <span className="text-slate-400 font-mono font-semibold">${val}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-amber-500 to-amber-600 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Live Activity Feed */}
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-slate-500" />
                    Latest System Logs
                  </h3>
                  <div className="space-y-3.5 max-h-[176px] overflow-y-auto">
                    {orders.slice(0, 4).map((o, index) => (
                      <div key={index} className="flex gap-3 text-xs leading-relaxed border-b border-slate-800/40 pb-3 last:border-0 last:pb-0">
                        <span className="text-[10px] font-mono text-amber-500">[{o.status.toUpperCase()}]</span>
                        <div className="flex-1">
                          <p className="text-slate-300 font-sans font-medium">{o.customerName} placed order ID: {o.id?.substring(0, 8)}</p>
                          <span className="text-[9px] font-mono text-slate-500">For {o.items.length} items • Paid ${o.totalAmount}</span>
                        </div>
                      </div>
                    ))}
                    {orders.length === 0 && (
                      <div className="py-12 text-center text-slate-600 text-xs font-sans">
                        No transactions registered yet. System idle.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: PRODUCTS MANAGEMENT */}
          {activeTab === "products" && (
            <motion.div
              key="prods"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Products Catalog</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Edit, delete, and restock products in real-time Firestore database.</p>
                </div>
                
                <button
                  id="add-new-product-btn"
                  onClick={handleOpenAddForm}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-sans font-semibold rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-amber-500/10"
                >
                  <Plus className="w-4 h-4" />
                  Create Product
                </button>
              </div>

              {/* Table search filter */}
              <div className="relative max-w-sm">
                <input
                  id="admin-product-search-input"
                  type="text"
                  placeholder="Filter products..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              </div>

              {/* Products Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        <th className="py-4 px-6">Item</th>
                        <th className="py-4 px-6">Category</th>
                        <th className="py-4 px-6">Price</th>
                        <th className="py-4 px-6">Stock level</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products
                        .filter(p => p.name.toLowerCase().includes(prodSearch.toLowerCase()))
                        .map((p) => {
                          const isLow = p.stock < 10;
                          return (
                            <tr key={p.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-all">
                              <td className="py-4 px-6 flex items-center gap-4">
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="w-10 h-10 object-cover rounded-lg bg-slate-800"
                                />
                                <div>
                                  <span className="font-medium text-slate-200 block text-xs sm:text-sm">{p.name}</span>
                                  {p.featured && (
                                    <span className="inline-block text-[9px] font-mono bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-bold mt-1">
                                      Curated
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="py-4 px-6 text-xs text-slate-400 font-medium">
                                {p.category}
                              </td>
                              <td className="py-4 px-6 text-xs font-mono font-semibold text-slate-300">
                                ${p.price}
                              </td>
                              <td className="py-4 px-6">
                                <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md ${
                                  isLow ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-slate-800 text-slate-300"
                                }`}>
                                  {p.stock} units
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2.5">
                                  <button
                                    id={`edit-prod-btn-${p.id}`}
                                    onClick={() => handleOpenEditForm(p)}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    id={`delete-prod-btn-${p.id}`}
                                    onClick={() => handleDeleteProductAction(p.id!)}
                                    className="p-1.5 bg-slate-800 hover:bg-rose-950/40 text-rose-400 hover:text-rose-500 rounded-lg transition-all"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-500 text-xs">
                            No products loaded in database catalog. Click 'Create Product' to add one.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: LIVE ORDERS TRACKING */}
          {activeTab === "orders" && (
            <motion.div
              key="ords"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Active Transactions</h2>
                <p className="text-slate-400 text-xs mt-0.5 font-sans">Monitor incoming orders and transition shipping statuses.</p>
              </div>

              {/* Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm font-sans border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                        <th className="py-4 px-6">Customer</th>
                        <th className="py-4 px-6">Items Purchased</th>
                        <th className="py-4 px-6">Value</th>
                        <th className="py-4 px-6">Status Indicator</th>
                        <th className="py-4 px-6 text-right">Fulfillment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((ord) => (
                        <tr key={ord.id} className="border-b border-slate-800/40 hover:bg-slate-800/20 transition-all">
                          <td className="py-4 px-6 space-y-1">
                            <span className="font-semibold text-slate-200 block text-xs sm:text-sm">{ord.customerName}</span>
                            <div className="flex flex-col gap-1 text-[10px] font-mono text-slate-500 leading-none">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-600" /> {ord.customerEmail}</span>
                              <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-600" /> {ord.customerAddress}</span>
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-600" /> {ord.customerPhone}</span>
                              <span className="flex items-center gap-1 pt-0.5">
                                <span className="text-slate-500 font-sans text-[9px] uppercase tracking-wider">Method:</span>
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-sans font-bold uppercase tracking-wide ${
                                  ord.paymentMethod === "UPI" ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25" : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                                }`}>
                                  {ord.paymentMethod || "COD"}
                                </span>
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              {ord.items.map((item, idx) => (
                                <div key={idx} className="text-xs text-slate-400 truncate max-w-[200px]">
                                  {item.name} <span className="text-amber-500 font-mono">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-slate-300 text-xs sm:text-sm">
                            ${ord.totalAmount}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full font-bold inline-block border ${
                              ord.status === "Delivered" ? "bg-emerald-950/40 text-emerald-400 border-emerald-900" :
                              ord.status === "Shipped" ? "bg-indigo-950/40 text-indigo-400 border-indigo-900" :
                              ord.status === "Processing" ? "bg-blue-950/40 text-blue-400 border-blue-900" :
                              ord.status === "Cancelled" ? "bg-rose-950/40 text-rose-400 border-rose-900" :
                              "bg-amber-950/40 text-amber-400 border-amber-900"
                            }`}>
                              {ord.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <select
                              id={`update-status-select-${ord.id}`}
                              value={ord.status}
                              onChange={(e) => handleUpdateOrderStatusAction(ord.id!, e.target.value as any)}
                              className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-sans cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
                            >
                              <option value="Pending">Pending</option>
                              <option value="Processing">Processing</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-slate-500 text-xs">
                            No customer transactions registered. Go to storefront and place orders!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: INVENTORY RESTOCK */}
          {activeTab === "inventory" && (
            <motion.div
              key="inv"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Stock level Monitors</h2>
                <p className="text-slate-400 text-xs mt-0.5">Quickly restock inventory and monitor depletion meters.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map((p) => {
                  const isLow = p.stock < 10;
                  const percentage = Math.min(100, (p.stock / 50) * 100);
                  return (
                    <div key={p.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="w-10 h-10 object-cover rounded-lg bg-slate-800 shrink-0"
                          />
                          <div className="truncate">
                            <span className="font-semibold text-slate-200 block text-xs sm:text-sm truncate">{p.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">{p.category}</span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-slate-500">STOCK HEALTH</span>
                            <span className={isLow ? "text-amber-400 font-semibold" : "text-slate-400"}>{p.stock} units</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${isLow ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        id={`quick-restock-${p.id}`}
                        onClick={async () => {
                          const restockAmount = 25;
                          const updated: Product = { ...p, stock: p.stock + restockAmount };
                          await saveProduct(updated);
                          onToast(`Restocked ${p.name} with +${restockAmount} items`, "success");
                          onRefresh();
                        }}
                        className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-semibold rounded-xl shrink-0 transition-colors"
                      >
                        +25 Restock
                      </button>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB: CONSOLE SETTINGS */}
          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-xl"
            >
              <div>
                <h2 className="text-2xl font-sans font-bold text-white tracking-tight">Console Settings</h2>
                <p className="text-slate-400 text-xs mt-0.5">Manage security passcodes and preferences for the Merchant Console.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Lock className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-semibold text-white">Change Admin Passcode</h3>
                    <p className="text-slate-500 text-[11px]">Set a strong custom passcode to restrict unauthorized panel access.</p>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentPass !== adminPassword) {
                      onToast("Current Password galat hai!", "error");
                      return;
                    }
                    if (newPass.length < 4) {
                      onToast("New passcode kam se kam 4 characters ka hona chahiye!", "error");
                      return;
                    }
                    if (newPass !== confirmPass) {
                      onToast("Passwords match nahi ho rahe hain!", "error");
                      return;
                    }

                    if (onUpdatePassword) {
                      onUpdatePassword(newPass);
                      onToast("Admin passcode successfully change ho gaya!", "success");
                      setCurrentPass("");
                      setNewPass("");
                      setConfirmPass("");
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Current Passcode
                    </label>
                    <input
                      id="current-password-input"
                      type="password"
                      required
                      placeholder="Enter current passcode"
                      value={currentPass}
                      onChange={(e) => setCurrentPass(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        New Passcode
                      </label>
                      <input
                        id="new-password-input"
                        type="password"
                        required
                        placeholder="Min 4 characters"
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Confirm New Passcode
                      </label>
                      <input
                        id="confirm-password-input"
                        type="password"
                        required
                        placeholder="Re-enter new passcode"
                        value={confirmPass}
                        onChange={(e) => setConfirmPass(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                      />
                    </div>
                  </div>

                  <button
                    id="save-password-btn"
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-sans font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Security Code
                  </button>
                </form>
              </div>

               <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                  <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                    <Smartphone className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-semibold text-white">UPI QR Code & Merchant Payments</h3>
                    <p className="text-slate-500 text-[11px]">Configure your UPI ID so customers can pay directly into your account.</p>
                  </div>
                </div>

                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!storeUpiId.trim()) {
                      onToast("UPI ID likhna zaroori hai!", "error");
                      return;
                    }
                    if (!storeMerchantName.trim()) {
                      onToast("Merchant Name likhna zaroori hai!", "error");
                      return;
                    }

                    if (onUpdateStoreSettings) {
                      await onUpdateStoreSettings({
                        upiId: storeUpiId.trim(),
                        merchantName: storeMerchantName.trim(),
                        upiEnabled: storeUpiEnabled
                      });
                      onToast("UPI settings successfully save ho gayi hain!", "success");
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Your UPI ID (Scanner Target)
                      </label>
                      <input
                        id="store-upi-id-input"
                        type="text"
                        required
                        placeholder="e.g. yourname@okaxis"
                        value={storeUpiId}
                        onChange={(e) => setStoreUpiId(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                        Merchant Display Name
                      </label>
                      <input
                        id="store-merchant-name-input"
                        type="text"
                        required
                        placeholder="e.g. BazaarCraft Shop"
                        value={storeMerchantName}
                        onChange={(e) => setStoreMerchantName(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500/20 transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 py-1">
                    <input
                      id="store-upi-enabled-checkbox"
                      type="checkbox"
                      checked={storeUpiEnabled}
                      onChange={(e) => setStoreUpiEnabled(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-800 text-amber-500 focus:ring-amber-500/20 bg-slate-950/50 cursor-pointer"
                    />
                    <label htmlFor="store-upi-enabled-checkbox" className="text-xs text-slate-300 select-none cursor-pointer">
                      Enable UPI / Instant Pay option for customers at checkout
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
                    <div className="p-2 bg-white rounded-lg shrink-0">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                          `upi://pay?pa=${storeUpiId || "placeholder@upi"}&pn=${encodeURIComponent(
                            storeMerchantName || "Store"
                          )}&am=100&cu=INR`
                        )}`}
                        alt="Scanner Preview"
                        className="w-20 h-20 object-contain"
                      />
                    </div>
                    <div className="space-y-1 text-slate-400 text-xs">
                      <span className="font-mono text-[9px] uppercase text-amber-500 tracking-wider block font-bold">Live Scanner Preview</span>
                      <p>This is a simulated preview of the QR code your customers will scan. It points to <code className="text-amber-400 font-mono">{storeUpiId || "your-upi-id"}</code>.</p>
                    </div>
                  </div>

                  <button
                    id="save-upi-settings-btn"
                    type="submit"
                    className="w-full sm:w-auto px-5 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-sans font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Save Merchant QR Details
                  </button>
                </form>
              </div>

              {/* Security info card */}
              <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-5 text-slate-400 text-xs leading-relaxed space-y-1">
                <span className="font-mono text-[9px] uppercase text-amber-500/80 tracking-widest block font-bold">Security Advisory</span>
                <p>
                  BazaarCraft's admin security passcode is safely stored in your browser's private storage (localStorage). Nobody else can guess or retrieve it unless they have physical access to your device. Keep your passcode secure!
                </p>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Slide-over Product Editor Drawer Modal */}
      <AnimatePresence>
        {showProductForm && (
          <div id="product-form-backdrop" className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
            <div className="absolute inset-0 -z-10" onClick={() => setShowProductForm(false)} />
            <motion.div
              id="product-form-container"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl relative text-slate-100"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="font-sans font-semibold text-lg text-white">
                    {editingProduct ? "Edit Product Settings" : "Draft New Product"}
                  </h2>
                </div>
                <button
                  id="product-form-close"
                  onClick={() => setShowProductForm(false)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSaveProductSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Product Title *
                  </label>
                  <input
                    id="product-form-name"
                    type="text"
                    required
                    placeholder="e.g., Titanium Fountain Stylus"
                    value={prodName}
                    onChange={(e) => setProdName(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                      Retail Price ($) *
                    </label>
                    <input
                      id="product-form-price"
                      type="number"
                      required
                      min="1"
                      placeholder="99"
                      value={prodPrice}
                      onChange={(e) => setProdPrice(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                      Inventory Count *
                    </label>
                    <input
                      id="product-form-stock"
                      type="number"
                      required
                      min="0"
                      placeholder="15"
                      value={prodStock}
                      onChange={(e) => setProdStock(e.target.value)}
                      className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Category Menu *
                  </label>
                  <select
                    id="product-form-category"
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white transition-all cursor-pointer"
                  >
                    <option value="Tech Gear">Tech Gear</option>
                    <option value="Home & Office">Home & Office</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Cover Image URL (optional)
                  </label>
                  <input
                    id="product-form-image"
                    type="url"
                    placeholder="https://images.unsplash.com/... (auto-filled if empty)"
                    value={prodImageUrl}
                    onChange={(e) => setProdImageUrl(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-amber-500 text-white transition-all"
                  />
                  <span className="text-[9px] font-mono text-slate-500 block mt-1 leading-normal">
                    Leave blank to automatically link a high-resolution curated image category banner.
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-semibold">
                    Product Description *
                  </label>
                  <textarea
                    id="product-form-desc"
                    required
                    placeholder="Provide a compelling detailed description of this artisan masterpiece..."
                    rows={4}
                    value={prodDescription}
                    onChange={(e) => setProdDescription(e.target.value)}
                    className="w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-white transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 py-3 border-t border-b border-slate-800/60">
                  <input
                    id="product-form-featured"
                    type="checkbox"
                    checked={prodFeatured}
                    onChange={(e) => setProdFeatured(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="product-form-featured" className="text-xs text-slate-300 font-sans font-medium cursor-pointer">
                    Feature this on Storefront (Featured Curated flag)
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  id="product-form-submit-btn"
                  type="submit"
                  disabled={isSavingProduct}
                  className="w-full py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-sans font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/10"
                >
                  {isSavingProduct ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving to Firestore...
                    </>
                  ) : (
                    <>
                      {editingProduct ? "Save Changes" : "Create Product Instance"}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Simple loader helper for async actions
function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={`${className} animate-spin`} />;
}
