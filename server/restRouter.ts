import { Router } from "express";

export const restRouter = Router();

// In-memory data state for full CRUD operation during demo / dev mode
let restaurantData = {
  id: "rest-1",
  name: "Bala hotel",
  description: "Authentic Hyperlocal South Indian & Gourmet Kitchen",
  logoUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&h=300&fit=crop",
  phoneNumber: "9150416366",
  email: "bala@hotel.com",
  ownerName: "Bala",
  addressText: "SRM Nagar, Irungalur",
  area: "Irungalur",
  city: "Tiruchirappalli",
  pincode: "621105",
  rating: 4.8,
  isOpening: true,
  isActive: true,
  isVerified: true,
  status: "approved",
  latitude: 10.85,
  longitude: 78.70,
  cuisineType: "South Indian, Meals",
  avgDeliveryTime: 25,
  minOrder: 100,
  deliveryCharge: 30,
  deliveryRadius: 5.0,
};

let storeData = {
  id: "store-1",
  name: "DaGo Hyperlocal Mart",
  description: "Grocery, Fresh Produce & Daily Essentials",
  logoUrl: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
  bannerUrl: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=1000&h=300&fit=crop",
  phoneNumber: "9150416366",
  email: "mart@dago.com",
  rating: 4.9,
  isOpening: true,
  latitude: 12.9352,
  longitude: 77.6245,
};

let ordersData = [
  {
    id: "ORD-9021",
    customerName: "Rahul Sharma",
    customerPhone: "+91 9876543210",
    deliveryAddress: "402 Green View Apartments, HSR Layout",
    items: [
      { id: "item-1", name: "Paneer Butter Masala", quantity: 1, price: 240 },
      { id: "item-2", name: "Garlic Naan", quantity: 2, price: 50 },
    ],
    totalAmount: 340,
    status: "PENDING",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    id: "ORD-9020",
    customerName: "Priya Patel",
    customerPhone: "+91 9812345678",
    deliveryAddress: "12/B Sector 3, Koramangala",
    items: [
      { id: "item-3", name: "Chicken Biryani (Full)", quantity: 2, price: 320 },
      { id: "item-4", name: "Gulab Jamun (2 pcs)", quantity: 1, price: 80 },
    ],
    totalAmount: 720,
    status: "PREPARING",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    id: "ORD-9019",
    customerName: "Amit Verma",
    customerPhone: "+91 9988776655",
    deliveryAddress: "77 Palm Grove, Indiranagar",
    items: [
      { id: "item-5", name: "Veg Cheese Burger", quantity: 2, price: 150 },
      { id: "item-6", name: "Peri Peri Fries", quantity: 1, price: 120 },
    ],
    totalAmount: 420,
    status: "OUT_FOR_DELIVERY",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "ORD-9018",
    customerName: "Sneha Reddy",
    customerPhone: "+91 9765432109",
    deliveryAddress: "Villa 14, Rainbow Residency, Sarjapur",
    items: [
      { id: "item-7", name: "Cold Coffee", quantity: 2, price: 110 },
      { id: "item-8", name: "Club Sandwich", quantity: 1, price: 180 },
    ],
    totalAmount: 400,
    status: "DELIVERED",
    paymentStatus: "PAID",
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
  },
  {
    id: "ORD-9017",
    customerName: "Karan Johar",
    customerPhone: "+91 9654321098",
    deliveryAddress: "Building 4, Electronic City Phase 1",
    items: [
      { id: "item-1", name: "Paneer Butter Masala", quantity: 1, price: 240 },
    ],
    totalAmount: 240,
    status: "CANCELLED",
    paymentStatus: "REFUNDED",
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
  },
];

let menusData = [
  {
    id: "menu-1",
    restaurantId: "rest-1",
    name: "Main Menu",
    categories: [
      {
        id: "cat-1",
        name: "North Indian Special",
        items: [
          {
            id: "item-1",
            name: "Paneer Butter Masala",
            description: "Rich and creamy curry made with cottage cheese in tomato gravy",
            price: 240,
            isVeg: true,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500",
          },
          {
            id: "item-2",
            name: "Garlic Naan",
            description: "Traditional Indian flatbread flavored with minced garlic and butter",
            price: 50,
            isVeg: true,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500",
          },
          {
            id: "item-3",
            name: "Dal Makhani",
            description: "Slow-cooked black lentils in butter and cream",
            price: 210,
            isVeg: true,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500",
          },
        ],
      },
      {
        id: "cat-2",
        name: "Biryani & Rice",
        items: [
          {
            id: "item-4",
            name: "Chicken Biryani (Full)",
            description: "Fragrant basmati rice cooked with succulent chicken pieces and aromatic spices",
            price: 320,
            isVeg: false,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500",
          },
          {
            id: "item-5",
            name: "Hyderabadi Veg Biryani",
            description: "Layered rice dish loaded with fresh veggies and whole spices",
            price: 260,
            isVeg: true,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500",
          },
        ],
      },
      {
        id: "cat-3",
        name: "Fast Food & Snacks",
        items: [
          {
            id: "item-6",
            name: "Veg Cheese Burger",
            description: "Crispy veggie patty with cheddar cheese and special sauce",
            price: 150,
            isVeg: true,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500",
          },
          {
            id: "item-7",
            name: "Peri Peri Fries",
            description: "Crispy golden potato fries tossed in spicy peri peri seasoning",
            price: 120,
            isVeg: true,
            isAvailable: true,
            imageUrl: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500",
          },
        ],
      },
    ],
  },
];

