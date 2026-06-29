import React, { useState, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import Header from "./components/Header";
import Storefront from "./components/Storefront";
import AdminConsole from "./components/AdminConsole";
import AdminLock from "./components/AdminLock";
import CartDrawer, { CartItem } from "./components/CartDrawer";
import ProductModal from "./components/ProductModal";
import ToastContainer, { ToastMessage } from "./components/Toast";
import { 
  getProducts, 
  getOrders, 
  createOrder, 
  Product, 
  Order,
  StoreSettings,
  getStoreSettings,
  saveStoreSettings
} from "./firebase";

export default function App() {
  const [mode, setMode] = useState<"customer" | "admin">("customer");
  const [adminPassword, setAdminPassword] = useState(() => localStorage.getItem("admin_password") || "admin123");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    upiId: "deepakdeb1967@okaxis",
    merchantName: "BazaarCraft Store",
    upiEnabled: true
  });

  // Cart & UI drawers
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Load products and orders
  const loadData = async () => {
    setIsLoading(true);
    try {
      const prods = await getProducts();
      setProducts(prods);
      
      const ords = await getOrders();
      setOrders(ords);

      const settings = await getStoreSettings();
      setStoreSettings(settings);
    } catch (err) {
      console.error("Error loading initial data:", err);
      addToast("Failed to connect to cloud datastore", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Toast trigger helper
  const addToast = (text: string, type: ToastMessage["type"]) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        const nextQuantity = existing.quantity + quantity;
        if (nextQuantity > product.stock) {
          addToast(`Cannot add more. Only ${product.stock} items in stock.`, "error");
          return prevCart;
        }
        addToast(`Added ${quantity} more ${product.name} to basket`, "success");
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: nextQuantity } : item
        );
      }
      
      addToast(`Added ${product.name} to shopping basket`, "success");
      return [...prevCart, { product, quantity }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const nextQuantity = item.quantity + delta;
            if (nextQuantity > item.product.stock) {
              addToast(`Only ${item.product.stock} units are in stock`, "error");
              return item;
            }
            return { ...item, quantity: nextQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
    addToast("Item removed from basket", "info");
  };

  // Place order into Firestore
  const handlePlaceOrder = async (customer: { name: string; email: string; address: string; phone: string; paymentMethod: "COD" | "UPI" }) => {
    setIsSubmittingOrder(true);
    try {
      const orderItems = cart.map((item) => ({
        productId: item.product.id!,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl
      }));

      const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
      const tax = Math.round(subtotal * 0.08);
      const shipping = subtotal > 150 ? 0 : 15;
      const totalAmount = subtotal + tax + shipping;

      const orderData: Omit<Order, "id"> = {
        customerName: customer.name,
        customerEmail: customer.email,
        customerAddress: customer.address,
        customerPhone: customer.phone,
        items: orderItems,
        totalAmount,
        paymentMethod: customer.paymentMethod,
        status: "Pending"
      };

      const newId = await createOrder(orderData);
      addToast(`Order placed successfully! Transaction ID: ${newId.substring(0, 8)}`, "success");
      
      // Empty local cart
      setCart([]);
      
      // Refresh list to instantly show in Admin console or user records!
      loadData();
    } catch (err) {
      console.error(err);
      addToast("Failed to register order", "error");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div id="app-root" className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900 select-none">
      
      {/* Top Premium Navbar with mode toggler */}
      <Header
        mode={mode}
        onModeChange={(m) => {
          setMode(m);
          if (m === "customer") {
            // Auto lock when leaving admin mode for security
            setIsAdminAuthenticated(false);
          }
          addToast(`Switched to ${m === "admin" ? "Merchant Console" : "Customer Storefront"}`, "info");
        }}
        cartCount={cart.reduce((acc, c) => acc + c.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Primary Workspace Route Container */}
      <div className="flex-1">
        {mode === "customer" ? (
          <Storefront
            products={products}
            isLoading={isLoading}
            onRefresh={loadData}
            onAddToCart={(p) => handleAddToCart(p, 1)}
            onQuickView={(p) => setSelectedProduct(p)}
            orders={orders}
          />
        ) : !isAdminAuthenticated ? (
          <AdminLock
            onUnlock={() => {
              setIsAdminAuthenticated(true);
              addToast("Welcome back, Merchant!", "success");
            }}
            onBackToStorefront={() => setMode("customer")}
            savedPassword={adminPassword}
          />
        ) : (
          <AdminConsole
            products={products}
            orders={orders}
            isLoading={isLoading}
            onRefresh={loadData}
            onToast={addToast}
            adminPassword={adminPassword}
            onUpdatePassword={(newPass) => {
              setAdminPassword(newPass);
              localStorage.setItem("admin_password", newPass);
            }}
            onLockSession={() => {
              setIsAdminAuthenticated(false);
              addToast("Merchant Console locked", "info");
            }}
            storeSettings={storeSettings}
            onUpdateStoreSettings={async (newSettings) => {
              setStoreSettings(newSettings);
              await saveStoreSettings(newSettings);
            }}
          />
        )}
      </div>

      {/* Slide-over Shopping Basket Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <CartDrawer
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cart}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onPlaceOrder={handlePlaceOrder}
            isSubmittingOrder={isSubmittingOrder}
            storeSettings={storeSettings}
          />
        )}
      </AnimatePresence>

      {/* Detailed Product Modal View */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onAddToCart={handleAddToCart}
          />
        )}
      </AnimatePresence>

      {/* Floating Toast Notification Feed */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
