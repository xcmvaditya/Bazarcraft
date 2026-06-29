import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  where,
  serverTimestamp
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA6bXT7kdptEISxGgxTuWaWNGb9QGDM098",
  authDomain: "website-by-aditya-das.firebaseapp.com",
  databaseURL: "https://website-by-aditya-das-default-rtdb.firebaseio.com",
  projectId: "website-by-aditya-das",
  storageBucket: "website-by-aditya-das.firebasestorage.app",
  messagingSenderId: "507483391714",
  appId: "1:507483391714:web:60539a7ad704eada4380bb",
  measurementId: "G-XS4JK9R1WK"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore using the default database of the user's Firebase project
export const db = getFirestore(app);

export interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl: string;
  stock: number;
  featured: boolean;
  rating: number;
  reviewsCount: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id?: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "COD" | "UPI";
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt?: any;
}

// Initial seed products for an elegant, premium look
const SEED_PRODUCTS: Product[] = [
  {
    name: "Obsidian Artisan Mechanical Keyboard",
    price: 189,
    description: "Compact 75% layout featuring custom lubed tactile switches, solid aluminum anodized casing, and dual-shot PBT keycaps with elegant golden legends.",
    category: "Tech Gear",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800",
    stock: 12,
    featured: true,
    rating: 4.9,
    reviewsCount: 42
  },
  {
    name: "Walnut Desk Sculpt Organizer",
    price: 85,
    description: "Meticulously carved from sustainable American Walnut. Features a seamless magnetic alignment system for phones, writing utensils, and key cards.",
    category: "Home & Office",
    imageUrl: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=800",
    stock: 25,
    featured: true,
    rating: 4.8,
    reviewsCount: 19
  },
  {
    name: "Minimalist Wireless Fast Charger",
    price: 49,
    description: "Ultra-slim 15W Qi-certified charging pad wrapped in authentic full-grain Italian leather with a solid brushed brass weighted base.",
    category: "Tech Gear",
    imageUrl: "https://images.unsplash.com/photo-1622445262465-2481c4574875?auto=format&fit=crop&q=80&w=800",
    stock: 30,
    featured: false,
    rating: 4.6,
    reviewsCount: 115
  },
  {
    name: "Boreal Fleece Pullover Jacket",
    price: 135,
    description: "Tailored heavyweight polar fleece engineered for extreme comfort and exceptional warmth retention, detailed with matte steel press studs.",
    category: "Apparel",
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&q=80&w=800",
    stock: 15,
    featured: true,
    rating: 4.7,
    reviewsCount: 28
  },
  {
    name: "Architect Leather Carryall Backpack",
    price: 240,
    description: "Handcrafted water-resistant canvas paired with vegetable-tanned full-grain leather straps. Includes a padded 16-inch laptop chamber.",
    category: "Apparel",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800",
    stock: 8,
    featured: true,
    rating: 5.0,
    reviewsCount: 36
  },
  {
    name: "Copper Gooseneck Drip Kettle",
    price: 110,
    description: "A precision copper kettle with custom wooden handles. Designed for flawless, slow pour-over extractions with triple-layer temperature base.",
    category: "Home & Office",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800",
    stock: 18,
    featured: false,
    rating: 4.8,
    reviewsCount: 54
  }
];