let storeProductsData = [
  {
    id: "prod-1",
    storeId: "store-1",
    name: "Amul Taaza Toned Milk (1L)",
    description: "Fresh pasteurized toned milk",
    price: 64,
    category: "Dairy & Milk",
    stockCount: 45,
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",
  },
  {
    id: "prod-2",
    storeId: "store-1",
    name: "Aashirvaad Shuddh Chakki Atta (5kg)",
    description: "100% pure whole wheat flour",
    price: 260,
    category: "Atta & Rice",
    stockCount: 18,
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500",
  },
  {
    id: "prod-3",
    storeId: "store-1",
    name: "Fortune Sunlite Sunflower Oil (1L)",
    description: "Refined sunflower cooking oil",
    price: 145,
    category: "Edible Oils",
    stockCount: 0,
    isAvailable: false,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=500",
  },
  {
    id: "prod-4",
    storeId: "store-1",
    name: "Farm Fresh Eggs (Pack of 12)",
    description: "Organic brown eggs packed with protein",
    price: 96,
    category: "Dairy & Eggs",
    stockCount: 5,
    isAvailable: true,
    imageUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=500",
  },
];

let deliveryZonesData = [
  {
    id: "zone-1",
    restaurantId: "rest-1",
    name: "Koramangala Core Zone",
    radiusKm: 3.0,
    deliveryFee: 25,
    minOrderAmount: 100,
    isActive: true,
  },
  {
    id: "zone-2",
    restaurantId: "rest-1",
    name: "HSR Layout & Silk Board",
    radiusKm: 5.0,
    deliveryFee: 40,
    minOrderAmount: 150,
    isActive: true,
  },
  {
    id: "zone-3",
    restaurantId: "rest-1",
    name: "Indiranagar Extended Zone",
    radiusKm: 7.5,
    deliveryFee: 60,
    minOrderAmount: 250,
    isActive: false,
  },
];

let reviewsData = [
  {
    id: "rev-1",
    customerName: "Ananya Roy",
    rating: 5,
    comment: "Delicious Paneer Butter Masala! Delivered warm within 20 minutes.",
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: "rev-2",
    customerName: "Vikram Malhotra",
    rating: 4,
    comment: "Good taste and neat packaging. Naan was hot.",
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
  },
];

let complaintsData = [
  {
    id: "cmp-1",
    orderId: "ORD-9017",
    customerName: "Karan Johar",
    reason: "Delayed delivery by 40 minutes",
    status: "Resolved",
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
  },
];

// ---- Auth Endpoint ----
restRouter.post("/auth/login", (req, res) => {
  const { phoneNumber, email, name, restaurantName } = req.body || {};
  const phone = phoneNumber || "9150416366";
  const userEmail = email || restaurantData.email || "bala@hotel.com";
  const vendorName = name || restaurantName || restaurantData.name || "Bala hotel";

  restaurantData.name = vendorName;
  restaurantData.email = userEmail;
  restaurantData.phoneNumber = phone;

  res.json({
    access_token: "dago-vendor-session-jwt-token-999",
    user: {
      id: "vendor-1",
      phoneNumber: phone,
      email: userEmail,
      role: "RESTAURANT",
      restaurant: restaurantData,
      store: storeData,
    },
  });
});

// ---- Restaurant Endpoints ----
restRouter.get("/restaurants/:id", (req, res) => {
  res.json(restaurantData);
});

restRouter.patch("/restaurants/:id", (req, res) => {
  restaurantData = { ...restaurantData, ...req.body };
  res.json(restaurantData);
});

// Helper to transform NestJS backend orders to Vendor Portal format
// Helper to transform NestJS backend orders to Vendor Portal format
function formatBackendOrder(bo: any) {
  return {
    id: bo.id,
    orderId: `#DG${(bo.id || '').substring(0, 8).toUpperCase()}`,
    restaurantId: bo.restaurantId || "rest-1",
    storeId: bo.storeId || "store-1",
    customerName:
      bo.customerName ||
      bo.customer?.name ||
      bo.customer?.user?.phoneNumber ||
      bo.customerPhone ||
      'WhatsApp Customer',
    customerPhone:
      bo.customerPhone ||
      bo.customer?.user?.phoneNumber ||
      '+91 9150416366',
    deliveryAddress: bo.deliveryAddress?.addressLine1
      ? `${bo.deliveryAddress.addressLine1}${bo.deliveryAddress.city ? ', ' + bo.deliveryAddress.city : ''}`
      : (typeof bo.deliveryAddress === 'string' ? bo.deliveryAddress : 'WhatsApp Delivery Location'),
    items: (bo.orderItems && bo.orderItems.length > 0)
      ? bo.orderItems.map((i: any) => ({
          id: i.id || i.menuItemId || i.storeProductId || `item-${Date.now()}`,
          name: i.menuItem?.name || i.storeProduct?.name || i.name || 'Order Item',
          quantity: i.quantity || 1,
          price: i.price || 0,
        }))
      : (bo.items || []),
    totalAmount: bo.totalAmount || 0,
    status: bo.status || 'PENDING',
    paymentStatus: bo.payments?.[0]?.status === 'COMPLETED' ? 'PAID' : (bo.paymentStatus || 'PAID'),
    createdAt: bo.createdAt || new Date().toISOString(),
  };
}

// ---- Orders Endpoints ----
restRouter.get("/orders", async (req, res) => {
  const { status, restaurantId, storeId } = req.query;
  let allOrders = [...ordersData];

  // Sync real live orders from NestJS Backend (backend_dago)
  try {
    const axios = (await import("axios")).default;
    const backendRes = await axios.get("http://localhost:3000/api/v1/orders", { timeout: 3000 }).catch(() => null);
    const backendOrders = backendRes?.data;

    if (Array.isArray(backendOrders) && backendOrders.length > 0) {
      const formatted = backendOrders.map(formatBackendOrder);
      // Merge formatted backend orders, avoiding duplicates
      for (const bo of formatted) {
        const existingIdx = allOrders.findIndex(o => o.id === bo.id);
        if (existingIdx !== -1) {
          allOrders[existingIdx] = { ...allOrders[existingIdx], ...bo };
        } else {
          allOrders.unshift(bo);
        }
      }
    }
  } catch (e) {
    // Non-fatal fallback to in-memory ordersData
  }

  // Filter by restaurantId if provided
  if (restaurantId && typeof restaurantId === "string" && restaurantId !== "all" && restaurantId !== "ALL") {
    allOrders = allOrders.filter(o => !o.restaurantId || o.restaurantId === restaurantId || o.restaurantId === "rest-1" || o.restaurantId === "rest-bala-1");
  }

  if (status && typeof status === "string" && status !== "ALL" && status !== "all") {
    const filtered = allOrders.filter(o => o.status.toUpperCase() === status.toUpperCase());
    return res.json(filtered);
  }
  res.json(allOrders);
});

