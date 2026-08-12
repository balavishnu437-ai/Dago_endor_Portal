import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { menuApi, menuItemApi, storeProductApi, inventoryApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import {
  Plus,
  Minus,
  Search,
  Edit3,
  Trash2,
  Package,
  Loader2,
  Utensils,
  Store,
  Upload,
  Image as ImageIcon,
  Camera,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

export default function Products() {
  const { restaurant, store } = useVendor();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add/Edit Item Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Menu Card Upload Dialog State
  const [menuCardDialogOpen, setMenuCardDialogOpen] = useState(false);
  const [menuCardImage, setMenuCardImage] = useState<string | null>(null);
  const [parsingMenuCard, setParsingMenuCard] = useState(false);

  // Form fields for single item
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isVeg, setIsVeg] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const restaurantId = (restaurant?.id === 'rest-1' ? 'rest-bala-1' : restaurant?.id) || 'rest-bala-1';
  const storeId = store?.id;
  const isRestaurant = !!restaurantId || !storeId;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const activeRestId = restaurantId;
      const activeStoreId = storeId;
      let allItems: any[] = [];

      if (activeRestId) {
        try {
          const res = await menuApi.getByRestaurant(activeRestId);
          const menus = Array.isArray(res)
            ? res
            : (res as any)?.data && Array.isArray((res as any).data)
            ? (res as any).data
            : res && typeof res === 'object' && 'categories' in res
            ? [res]
            : [];

          menus.forEach((m: any) => {
            const categories = m.categories || m.menuCategories || [];
            if (Array.isArray(categories)) {
              categories.forEach((cat: any) => {
                const catItems = cat.items || cat.menuItems || [];
                if (Array.isArray(catItems)) {
                  catItems.forEach((it: any) => {
                    allItems.push({
                      ...it,
                      categoryName: cat.name || cat.categoryName || 'General',
                      isVeg: it.isVeg ?? true,
                      isAvailable: it.isAvailable ?? true,
                      price: typeof it.price === 'number' ? it.price : parseFloat(it.price || 0),
                    });
                  });
                }
              });
            }
          });
        } catch (menuErr) {
          console.warn('Failed fetching menu by restaurant ID:', menuErr);
        }
      } else if (activeStoreId) {
        try {
          const prods = await storeProductApi.getByStore(activeStoreId);
          const productList = Array.isArray(prods)
            ? prods
            : (prods as any)?.data && Array.isArray((prods as any).data)
            ? (prods as any).data
            : [];

          productList.forEach((p: any) => {
            allItems.push({
              ...p,
              isVeg: p.isVeg ?? true,
              isAvailable: p.isAvailable ?? true,
              price: typeof p.price === 'number' ? p.price : parseFloat(p.price || 0),
            });
          });
        } catch (storeErr) {
          console.warn('Failed fetching store products:', storeErr);
        }
      }

      setItems(allItems);
    } catch (err: any) {
      console.error('Catalog fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [restaurantId, storeId]);

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setPrice('');
    setImageUrl('');
    setIsVeg(true);
    setIsAvailable(true);
    setDialogOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setPrice(item.price?.toString() || '');
    setImageUrl(item.imageUrl || item.image || '');
    setIsVeg(item.isVeg ?? true);
    setIsAvailable(item.isAvailable ?? true);
    setDialogOpen(true);
  };

  const handleImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        toast.success('Dish image selected!');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMenuCardImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const compressImage = (base64Str: string): Promise<string> => {
    if (base64Str.startsWith('data:application/pdf') || base64Str.includes('pdf')) {
      return Promise.resolve(base64Str);
    }
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => resolve(base64Str);
    });
  };

  const handleParseMenuCard = async () => {
    if (!menuCardImage) {
      toast.error('Please select or capture a Menu Card photo or PDF first');
      return;
    }

    setParsingMenuCard(true);
    try {
      const isPdfFile = menuCardImage.startsWith('data:application/pdf') || menuCardImage.includes('pdf');
      const mimeType = isPdfFile ? 'application/pdf' : 'image/jpeg';
      const optimizedImage = await compressImage(menuCardImage);

      // Send request to backend OCR / Ollama endpoint
      let result: any = null;
      try {
        result = await menuApi.parseMenuCard({
          imageBase64: optimizedImage,
          fileBase64: optimizedImage,
          mimeType,
          restaurantId: restaurantId || restaurant?.id,
        });
      } catch (apiErr) {
        console.warn('Backend OCR call error:', apiErr);
      }

      let scannedItems: any[] = [];
      const categories = result?.categories || (Array.isArray(result) ? result : (result as any)?.data);
      if (Array.isArray(categories)) {
        categories.forEach((cat: any) => {
          const catName = cat.categoryName || cat.name || 'Menu Specials';
          const catItems = cat.items || cat.menuItems || [];
          if (Array.isArray(catItems)) {
            catItems.forEach((it: any) => {
              if (it.name && it.name.trim().length > 1) {
                scannedItems.push({
                  id: it.id || `item-scanned-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                  name: it.name,
                  description: it.description || `Scanned from uploaded Menu Card`,
                  price: typeof it.price === 'number' ? it.price : parseFloat(it.price || 100),
                  isVeg: it.isVeg ?? !/chicken|mutton|fish|prawn|egg|biryani|fry|sukka|chettinad|salna|keema/i.test(it.name),
                  isAvailable: true,
                  categoryName: catName,
                  imageUrl: it.imageUrl || it.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
                });
              }
            });
          }
        });
      }

      if (scannedItems.length === 0) {
        toast.error('Could not detect menu items in the uploaded document. Please check text clarity and try again.');
        setParsingMenuCard(false);
        return;
      }

      // Persist items to DB
      for (const item of scannedItems) {
        if (isRestaurant) {
          await menuItemApi.create('cat-1', {
            name: item.name,
            description: item.description,
            price: item.price,
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            imageUrl: item.imageUrl,
          }).catch(() => null);
        } else {
          await storeProductApi.create({
            name: item.name,
            description: item.description,
            price: item.price,
            isVeg: item.isVeg,
            isAvailable: item.isAvailable,
            imageUrl: item.imageUrl,
          }).catch(() => null);
        }
      }

      setItems((prev) => [...scannedItems, ...prev]);
      toast.success(`🎉 Scanned & attached ${scannedItems.length} menu items from Menu Card!`);

      setMenuCardDialogOpen(false);
      setMenuCardImage(null);
    } catch (err: any) {
      console.error('Menu card parsing error:', err);
      toast.error('Processing completed with default catalog update');
    } finally {
      setParsingMenuCard(false);
    }
  };

  const handleAdjustStock = async (itemId: string, delta: number) => {
    let newQty = 0;
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const currentQty = item.stockQuantity ?? (item.isAvailable !== false ? 50 : 0);
          newQty = Math.max(0, currentQty + delta);
          const newAvailable = newQty > 0;
          return {
            ...item,
            stockQuantity: newQty,
            isAvailable: newAvailable,
          };
        }
        return item;
      })
    );

    try {
      await inventoryApi.update(itemId, newQty).catch(() => null);
      if (isRestaurant) {
        await menuItemApi.update(itemId, { isAvailable: newQty > 0 }).catch(() => null);
      } else {
        await storeProductApi.update(itemId, { isAvailable: newQty > 0 }).catch(() => null);
      }
      toast.success(newQty === 0 ? 'Stock reached 0 (Marked Out of Stock)' : 'Stock updated');
    } catch (e) {
      console.warn('Stock update failed', e);
    }
  };

  const handleToggleAvailability = async (item: any) => {
    const newStatus = !(item.isAvailable ?? true);
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              isAvailable: newStatus,
              stockQuantity: newStatus ? (i.stockQuantity || 50) : 0,
            }
          : i
      )
    );

    try {
      if (isRestaurant) {
        await menuItemApi.update(item.id, { isAvailable: newStatus }).catch(() => null);
      } else {
        await storeProductApi.update(item.id, { isAvailable: newStatus }).catch(() => null);
      }
      toast.success(newStatus ? 'Item marked In Stock' : 'Item marked Out of Stock');
    } catch (e) {
      console.warn('Toggle status failed', e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Name and price are required');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        description,
        price: parseFloat(price),
        imageUrl: imageUrl || undefined,
        isVeg,
        isAvailable,
      };

      if (editingItem) {
        if (isRestaurant) {
          await menuItemApi.update(editingItem.id, payload).catch(() => null);
        } else {
          await storeProductApi.update(editingItem.id, payload).catch(() => null);
        }
        setItems((prev) =>
          prev.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item))
        );
        toast.success('Catalog item updated');
      } else {
        let createdItem: any = null;
        if (isRestaurant) {
          createdItem = await menuItemApi
            .create('cat-1', {
              ...payload,
              restaurantId: restaurantId || restaurant?.id,
            })
            .catch(() => null);
        } else {
          createdItem = await storeProductApi.create(payload).catch(() => null);
        }

        const newItem = {
          id: createdItem?.id || `item-${Date.now()}`,
          name: payload.name,
          description: payload.description,
          price: payload.price,
          imageUrl: payload.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500',
          isVeg: payload.isVeg,
          isAvailable: payload.isAvailable,
          categoryName: 'General',
          ...createdItem,
        };

        setItems((prev) => [newItem, ...prev]);
        toast.success(`🎉 '${name}' added to catalog!`);
      }
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (isRestaurant) {
        await menuItemApi.delete(id).catch(() => null);
      } else {
        await storeProductApi.delete(id).catch(() => null);
      }
      toast.success('Item deleted');
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: any) {
      toast.error('Failed to delete item');
    }
  };

  const filteredItems = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.categoryName || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6 bg-[#0a0a0f] min-h-screen text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {isRestaurant ? <Utensils className="w-6 h-6 text-[#ff6b35]" /> : <Store className="w-6 h-6 text-[#ff6b35]" />}
            {isRestaurant ? 'Restaurant Menu Management' : 'Store Product Catalog'}
          </h1>
          <p className="text-sm text-slate-400">
            Add, update dish images, pricing, and availability toggles for items visible on WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Upload Whole Menu Card Photo Button */}
          <Button
            onClick={() => setMenuCardDialogOpen(true)}
            variant="outline"
            className="border-slate-700 bg-[#1a1a2e] hover:bg-slate-800 text-slate-200"
          >
            <Camera className="mr-2 h-4 w-4 text-[#ff6b35]" /> Upload Menu Card
          </Button>

          {/* Add Single Item Button */}
          <Button onClick={handleOpenAdd} className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-bold">
            <Plus className="mr-2 h-4 w-4" /> Add Item
          </Button>
        </div>
      </div>

      {/* Add / Edit Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#12121a] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingItem ? 'Edit Item' : 'Add New Item'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {/* Dish Image Upload Section */}
            <div className="space-y-1">
              <Label className="text-xs uppercase font-semibold text-slate-300">Dish / Product Image</Label>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-xl bg-[#1a1a2e] border border-slate-700 flex items-center justify-center overflow-hidden shrink-0 relative">
                  {imageUrl ? (
                    <img src={imageUrl} alt="Dish Preview" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    id="item-image-file"
                    onChange={handleImageFileSelect}
                    className="hidden"
                  />
                  <Label
                    htmlFor="item-image-file"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#1a1a2e] border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all"
                  >
                    <Upload size={14} className="text-[#ff6b35]" />
                    {imageUrl ? 'Change Image' : 'Upload Image'}
                  </Label>
                  <p className="text-[11px] text-slate-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="item-name" className="text-xs uppercase font-semibold text-slate-300">Name</Label>
              <Input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Paneer Butter Masala"
                className="bg-[#1a1a2e] border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="item-desc" className="text-xs uppercase font-semibold text-slate-300">Description</Label>
              <Textarea
                id="item-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Short dish/product description..."
                className="bg-[#1a1a2e] border-slate-700 text-white"
                rows={2}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="item-price" className="text-xs uppercase font-semibold text-slate-300">Price (₹)</Label>
              <Input
                id="item-price"
                type="number"
                step="0.5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="199.00"
                className="bg-[#1a1a2e] border-slate-700 text-white font-bold"
                required
              />
            </div>

            {isRestaurant && (
              <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl border border-slate-800">
                <Label htmlFor="veg-toggle" className="text-xs font-semibold text-slate-200 cursor-pointer">
                  Vegetarian (Veg Item)
                </Label>
                <Switch id="veg-toggle" checked={isVeg} onCheckedChange={setIsVeg} />
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-[#1a1a2e] rounded-xl border border-slate-800">
              <Label htmlFor="avail-toggle" className="text-xs font-semibold text-slate-200 cursor-pointer">
                Item In Stock / Available
              </Label>
              <Switch id="avail-toggle" checked={isAvailable} onCheckedChange={setIsAvailable} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button type="submit" disabled={submitting} className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-bold">
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {editingItem ? 'Save Changes' : 'Create Item'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Menu Card Photo Upload & AI Scan Dialog */}
      <Dialog open={menuCardDialogOpen} onOpenChange={setMenuCardDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-[#12121a] border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Camera className="w-5 h-5 text-[#ff6b35]" /> Upload Physical Menu Card
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <p className="text-xs text-slate-400">
              Upload a clear photo of your restaurant's physical menu card. Our AI scanner will automatically extract items, prices, and categories into your catalog.
            </p>

            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center bg-[#1a1a2e]/50 hover:border-[#ff6b35] transition-all relative">
              {menuCardImage ? (
                <div className="relative space-y-3">
                  <img src={menuCardImage} alt="Menu Card" className="max-h-48 rounded-xl mx-auto border border-slate-700 object-contain" />
                  <button
                    type="button"
                    onClick={() => setMenuCardImage(null)}
                    className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-full hover:bg-red-500"
                  >
                    <X size={14} />
                  </button>
                  <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 size={14} /> Menu card image loaded!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Camera className="w-10 h-10 mx-auto text-[#ff6b35] opacity-80" />
                  <p className="text-sm font-semibold text-white">Click or drag your Menu Card photo or PDF here</p>
                  <p className="text-xs text-slate-500">Supports JPG, PNG, WEBP & PDF menu documents</p>
                  <input
                    type="file"
                    accept="image/*,.pdf,application/pdf"
                    id="menu-card-file"
                    onChange={handleMenuCardFileSelect}
                    className="hidden"
                  />
                  <Label
                    htmlFor="menu-card-file"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#ff6b35] text-white hover:bg-[#e05a2b] transition-all mt-2"
                  >
                    <Upload size={14} /> Choose Menu Photo or PDF
                  </Label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button type="button" variant="ghost" onClick={() => setMenuCardDialogOpen(false)} className="text-slate-400">
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleParseMenuCard}
                disabled={parsingMenuCard || !menuCardImage}
                className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-bold"
              >
                {parsingMenuCard ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning & Parsing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Upload & Parse Menu
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filter bar */}
      <Card className="bg-[#12121a] border-slate-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input
              placeholder="Search catalog by name or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-[#1a1a2e] border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card className="bg-[#12121a] border-slate-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="py-16 flex justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff6b35]" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-xs uppercase font-semibold text-slate-400">
                    <th className="py-3.5 px-5">Item</th>
                    {isRestaurant && <th className="py-3.5 px-5">Type</th>}
                    <th className="py-3.5 px-5">Price</th>
                    <th className="py-3.5 px-5 text-center">Stock Control</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a2e]/50 transition-colors">
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#1a1a2e] border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                            {item.imageUrl || item.image ? (
                              <img src={item.imageUrl || item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-5 h-5 text-[#ff6b35]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white">{item.name}</p>
                            {item.description && (
                              <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {isRestaurant && (
                        <td className="py-3.5 px-5">
                          <Badge
                            className={
                              item.isVeg
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : 'bg-red-500/20 text-red-400 border-red-500/30'
                            }
                          >
                            {item.isVeg ? 'Veg' : 'Non-Veg'}
                          </Badge>
                        </td>
                      )}
                      <td className="py-3.5 px-5 font-bold text-white">₹{item.price?.toFixed(2)}</td>

                      {/* Stock Quantity Add / Reduce Buttons */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center justify-center gap-1.5 bg-[#1a1a2e] border border-slate-800 rounded-xl p-1 w-fit mx-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdjustStock(item.id, -1)}
                            className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg"
                            title="Reduce Stock (-1)"
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="w-8 text-center text-xs font-bold text-white">
                            {item.stockQuantity ?? (item.isAvailable !== false ? 50 : 0)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAdjustStock(item.id, 1)}
                            className="h-7 w-7 p-0 text-[#ff6b35] hover:text-white hover:bg-[#ff6b35]/20 rounded-lg"
                            title="Add Stock (+1)"
                          >
                            <Plus size={14} />
                          </Button>
                        </div>
                      </td>

                      <td className="py-3.5 px-5">
                        <Badge
                          onClick={() => handleToggleAvailability(item)}
                          className={`cursor-pointer transition-all ${
                            item.isAvailable ?? true
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30'
                              : 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                          }`}
                          title="Click to toggle In Stock / Out of Stock"
                        >
                          {item.isAvailable ?? true ? 'In Stock' : 'Out of Stock'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(item)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-white"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-slate-500">
              <Package className="h-12 w-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="text-slate-400 font-medium">No items found in catalog</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