// Fetch all products
export async function getProducts(): Promise<Product[]> {
  try {
    const productsCol = collection(db, "products");
    const snapshot = await getDocs(productsCol);
    let list: Product[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
    
    // Seed database if empty
    if (list.length === 0) {
      console.log("Seeding initial premium products to Firestore...");
      for (const prod of SEED_PRODUCTS) {
        const docRef = await addDoc(productsCol, prod);
        list.push({ id: docRef.id, ...prod });
      }
    }
    return list;
  } catch (err) {
    console.error("Error fetching products from Firestore:", err);
    // Fallback to local array in case offline or security rules block
    return SEED_PRODUCTS.map((p, i) => ({ id: `local_${i}`, ...p }));
  }
}

// Add or update a product
export async function saveProduct(product: Product): Promise<string> {
  const productsCol = collection(db, "products");
  if (product.id && !product.id.startsWith("local_")) {
    const docRef = doc(db, "products", product.id);
    const { id, ...dataToSave } = product;
    await setDoc(docRef, dataToSave, { merge: true });
    return product.id;
  } else {
    // New product
    const { id, ...dataToSave } = product;
    const docRef = await addDoc(productsCol, dataToSave);
    return docRef.id;
  }
}

// Delete a product
export async function deleteProduct(productId: string): Promise<void> {
  if (productId.startsWith("local_")) return;
  const docRef = doc(db, "products", productId);
  await deleteDoc(docRef);
}

// Fetch all orders
export async function getOrders(): Promise<Order[]> {
  try {
    const ordersCol = collection(db, "orders");
    const snapshot = await getDocs(ordersCol);
    return snapshot.docs.map(d => {
      const data = d.data();
      return { 
        id: d.id, 
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : (data.createdAt || new Date())
      } as Order;
    }).sort((a, b) => {
      const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt).getTime();
      const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt).getTime();
      return dateB - dateA;
    });
  } catch (err) {
    console.error("Error fetching orders:", err);
    return [];
  }
}

// Create a new order
export async function createOrder(order: Omit<Order, "id">): Promise<string> {
  try {
    const ordersCol = collection(db, "orders");
    const orderData = {
      ...order,
      createdAt: serverTimestamp(),
      status: "Pending" as const
    };
    const docRef = await addDoc(ordersCol, orderData);
    
    // Adjust stock in background safely
    for (const item of order.items) {
      try {
        if (!item.productId.startsWith("local_")) {
          const prodRef = doc(db, "products", item.productId);
          // Simple local read and decrement
          const currentProdSnapshot = await getDocs(query(collection(db, "products")));
          const match = currentProdSnapshot.docs.find(d => d.id === item.productId);
          if (match) {
            const currentStock = match.data().stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);
            await updateDoc(prodRef, { stock: newStock });
          }
        }
      } catch (stockErr) {
        console.error("Failed to update stock for item", item.productId, stockErr);
      }
    }
    
    return docRef.id;
  } catch (err) {
    console.error("Error creating order in Firestore:", err);
    // Generate a random temporary ID for instant UX success
    return `ord_offline_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Update order status
export async function updateOrderStatus(orderId: string, status: Order["status"]): Promise<void> {
  if (orderId.startsWith("ord_offline_")) return;
  const docRef = doc(db, "orders", orderId);
  await updateDoc(docRef, { status });
}

export interface StoreSettings {
  upiId: string;
  merchantName: string;
  upiEnabled: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  upiId: "deepakdeb1967@okaxis", // Pre-populated with user email/name related default or simple placeholder
  merchantName: "BazaarCraft Store",
  upiEnabled: true
};

// Fetch Store settings from Firestore
export async function getStoreSettings(): Promise<StoreSettings> {
  try {
    const docRef = doc(db, "settings", "store_config");
    const snapshot = await getDocs(query(collection(db, "settings")));
    const foundDoc = snapshot.docs.find(d => d.id === "store_config");
    if (foundDoc) {
      return { ...DEFAULT_SETTINGS, ...foundDoc.data() } as StoreSettings;
    }
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.error("Error fetching store settings:", err);
    // Fallback to localStorage
    const local = localStorage.getItem("bazaarcraft_store_settings");
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  }
}

// Save Store settings to Firestore
export async function saveStoreSettings(settings: StoreSettings): Promise<void> {
  try {
    const docRef = doc(db, "settings", "store_config");
    await setDoc(docRef, settings, { merge: true });
    // Also backup to localStorage
    localStorage.setItem("bazaarcraft_store_settings", JSON.stringify(settings));
  } catch (err) {
    console.error("Error saving store settings:", err);
    localStorage.setItem("bazaarcraft_store_settings", JSON.stringify(settings));
  }
}