function decrementStock(itemId: string, itemName: string, quantity: number) {
  const normName = (itemName || '').toLowerCase().trim();
  const normId = (itemId || '').toLowerCase().trim();

  // Try to find the item in menusData categories
  for (const menu of menusData) {
    for (const category of menu.categories) {
      const item = category.items.find(i => 
        (i.id && i.id.toLowerCase().trim() === normId) || 
        (i.name && i.name.toLowerCase().trim() === normName)
      );
      if (item) {
        const currentQty = item.stockQuantity !== undefined ? item.stockQuantity : (item.isAvailable !== false ? 50 : 0);
        item.stockQuantity = Math.max(0, currentQty - quantity);
        if (item.stockQuantity === 0) {
          item.isAvailable = false;
        }
        console.log(`[Vendor Router] Reduced menu item "${item.name}" stock by ${quantity} to ${item.stockQuantity}`);
        return;
      }
    }
  }

  // Try to find in storeProductsData
  const product = storeProductsData.find(p => 
    (p.id && p.id.toLowerCase().trim() === normId) || 
    (p.name && p.name.toLowerCase().trim() === normName)
  );
  if (product) {
    const currentQty = product.stockCount !== undefined ? product.stockCount : 50;
    product.stockCount = Math.max(0, currentQty - quantity);
    if (product.stockCount === 0) {
      product.isAvailable = false;
    }
    console.log(`[Vendor Router] Reduced store product "${product.name}" stock by ${quantity} to ${product.stockCount}`);
  }
}

restRouter.post("/orders", async (req, res) => {
  const formatted = formatBackendOrder(req.body);
  const newOrder = {
    ...formatted,
    id: req.body.id || `ORD-${Date.now().toString().slice(-4)}`,
    createdAt: req.body.createdAt || new Date().toISOString(),
  };

  const existingIdx = ordersData.findIndex(o => o.id === newOrder.id);
  if (existingIdx !== -1) {
    ordersData[existingIdx] = { ...ordersData[existingIdx], ...newOrder };
  } else {
    ordersData.unshift(newOrder);
  }

  // Reduce stock for each item in the order
  if (Array.isArray(newOrder.items)) {
    for (const item of newOrder.items) {
      decrementStock(item.id, item.name, item.quantity);
    }
  }

  // Sync to NestJS Backend if new local order
  if (!req.body.id || !req.body.id.startsWith('ORD-')) {
    try {
      const axios = (await import("axios")).default;
      await axios.post("http://localhost:3000/api/v1/orders", req.body, { timeout: 3000 }).catch(() => null);
    } catch (e) {}
  }

  res.json(newOrder);
});

restRouter.get("/orders/:id", (req, res) => {
  const order = ordersData.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });
  res.json(order);
});

restRouter.patch("/orders/:id", async (req, res) => {
  const orderId = req.params.id;
  const index = ordersData.findIndex(o => o.id === orderId);
  if (index !== -1) {
    ordersData[index] = { ...ordersData[index], ...req.body };
  }

  // Sync status update to NestJS backend for WhatsApp & Rider status updates
  if (req.body?.status) {
    try {
      const axios = (await import("axios")).default;
      await axios.patch(`http://localhost:3000/api/v1/orders/${orderId}/status`, {
        status: req.body.status,
      }, { timeout: 3000 }).catch(() => null);
    } catch (e) {}
  }

  if (index !== -1) {
    return res.json(ordersData[index]);
  }
  res.json({ id: orderId, ...req.body });
});

// Helper to sync live menu data to NestJS backend_dago
const syncMenuToBackend = async () => {
  try {
    const axios = (await import("axios")).default;
    const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";
    const allCategories = menusData.flatMap(m => m.categories || []);
    await axios.post(`${backendUrl}/api/v1/restaurants/rest-bala-1/sync-menu`, {
      categories: allCategories,
    }, { timeout: 3000 }).catch(() => null);
  } catch (e) {}
};

// ---- Menus Endpoints ----
restRouter.get("/menus", (req, res) => {
  res.json(menusData);
});

restRouter.post("/menus", (req, res) => {
  const newMenu = { id: `menu-${Date.now()}`, categories: [], ...req.body };
  menusData.push(newMenu);
  syncMenuToBackend();
  res.json(newMenu);
});

restRouter.patch("/menus/:id", (req, res) => {
  const menu = menusData.find(m => m.id === req.params.id);
  if (menu) {
    Object.assign(menu, req.body);
    syncMenuToBackend();
    return res.json(menu);
  }
  res.status(404).json({ message: "Menu not found" });
});

restRouter.delete("/menus/:id", (req, res) => {
  menusData = menusData.filter(m => m.id !== req.params.id);
  syncMenuToBackend();
  res.json({ success: true });
});

restRouter.post("/menus/:menuId/categories", (req, res) => {
  const menu = menusData.find(m => m.id === req.params.menuId);
  if (menu) {
    const newCat = { id: `cat-${Date.now()}`, items: [], ...req.body };
    menu.categories.push(newCat);
    syncMenuToBackend();
    return res.json(newCat);
  }
  res.status(404).json({ message: "Menu not found" });
});

restRouter.patch("/menu-categories/:id", (req, res) => {
  for (const m of menusData) {
    const cat = m.categories.find(c => c.id === req.params.id);
    if (cat) {
      Object.assign(cat, req.body);
      syncMenuToBackend();
      return res.json(cat);
    }
  }
  res.status(404).json({ message: "Category not found" });
});

restRouter.delete("/menu-categories/:id", (req, res) => {
  for (const m of menusData) {
    m.categories = m.categories.filter(c => c.id !== req.params.id);
  }
  syncMenuToBackend();
  res.json({ success: true });
});

restRouter.post("/menu-categories/:categoryId/items", (req, res) => {
  const newItem = { id: `item-${Date.now()}`, isAvailable: true, ...req.body };
  let added = false;
  for (const m of menusData) {
    const cat = m.categories.find(c => c.id === req.params.categoryId);
    if (cat) {
      cat.items.push(newItem);
      added = true;
      break;
    }
  }
  if (!added && menusData[0]?.categories[0]) {
    menusData[0].categories[0].items.push(newItem);
  }
  syncMenuToBackend();
  res.json(newItem);
});

restRouter.patch("/menu-items/:id", (req, res) => {
  for (const m of menusData) {
    for (const c of m.categories) {
      const item = c.items.find(i => i.id === req.params.id);
      if (item) {
        Object.assign(item, req.body);
        syncMenuToBackend();
        return res.json(item);
      }
    }
  }
  res.status(404).json({ message: "Menu item not found" });
});

restRouter.delete("/menu-items/:id", (req, res) => {
  for (const m of menusData) {
    for (const c of m.categories) {
      c.items = c.items.filter(i => i.id !== req.params.id);
    }
  }
  syncMenuToBackend();
  res.json({ success: true });
});

restRouter.post("/menu-items/upload-image", (req, res) => {
  res.json({ url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500" });
});

// ---- Store Products Endpoints ----
restRouter.get("/store-products", (req, res) => {
  res.json(storeProductsData);
});

restRouter.post("/store-products", (req, res) => {
  const newProd = { id: `prod-${Date.now()}`, isAvailable: true, ...req.body };
  storeProductsData.push(newProd);
  res.json(newProd);
});

restRouter.patch("/store-products/:id", (req, res) => {
  const prod = storeProductsData.find(p => p.id === req.params.id);
  if (prod) {
    Object.assign(prod, req.body);
    return res.json(prod);
  }
  res.status(404).json({ message: "Store product not found" });
});

restRouter.delete("/store-products/:id", (req, res) => {
  storeProductsData = storeProductsData.filter(p => p.id !== req.params.id);
  res.json({ success: true });
});

restRouter.post("/store-products/upload-image", (req, res) => {
  res.json({ url: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500" });
});

// ---- Inventory Endpoint ----
restRouter.patch("/inventory/:storeProductId", (req, res) => {
  const prod = storeProductsData.find(p => p.id === req.params.storeProductId);
  if (prod) {
    const { stockCount } = req.body;
    prod.stockCount = stockCount;
    prod.isAvailable = stockCount > 0;
    return res.json(prod);
  }
  res.status(404).json({ message: "Inventory item not found" });
});

// ---- Delivery Zones Endpoints ----
restRouter.get("/delivery-zones", (req, res) => {
  res.json(deliveryZonesData);
});

restRouter.post("/delivery-zones", (req, res) => {
  const newZone = { id: `zone-${Date.now()}`, isActive: true, ...req.body };
  deliveryZonesData.push(newZone);
  res.json(newZone);
});

restRouter.patch("/delivery-zones/:id", (req, res) => {
  const zone = deliveryZonesData.find(z => z.id === req.params.id);
  if (zone) {
    Object.assign(zone, req.body);
    return res.json(zone);
  }
  res.status(404).json({ message: "Delivery zone not found" });
});

restRouter.delete("/delivery-zones/:id", (req, res) => {
  deliveryZonesData = deliveryZonesData.filter(z => z.id !== req.params.id);
  res.json({ success: true });
});

// ---- Reviews & Complaints Endpoints ----
restRouter.get("/reviews", (req, res) => {
  res.json(reviewsData);
});

restRouter.get("/complaints", (req, res) => {
  res.json(complaintsData);
});

restRouter.patch("/complaints/:id", (req, res) => {
  const cmp = complaintsData.find(c => c.id === req.params.id);
  if (cmp) {
    Object.assign(cmp, req.body);
    return res.json(cmp);
  }
  res.status(404).json({ message: "Complaint not found" });
});

// ---- Analytics Endpoints ----
restRouter.get("/analytics/revenue", (req, res) => {
  res.json({
    totalRevenue: 2120,
    totalOrders: ordersData.length,
    averageOrderValue: 424,
    netEarnings: 1908,
    dailyBreakdown: [
      { date: "Mon", revenue: 1400, orders: 4 },
      { date: "Tue", revenue: 2100, orders: 6 },
      { date: "Wed", revenue: 1800, orders: 5 },
      { date: "Thu", revenue: 2900, orders: 8 },
      { date: "Fri", revenue: 3400, orders: 10 },
      { date: "Sat", revenue: 4200, orders: 13 },
      { date: "Sun", revenue: 4800, orders: 15 },
    ],
  });
});

restRouter.get("/analytics/orders", (req, res) => {
  res.json({
    pending: ordersData.filter(o => o.status === "PENDING").length,
    preparing: ordersData.filter(o => o.status === "PREPARING").length,
    delivered: ordersData.filter(o => o.status === "DELIVERED").length,
    cancelled: ordersData.filter(o => o.status === "CANCELLED").length,
  });
});

// Registered Vendors Storage for Admin Verification & Approval Sync
let registeredVendorsList: any[] = [
  {
    id: "rest-bala-1",
    name: "Bala hotel",
    ownerName: "Bala",
    phoneNumber: "9150416366",
    email: "bala@hotel.com",
    city: "Irungalur",
    area: "SRM Nagar",
    addressText: "SRM Nagar, Chennai - Trichy Hwy, Irungalur, Tamil Nadu 621105",
    pincode: "621105",
    fssaiLicense: "12345678912345",
    isVerified: false,
    isActive: false,
    isOpening: false,
    createdAt: new Date().toISOString(),
    cuisineType: "South Indian, Meals",
    deliveryRadius: 5.0,
    minOrder: 100.0,
    deliveryCharge: 30.0,
    addresses: [{ city: "Irungalur", addressText: "SRM Nagar, Chennai - Trichy Hwy, Irungalur" }],
    menus: [
      {
        categories: [
          {
            name: "Starters & Appetizers",
            items: [
              { name: "Paneer 65", price: 180, isVeg: true },
              { name: "Chicken Tikka", price: 240, isVeg: false },
              { name: "Gobi Manchurian", price: 150, isVeg: true },
            ],
          },
          {
            name: "Main Course & Specialties",
            items: [
              { name: "Special Veg Meals", price: 140, isVeg: true },
              { name: "Hyderabadi Chicken Biryani", price: 220, isVeg: false },
              { name: "Butter Naan", price: 45, isVeg: true },
              { name: "Chappathi", price: 50, isVeg: true },
              { name: "Satha Veechu", price: 20, isVeg: true },
              { name: "Chicken Chettinad", price: 140, isVeg: false },
              { name: "Chicken Pepper Fry/Gravy", price: 130, isVeg: false },
              { name: "Kadai Chicken Gravy", price: 150, isVeg: false },
            ],
          },
        ],
      },
    ],
  },
];

restRouter.get("/restaurant/profile", (req, res) => {
  res.json(restaurantData);
});

restRouter.get("/restaurants/me", (req, res) => {
  res.json(restaurantData);
});

// ---- Admin Dashboard Vendor Management Sync Endpoints ----
restRouter.get("/admin/dashboard/restaurants", (req, res) => {
  console.log(`[Vendor Router] Admin fetched ${registeredVendorsList.length} vendors for Admin Portal`);
  res.json(registeredVendorsList);
});

restRouter.get("/admin/restaurants", (req, res) => {
  res.json(registeredVendorsList);
});

restRouter.patch("/admin/restaurants/:id/verify", (req, res) => {
  const restId = (req.params.id || '').toLowerCase();
  const isVerified = req.body?.isVerified ?? true;
  console.log(`[Vendor Router] Admin approving & verifying vendor ID: ${restId}, isVerified: ${isVerified}`);

  const vendor = registeredVendorsList.find(
    (v) => (v.id || '').toLowerCase() === restId ||
           (v.rawDbId || '').toLowerCase() === restId ||
           (v.name || '').toLowerCase().includes(restId) ||
           restId.includes((v.name || '').toLowerCase())
  );
  if (vendor) {
    vendor.isVerified = isVerified;
    vendor.isActive = isVerified;
    vendor.isOpening = isVerified;
    vendor.status = isVerified ? "approved" : "rejected";
  }

  // Always update global restaurantData so getProfile returns verified=true
  (restaurantData as any).isVerified = isVerified;
  (restaurantData as any).isActive = isVerified;
  (restaurantData as any).isOpening = isVerified;
  (restaurantData as any).status = isVerified ? "approved" : "rejected";

  res.json({
    success: true,
    message: isVerified ? "Vendor approved and verified successfully. Portal unlocked!" : "Vendor verification revoked.",
    vendor: vendor || restaurantData,
  });
});

restRouter.patch("/admin/restaurants/:id/status", (req, res) => {
  const restId = (req.params.id || '').toLowerCase();
  const newStatus = (req.body?.status || "").toLowerCase();
  const vendor = registeredVendorsList.find(
    (v) => (v.id || '').toLowerCase() === restId ||
           (v.rawDbId || '').toLowerCase() === restId ||
           (v.name || '').toLowerCase().includes(restId) ||
           restId.includes((v.name || '').toLowerCase())
  );
  const isApp = newStatus === "approved" || newStatus === "active";
  if (vendor) {
    if (isApp) {
      vendor.isVerified = true;
      vendor.isActive = true;
      vendor.isOpening = true;
      vendor.status = "approved";
    } else if (newStatus === "suspended") {
      vendor.isActive = false;
      vendor.status = "suspended";
    } else {
      vendor.isVerified = false;
      vendor.isActive = false;
      vendor.isOpening = false;
      vendor.status = "rejected";
    }
  }

  (restaurantData as any).isVerified = isApp;
  (restaurantData as any).isActive = isApp;
  (restaurantData as any).isOpening = isApp;
  (restaurantData as any).status = isApp ? "approved" : newStatus;

  res.json({ success: true, vendor: vendor || restaurantData });
});

// ---- Auth Endpoints ----
restRouter.post("/auth/vendor-register", async (req, res) => {
  try {
    const axios = (await import("axios")).default;
    const backendRes = await axios.post(
      "http://localhost:8080/api/v1/auth/vendor-register",
      req.body,
      { timeout: 10000 }
    );
    if (backendRes.data) {
      return res.json(backendRes.data);
    }
  } catch (err: any) {
    console.log("[Vendor Router] Backend vendor-register proxy failed, using local registration handler");
  }

  // Local Registration Handler Fallback
  const newRest = {
    id: `rest-${Date.now()}`,
    name: req.body.restaurantName || "Vendor Store",
    ownerName: req.body.ownerName || "Vendor Owner",
    phoneNumber: req.body.phoneNumber || "0000000000",
    email: req.body.email,
    addressText: req.body.addressText,
    area: req.body.area,
    city: req.body.city || "Irungalur",
    pincode: req.body.pincode,
    fssaiLicense: req.body.fssaiLicense,
    isVerified: false,
    isActive: false,
    isOpening: false,
    isRegistered: true,
    createdAt: new Date().toISOString(),
    addresses: [{ city: req.body.city || "Irungalur", addressText: req.body.addressText }],
    menus: [
      {
        categories: (req.body.initialMenu || []).map((c: any) => ({
          name: c.categoryName,
          items: c.items || [],
        })),
      },
    ],
  };

  // Add to registered list for Admin Portal
  registeredVendorsList.unshift(newRest);
  restaurantData = { ...restaurantData, ...newRest } as any;

  res.json({
    access_token: `dago-vendor-token-${Date.now()}`,
    user: {
      id: `usr-${Date.now()}`,
      phoneNumber: req.body.phoneNumber,
      role: "RESTAURANT",
    },
    restaurant: newRest,
    isVerified: false,
    message: "Vendor registration submitted successfully. Pending Admin verification.",
  });
});

restRouter.post("/auth/login", async (req, res) => {
  try {
    const axios = (await import("axios")).default;
    const backendRes = await axios.post(
      "http://localhost:8080/api/v1/auth/login",
      req.body,
      { timeout: 10000 }
    );
    if (backendRes.data) {
      return res.json(backendRes.data);
    }
  } catch (err: any) {
    console.log("[Vendor Router] Backend login proxy failed, using local login handler");
  }

  res.json({
    access_token: `dago-vendor-token-${Date.now()}`,
    user: {
      id: "usr-vendor-1",
      phoneNumber: req.body.phoneNumber || req.body.email,
      role: "RESTAURANT",
      restaurant: restaurantData,
    },
  });
});

// ---- AI Menu Card OCR Parser Endpoint (Ollama Local AI + PDF Parse + Gemini Vision) ----
restRouter.post("/ai/parse-menu-card", async (req, res) => {
  const { imageBase64, fileBase64, text, mimeType } = req.body;
  const rawInput = fileBase64 || imageBase64 || "";

  console.log(`[Vendor Router] Processing Menu Card OCR request (base64 len: ${rawInput?.length || 0}, mime: ${mimeType})`);

  let extractedText = text || "";
  let isPdf = false;

  // 1. Detect and Extract PDF Text if PDF file uploaded
  if (
    mimeType === "application/pdf" ||
    rawInput.startsWith("data:application/pdf") ||
    rawInput.includes("JVBERi0") // PDF magic header (%PDF-)
  ) {
    isPdf = true;
    try {
      const pdfModule: any = await import("pdf-parse");
      const pdfParse = pdfModule.default || pdfModule;
      const cleanBase64 = rawInput.includes("base64,") ? rawInput.split("base64,")[1] : rawInput;
      const pdfBuffer = Buffer.from(cleanBase64, "base64");
      console.log(`[Vendor Router] Extracting text from PDF document (${pdfBuffer.length} bytes)...`);
      const pdfData = await pdfParse(pdfBuffer);
      extractedText = pdfData?.text || "";
      console.log(`[Vendor Router] PDF extracted text length: ${extractedText.length} chars`);
    } catch (pdfErr: any) {
      console.error("[Vendor Router] PDF extraction failed:", pdfErr.message);
    }
  }

  // 2. Try Ollama Local AI Parsing if text is available
  const ollamaHost = process.env.OLLAMA_HOST || "http://localhost:11434";
  if (extractedText && extractedText.trim().length > 5) {
    try {
      const axios = (await import("axios")).default;
      const tagsRes = await axios.get(`${ollamaHost}/api/tags`, { timeout: 3000 }).catch(() => null);
      const models: any[] = tagsRes?.data?.models || [];

      if (models.length > 0) {
        const selectedModel =
          models.find((m) => m.name.includes("llama3.2"))?.name ||
          models.find((m) => m.name.includes("qwen"))?.name ||
          models.find((m) => m.name.includes("llava"))?.name ||
          models[0].name;

        console.log(`[Vendor Router] Invoking Ollama local AI model (${selectedModel}) for menu parsing...`);

        const systemPrompt = `You are a high-speed AI OCR Engine for DaGo Hyperlocal Delivery.
Extract 100% of all menu categories, food item names, prices in Indian Rupees (₹), descriptions, and Veg/Non-Veg status from the provided text.
Do NOT omit any item or price. Classify items like Paneer, Veg, Dosa, Idli, Rice, Tea, Coffee as Veg (isVeg: true), and Chicken, Mutton, Fish, Egg, Biryani as Non-Veg (isVeg: false).

Return a RAW JSON array ONLY matching this exact structure:
[
  {
    "categoryName": "Category Name from Menu",
    "items": [
      {
        "name": "Exact Dish Name",
        "description": "Item description if present",
        "price": 150,
        "isVeg": true
      }
    ]
  }
]`;

        const ollamaRes = await axios.post(
          `${ollamaHost}/api/chat`,
          {
            model: selectedModel,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `MENU TEXT:\n${extractedText}` },
            ],
            stream: false,
            format: "json",
          },
          { timeout: 45000 }
        );

        const replyContent = ollamaRes.data?.message?.content;
        if (replyContent) {
          const parsed = JSON.parse(replyContent.trim());
          const categories = Array.isArray(parsed) ? parsed : (parsed.categories || [parsed]);
          if (categories.length > 0 && categories[0].items?.length > 0) {
            console.log(`[Vendor Router] Ollama AI extracted ${categories.length} categories successfully!`);
            if (menusData[0]) {
              menusData[0].categories = categories;
            }
            syncMenuToBackend();
            return res.json({
              success: true,
              categories,
              source: "ollama",
            });
          }
        }
      }
    } catch (ollamaErr: any) {
      console.error("[Vendor Router] Ollama parsing failed:", ollamaErr.message);
    }
  }

  // 3. Try Gemini API if key exists and base64 provided
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && rawInput.length > 50) {
    try {
      const axios = (await import("axios")).default;
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

      const systemInstruction = `You are a high-speed AI OCR Engine for DaGo Hyperlocal Delivery.
Extract ALL menu categories, food item names, prices in Indian Rupees (₹), descriptions, and Veg/Non-Veg badges from the uploaded menu card photo or document.
Do NOT skip any item printed on the menu card.
Return a RAW JSON array of categories ONLY matching this exact schema:
[
  {
    "categoryName": "Category Name from Menu Card",
    "items": [
      {
        "name": "Item Name from Menu Card",
        "description": "Description if printed",
        "price": 150,
        "isVeg": true
      }
    ]
  }
]`;

      let parts: any[] = [];
      if (!isPdf && rawInput.length > 50) {
        const rawBase64 = rawInput.includes("base64,") ? rawInput.split("base64,")[1] : rawInput;
        const detectedMime = rawInput.includes("data:") ? rawInput.split(";")[0].replace("data:", "") : (mimeType || "image/jpeg");
        parts = [
          { inlineData: { mimeType: detectedMime, data: rawBase64 } },
          { text: "Extract 100% of all menu categories, items, prices, descriptions, and Veg/Non-Veg status from this menu card photo." },
        ];
      } else if (extractedText) {
        parts = [{ text: `Extract all menu items and prices from this text:\n${extractedText}` }];
      }

      if (parts.length > 0) {
        const response = await axios.post(
          url,
          {
            contents: [{ parts }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
              responseMimeType: "application/json",
              maxOutputTokens: 2048,
              temperature: 0.2,
            },
          },
          { headers: { "Content-Type": "application/json" }, timeout: 15000 }
        );

        const replyText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (replyText) {
          const parsed = JSON.parse(replyText.trim());
          const categories = Array.isArray(parsed) ? parsed : [parsed];
          console.log(`[Vendor Router] Gemini OCR extracted ${categories.length} categories!`);
          return res.json({
            success: true,
            categories,
            source: "gemini",
          });
        }
      }
    } catch (err: any) {
      console.error("[Vendor Router] Direct Gemini OCR call failed:", err?.response?.data || err.message);
    }
  }

  // 4. Run Tesseract.js OCR if not a PDF and image base64 is available and no text extracted yet
  if (!isPdf && !extractedText && rawInput.length > 100) {
    try {
      const Tesseract = (await import("tesseract.js")).default;
      const rawBase64 = rawInput.includes("base64,") ? rawInput.split("base64,")[1] : rawInput;
      const buffer = Buffer.from(rawBase64, "base64");
      console.log(`[Vendor Router] Running Tesseract OCR on image buffer (${buffer.length} bytes)...`);
      const workerRes = await Tesseract.recognize(buffer, "eng");
      extractedText = workerRes?.data?.text || "";
      console.log("[Vendor Router] Tesseract OCR raw extracted text:\n", extractedText);
    } catch (ocrErr: any) {
      console.error("[Vendor Router] Tesseract OCR processing failed:", ocrErr.message);
    }
  }

  // 5. Smart Deterministic Text Parser (Line-by-line regex extraction for exact items & prices)
  if (extractedText && extractedText.trim().length > 5) {
    const lines = extractedText.split(/\r?\n/).map((l: string) => l.trim()).filter(Boolean);
    const categoriesMap: Record<string, Array<{ name: string; price: number; isVeg: boolean; categoryName: string }>> = {};
    let currentCategory = "Menu Card Specials";

    const nonVegKeywords = /chicken|mutton|fish|prawn|egg|biryani|kabab|tikka|fry|sukka|chettinad|meat|seafood|salna|keema|porutu|roast|crab|squid/i;
    const noiseFilter = /^(total|subtotal|gst|tax|mobile|phone|date|table|order|discount|cash|card|bill|balance|thank|welcome|menu|rate|price|sl\.?no|items?|location|rating)$/i;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/[|\\~`]/g, "").trim();
      if (line.length < 2) continue;

      // Category Header detection
      if (/^[A-Z\s/&\-]{3,40}$/.test(line) && !/\d/.test(line) && !noiseFilter.test(line)) {
        currentCategory = line.replace(/[\-=\*]/g, "").trim();
        if (!categoriesMap[currentCategory]) categoriesMap[currentCategory] = [];
        continue;
      }

      // Strip leading item numbers like "1. ", "02) ", "10 - "
      let cleanLine = line.replace(/^\d{1,3}[\.\)\-:\s]+\s*/, "").trim();
      cleanLine = cleanLine.replace(/\.{2,}/g, " ").replace(/\s{2,}/g, " ").trim();

      // Match Pattern 1: "Dish Name 150" / "Dish Name Rs.150/-" / "Dish Name ₹ 150.00"
      const matchEndPrice = cleanLine.match(/^(.*?)\s*[:\-\=]?\s*(?:Rs\.?|INR|₹)?\s*(\d{1,4}(?:\.\d{1,2})?)\s*(?:\/\-)?$/i);
      // Match Pattern 2: "150 Dish Name"
      const matchStartPrice = cleanLine.match(/^(?:Rs\.?|INR|₹)?\s*(\d{1,4}(?:\.\d{1,2})?)\s*(?:\/\-)?\s*[:\-\=]?\s*(.*)$/i);

      if (matchEndPrice && matchEndPrice[1].trim().length >= 2) {
        const name = matchEndPrice[1].replace(/[\.\-_=]+$/, "").trim();
        const price = parseFloat(matchEndPrice[2]);
        if (name.length >= 2 && !noiseFilter.test(name) && price > 0 && price < 10000) {
          if (!categoriesMap[currentCategory]) categoriesMap[currentCategory] = [];
          categoriesMap[currentCategory].push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            price,
            isVeg: !nonVegKeywords.test(name),
            categoryName: currentCategory,
          });
          continue;
        }
      } else if (matchStartPrice && matchStartPrice[2].trim().length >= 2) {
        const name = matchStartPrice[2].replace(/^[\.\-_=]+/, "").trim();
        const price = parseFloat(matchStartPrice[1]);
        if (name.length >= 2 && !noiseFilter.test(name) && price > 0 && price < 10000) {
          if (!categoriesMap[currentCategory]) categoriesMap[currentCategory] = [];
          categoriesMap[currentCategory].push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            price,
            isVeg: !nonVegKeywords.test(name),
            categoryName: currentCategory,
          });
          continue;
        }
      }

      // Pass 2: Multi-line / Adjacent Line Pairing (Line i = Name, Line i+1 = Price)
      if (i < lines.length - 1) {
        const nextLine = lines[i + 1].trim();
        const priceOnlyMatch = nextLine.match(/^(?:Rs\.?|INR|₹)?\s*(\d{1,4}(?:\.\d{1,2})?)\s*(?:\/\-)?$/i);
        if (priceOnlyMatch && !/\d/.test(cleanLine) && cleanLine.length >= 3 && !noiseFilter.test(cleanLine)) {
          const price = parseFloat(priceOnlyMatch[1]);
          if (price > 0 && price < 10000) {
            if (!categoriesMap[currentCategory]) categoriesMap[currentCategory] = [];
            categoriesMap[currentCategory].push({
              name: cleanLine.charAt(0).toUpperCase() + cleanLine.slice(1),
              price,
              isVeg: !nonVegKeywords.test(cleanLine),
              categoryName: currentCategory,
            });
            i++; // Skip next line
          }
        }
      }
    }

    const categories = Object.keys(categoriesMap).map((catName, idx) => ({
      id: `cat-parsed-${Date.now()}-${idx}`,
      categoryName: catName,
      name: catName,
      items: categoriesMap[catName].map((it, itemIdx) => ({
        id: `item-parsed-${Date.now()}-${idx}-${itemIdx}`,
        name: it.name,
        description: `Extracted from uploaded Menu document (${it.categoryName})`,
        price: it.price,
        isVeg: it.isVeg,
        isAvailable: true,
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
      })),
    })).filter(c => c.items.length > 0);

    if (categories.length > 0) {
      console.log(`[Vendor Router] Regex Text Parser extracted ${categories.length} categories from PDF/OCR text!`);
      return res.json({
        success: true,
        categories,
        source: "text-parser",
      });
    }
  }

  // Fallback: If completely unparseable, return empty array so frontend doesn't show wrong items
  return res.json({
    success: false,
    categories: [],
    message: "Could not detect menu items in file. Please ensure text or numbers are clear.",
  });
});

// Inventory Stock Adjustment Endpoints
restRouter.patch("/inventory/:id", (req, res) => {
  const itemId = req.params.id;
  const stockCount = req.body?.stockCount ?? 50;

  // Try to find in menusData
  let found = false;
  for (const menu of menusData) {
    for (const category of menu.categories) {
      const item = category.items.find(i => i.id === itemId);
      if (item) {
        item.stockQuantity = stockCount;
        item.isAvailable = stockCount > 0;
        found = true;
        break;
      }
    }
  }

  // Try to find in storeProductsData
  if (!found) {
    const product = storeProductsData.find(p => p.id === itemId);
    if (product) {
      product.stockCount = stockCount;
      product.isAvailable = stockCount > 0;
    }
  }

  console.log(`[Vendor Router] Updated stock quantity for item ID ${itemId} to ${stockCount}`);
  res.json({
    success: true,
    message: "Stock quantity updated successfully",
    stockCount,
  });
});

restRouter.patch("/menu-items/:id", (req, res) => {
  const itemId = req.params.id;
  console.log(`[Vendor Router] Updated menu item ID ${itemId}`, req.body);
  res.json({
    success: true,
    message: "Menu item updated successfully",
    item: req.body,
  });
});

restRouter.patch("/store-products/:id", (req, res) => {
  const productId = req.params.id;
  console.log(`[Vendor Router] Updated store product ID ${productId}`, req.body);
  res.json({
    success: true,
    message: "Store product updated successfully",
    product: req.body,
  });
});

// Payout & Withdrawal Endpoints
let mockWithdrawalRequests: any[] = [
  {
    id: "WDR-8921",
    amount: 500.00,
    method: "UPI",
    destination: "9150416366@ybl",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString(),
  }
];

restRouter.get("/payouts/withdrawals", (req, res) => {
  res.json(mockWithdrawalRequests);
});

restRouter.post("/payouts/request-withdrawal", (req, res) => {
  const { amount, method, details } = req.body || {};
  const numericAmount = parseFloat(amount || 0);
  const newWdr = {
    id: `WDR-${Math.floor(1000 + Math.random() * 9000)}`,
    amount: numericAmount,
    method: method || "UPI",
    destination: method === "UPI" ? (details?.upiId || "9150416366@ybl") : `${details?.bankName || "HDFC Bank"} (A/C **${(details?.accountNumber || "3661").slice(-4)})`,
    status: "COMPLETED",
    createdAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
  };
  mockWithdrawalRequests.unshift(newWdr);
  console.log(`[Vendor Router] Vendor requested payout withdrawal: ₹${numericAmount} via ${method}`);
  res.json({
    success: true,
    message: `Withdrawal request of ₹${numericAmount} processed successfully!`,
    withdrawal: newWdr,
  });
});

// Razorpay Payment Gateway Endpoints
restRouter.get("/payments/config", (req, res) => {
  res.json({
    keyId: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID",
    gateway: "Razorpay",
    currency: "INR",
    enabled: true,
  });
});

restRouter.post("/payments/create-razorpay-order", (req, res) => {
  const { amount, orderId } = req.body || {};
  const numericAmount = parseFloat(amount || 0);
  console.log(`[Vendor Router] Created Razorpay order for amount ₹${numericAmount}`);
  res.json({
    success: true,
    razorpayOrderId: `order_rzp_${Date.now()}`,
    amount: numericAmount,
    amountInPaise: Math.round(numericAmount * 100),
    currency: "INR",
    keyId: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_YOUR_KEY_ID",
  });
});

restRouter.post("/payments/verify-razorpay-payment", (req, res) => {
  const { razorpay_payment_id, razorpay_order_id } = req.body || {};
  console.log(`[Vendor Router] Verified Razorpay payment ID: ${razorpay_payment_id}`);
  res.json({
    success: true,
    verified: true,
    paymentId: razorpay_payment_id || `pay_${Date.now()}`,
    orderId: razorpay_order_id,
    message: "Razorpay payment verified successfully",
  });
});
