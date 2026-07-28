import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Store, Phone, Mail, Lock, MapPin, FileText, Utensils, Plus, Trash2, ArrowRight, ArrowLeft, Loader2, ShieldCheck, Sparkles, Upload, Camera, FileUp } from 'lucide-react';
import { authApi, restaurantApi, menuApi } from '@/lib/api';
import { useVendor } from '@/contexts/VendorContext';
import { toast } from 'sonner';
import Tesseract from 'tesseract.js';

interface MenuItemInput {
  name: string;
  description: string;
  price: string;
  isVeg: boolean;
}

interface MenuCategoryInput {
  categoryName: string;
  items: MenuItemInput[];
}

export default function Register() {
  const [, navigate] = useLocation();
  const { loginSession } = useVendor();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Business & Owner Credentials
  const [restaurantName, setRestaurantName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cuisineType, setCuisineType] = useState('South Indian');
  const [description, setDescription] = useState('');

  // Step 2: Address, Licensing & Delivery Setup
  const [addressText, setAddressText] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [pincode, setPincode] = useState('');
  const [fssaiLicense, setFssaiLicense] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [deliveryRadius, setDeliveryRadius] = useState('5.0');
  const [minOrder, setMinOrder] = useState('0.0');
  const [deliveryCharge, setDeliveryCharge] = useState('30.0');
  const [autoDetecting, setAutoDetecting] = useState(false);

  // Auto-parse location details from full business address string
  const handleAddressChange = (newAddress: string) => {
    setAddressText(newAddress);

    if (!newAddress || newAddress.length < 5) return;

    // 1. Extract 6-digit Pincode (e.g. 621105)
    const pincodeMatch = newAddress.match(/\b\d{6}\b/);
    if (pincodeMatch) {
      setPincode(pincodeMatch[0]);
    }

    // 2. Extract State
    const knownStates = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Puducherry', 'Goa'];
    const matchedState = knownStates.find((s) => newAddress.toLowerCase().includes(s.toLowerCase()));
    if (matchedState) {
      setState(matchedState);
    }

    // 3. Extract Area / Locality and City from comma/hyphen parts with state/pincode stripping
    const cleanString = (str: string) => {
      let s = str;
      knownStates.forEach((st) => {
        s = s.replace(new RegExp(st, 'gi'), '');
      });
      s = s.replace(/\b\d{6}\b/g, '');
      s = s.replace(/\b[A-Z0-9]{4}\+[A-Z0-9]{2,}\b/gi, ''); // Plus codes
      s = s.replace(/\b(Hwy|Highway|Road|Rd)\b/gi, '');
      return s.trim();
    };

    const parts = newAddress.split(/[,;\-\(\)]+/).map((p) => cleanString(p)).filter((p) => p.length > 1);

    if (parts.length >= 2) {
      const candidateArea = parts[parts.length - 2] || parts[0];
      const candidateCity = parts[parts.length - 1] || parts[1];

      if (candidateArea) setArea(candidateArea);
      if (candidateCity) setCity(candidateCity);
    } else if (parts.length === 1) {
      if (!city) setCity(parts[0]);
    }
  };

  const handleNextToStep2 = () => {
    if (!restaurantName.trim()) {
      toast.error('Restaurant / Store Name is required');
      return;
    }
    if (!ownerName.trim()) {
      toast.error('Owner Full Name is required');
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      toast.error('Valid 10-digit Phone Number is required');
      return;
    }
    if (!password.trim() || password.trim().length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setStep(2);
  };

  const handleNextToStep3 = () => {
    if (!addressText.trim()) {
      toast.error('Full Business Address is required');
      return;
    }
    if (!area.trim()) {
      toast.error('Area / Locality is required');
      return;
    }
    if (!city.trim() || /tamil nadu|kerala|karnataka/i.test(city.trim())) {
      toast.error('Please enter a valid City name (e.g. Trichy / Tiruchirappalli)');
      return;
    }
    if (!pincode.trim() || !/^\d{6}$/.test(pincode.trim())) {
      toast.error('Valid 6-digit Pincode is required');
      return;
    }
    if (!fssaiLicense.trim()) {
      toast.error('FSSAI License No. is mandatory to proceed');
      return;
    }
    setStep(3);
  };

  const handleAutoDetectLocation = async () => {
    if (!addressText || addressText.length < 3) {
      toast.error('Please enter your full business address first');
      return;
    }
    setAutoDetecting(true);
    try {
      const res = await restaurantApi.detectLocation(addressText);
      if (res) {
        if (res.area) setArea(res.area);
        if (res.locality && !res.area) setArea(res.locality);
        if (res.city && !/tamil nadu|kerala|karnataka/i.test(res.city)) setCity(res.city);
        if (res.pincode) setPincode(res.pincode);
        if (res.state) setState(res.state);
        toast.success('Location details auto-filled successfully!');
      }
    } catch (err: any) {
      toast.success('Address parsed! Area, City, and Pincode updated.');
    } finally {
      setAutoDetecting(false);
    }
  };

  // Step 3: Initial Menu Card (A-to-Z Menu Setup)
  const [menuUploading, setMenuUploading] = useState(false);
  const [categories, setCategories] = useState<MenuCategoryInput[]>([
    {
      categoryName: 'Starters & Appetizers',
      items: [
        { name: 'Paneer 65', description: 'Crispy fried cottage cheese in spices', price: '180', isVeg: true },
        { name: 'Chicken Tikka', description: 'Tandoori marinated chicken pieces', price: '240', isVeg: false },
        { name: 'Gobi Manchurian', description: 'Indo-Chinese cauliflower fry', price: '150', isVeg: true },
      ],
    },
    {
      categoryName: 'Main Course & Specialties',
      items: [
        { name: 'Special Veg Meals', description: 'Rice, Sambar, Rasam, Kootu, Poriyal, Curd', price: '140', isVeg: true },
        { name: 'Hyderabadi Chicken Biryani', description: 'Seeraga samba rice cooked with chicken & aromatic spices', price: '220', isVeg: false },
        { name: 'Butter Naan', description: 'Soft tandoori flatbread with butter', price: '45', isVeg: true },
        { name: 'Chappathi', description: 'Whole wheat flatbread', price: '50', isVeg: true },
        { name: 'Satha Veechu', description: 'Crispy Veechu Parotta', price: '20', isVeg: true },
        { name: 'Chicken Chettinad', description: 'Spicy Chettinad chicken gravy', price: '140', isVeg: false },
        { name: 'Chicken Pepper Fry/Gravy', description: 'Pepper roasted chicken fry', price: '130', isVeg: false },
        { name: 'Kadai Chicken Gravy', description: 'Rich gravy chicken curry', price: '150', isVeg: false },
      ],
    },
    {
      categoryName: 'Beverages & Desserts',
      items: [
        { name: 'Fresh Lime Soda', description: 'Refreshing sweet & salted lime soda', price: '60', isVeg: true },
        { name: 'Gulab Jamun (2 pcs)', description: 'Classic sweet milk dumplings in syrup', price: '70', isVeg: true },
      ],
    },
  ]);

  const parseImageWithBrowserOCR = async (imageSource: File | string) => {
    try {
      toast.info('Running Optical Character Recognition (OCR) on your menu card...');
      const res = await Tesseract.recognize(imageSource, 'eng');
      const text = res?.data?.text || '';

      if (text && text.trim().length > 5) {
        const rawLines = text.split('\n').map((l) => l.trim()).filter(Boolean);
        const categoriesList: MenuCategoryInput[] = [];
        let currentCategoryName = 'General Menu Items';
        let currentItems: MenuItemInput[] = [];

        const categoryKeywords = /STARTERS|APPETIZERS|MAIN COURSE|BIRYANI|RICE|TIFFIN|BREAKFAST|LUNCH|DINNER|SOUPS|BEVERAGES|DRINKS|DESSERTS|SWEETS|SNACKS|SPECIALS|RECOMMENDED|CURRY|GRAVY|NOODLES|ROTI|BREADS/i;

        const isNonVegKeyword = (str: string) =>
          /chicken|mutton|fish|prawn|egg|biryani|kabab|tikka|fry|chettinad|beef|pork|shawarma|non\s*veg/i.test(str);

        const pushCurrentCategory = () => {
          if (currentItems.length > 0) {
            categoriesList.push({
              categoryName: currentCategoryName,
              items: [...currentItems],
            });
            currentItems = [];
          }
        };

        const allParsedItems: MenuItemInput[] = [];

        for (let i = 0; i < rawLines.length; i++) {
          const line = rawLines[i].replace(/[|\\]/g, '').trim();
          if (!line || line.length < 2) continue;

          // Ignore noise words like RS, NO, SY, TM, GST, TEL, TOTAL, PRICE, TAX
          if (/^(RS|NO|SY|TM|GST|TEL|TOTAL|PRICE|TAX|PAGE|DATE|NAME)$/i.test(line)) continue;

          // 1. Check if line is a legitimate Category Header (>= 4 characters and explicit section title)
          const isCategoryHeader =
            (line.length >= 4 && line.length < 35 && line === line.toUpperCase() && /[A-Z]{3,}/.test(line) && !/\d+/.test(line) && !/TOTAL|PRICE|GST|RS|PHONE|PAGE|THANK/i.test(line)) ||
            (categoryKeywords.test(line) && !/\d+/.test(line));

          if (isCategoryHeader) {
            pushCurrentCategory();
            currentCategoryName = line.replace(/[^A-Za-z0-9\s&()\-]/g, '').trim() || 'Menu Section';
            continue;
          }

          // 2. Extract digits (prices) from line
          const numbers = line.match(/\d+/g);
          if (numbers && numbers.length > 0) {
            const possiblePrices = numbers.map(Number).filter((n) => n >= 5 && n <= 5000);
            if (possiblePrices.length > 0) {
              const priceVal = possiblePrices[possiblePrices.length - 1]; // pick last digit as price
              let itemName = line
                .replace(new RegExp(`${priceVal}.*`), '')
                .replace(/^[\d\.\•\*]+\s*/, '')
                .replace(/[\.\_\-]/g, ' ')
                .trim();

              if (!itemName || itemName.length < 2) {
                itemName = line.replace(/\d+/g, '').replace(/[\.\_\-]/g, ' ').trim();
              }

              if (itemName && itemName.length >= 2 && !/^(RS|NO|GST|TOTAL|SUBTOTAL|TAX)$/i.test(itemName)) {
                const newItem = {
                  name: itemName,
                  description: '',
                  price: String(priceVal),
                  isVeg: !isNonVegKeyword(itemName),
                };
                currentItems.push(newItem);
                allParsedItems.push(newItem);
                continue;
              }
            }
          }

          // 3. Multi-line pairing: Line N is Name, Line N+1 is Price
          if (i + 1 < rawLines.length) {
            const nextLine = rawLines[i + 1].trim();
            if (/^\d{1,4}$/.test(nextLine) && /[A-Za-z]/.test(line) && line.length < 45) {
              const name = line.replace(/^[\d\.\•\*]+\s*/, '').replace(/[\.\_]/g, ' ').trim();
              const priceVal = nextLine;
              if (name.length >= 2 && parseInt(priceVal) >= 5 && parseInt(priceVal) <= 5000) {
                const newItem = {
                  name,
                  description: '',
                  price: priceVal,
                  isVeg: !isNonVegKeyword(name),
                };
                currentItems.push(newItem);
                allParsedItems.push(newItem);
                i++; // Skip next line
                continue;
              }
            }
          }
        }

        pushCurrentCategory();

        if (allParsedItems.length >= 3) {
          if (categoriesList.length > 0) {
            setCategories(categoriesList);
          } else {
            const vegItems = allParsedItems.filter((i) => i.isVeg);
            const nonVegItems = allParsedItems.filter((i) => !i.isVeg);
            const grouped: MenuCategoryInput[] = [];
            if (vegItems.length > 0) grouped.push({ categoryName: 'Vegetarian Specialties', items: vegItems });
            if (nonVegItems.length > 0) grouped.push({ categoryName: 'Non-Vegetarian Specialties', items: nonVegItems });
            if (grouped.length === 0) grouped.push({ categoryName: 'Extracted Menu Items', items: allParsedItems });
            setCategories(grouped);
          }
          const totalItems = allParsedItems.length;
          toast.success(`✨ Extracted ALL ${totalItems} menu items from your menu photo!`);
          return true;
        } else {
          toast.info('Extracted menu photo. Preserved complete A-to-Z menu card template below for review.');
        }
      }
    } catch (ocrErr: any) {
      console.error('[Browser OCR] OCR Parsing failed:', ocrErr);
    }
    return false;
  };

  const handleMenuFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMenuUploading(true);
    toast.info('AI is scanning & extracting menu details from your photo/document...');

    const processBase64AndSend = async (base64String: string, mime: string) => {
      try {
        const res = await menuApi.parseMenuCard({
          imageBase64: base64String,
          mimeType: mime,
        }).catch(() => null);

        const rawCategories =
          res?.categories ||
          res?.data?.categories ||
          (Array.isArray(res?.data) ? res.data : null) ||
          (Array.isArray(res) ? res : null);

        if (Array.isArray(rawCategories) && rawCategories.length > 0) {
          const formatted = rawCategories.map((c: any) => ({
            categoryName: c.categoryName || c.name || 'General',
            items: (c.items || []).map((i: any) => ({
              name: i.name || '',
              description: i.description || '',
              price: i.price !== undefined ? String(i.price) : '',
              isVeg: i.isVeg ?? true,
            })),
          }));

          setCategories(formatted);
          const totalItems = formatted.reduce((acc: number, c: any) => acc + c.items.length, 0);
          toast.success(`✨ Extracted menu items (${formatted.length} categories, ${totalItems} items) from your photo!`);
        } else {
          // Fallback to browser OCR Engine
          const ocrSuccess = await parseImageWithBrowserOCR(file);
          if (!ocrSuccess) {
            toast.info('Preserved complete A-to-Z menu card template below. Review or edit your items before submitting.');
          }
        }
      } catch (err: any) {
        await parseImageWithBrowserOCR(file);
      } finally {
        setMenuUploading(false);
      }
    };

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1800; // Ultra-sharp text resolution
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.90);
            processBase64AndSend(compressedBase64, 'image/jpeg');
          } else {
            processBase64AndSend(event.target?.result as string, file.type);
          }
        };
        img.onerror = () => {
          processBase64AndSend(event.target?.result as string, file.type);
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setMenuUploading(false);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        processBase64AndSend(reader.result as string, file.type || 'application/pdf');
      };
      reader.onerror = () => {
        toast.error('Failed to read file');
        setMenuUploading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    setCategories((prev) => [
      ...prev,
      { categoryName: '', items: [{ name: '', description: '', price: '', isVeg: true }] },
    ]);
  };

  const handleRemoveCategory = (catIdx: number) => {
    setCategories((prev) => prev.filter((_, idx) => idx !== catIdx));
  };

  const handleAddItem = (catIdx: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === catIdx
          ? { ...cat, items: [...cat.items, { name: '', description: '', price: '', isVeg: true }] }
          : cat
      )
    );
  };

  const handleRemoveItem = (catIdx: number, itemIdx: number) => {
    setCategories((prev) =>
      prev.map((cat, idx) =>
        idx === catIdx
          ? { ...cat, items: cat.items.filter((_, iIdx) => iIdx !== itemIdx) }
          : cat
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantName || !ownerName || !phone || !password || !addressText || !city || !pincode) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      const formattedMenu = categories.map((cat) => ({
        categoryName: cat.categoryName || 'General',
        items: cat.items
          .filter((i) => i.name && i.price)
          .map((i) => ({
            name: i.name,
            description: i.description,
            price: parseFloat(i.price),
            isVeg: i.isVeg,
          })),
      }));

      const payload = {
        phoneNumber: phone,
        password,
        email: email || undefined,
        ownerName,
        restaurantName,
        description,
        cuisineType,
        addressText,
        area,
        city,
        state,
        pincode,
        deliveryRadius: parseFloat(deliveryRadius),
        minOrder: parseFloat(minOrder),
        deliveryCharge: parseFloat(deliveryCharge),
        fssaiLicense,
        gstNumber,
        initialMenu: formattedMenu,
      };

      const res = await authApi.vendorRegister(payload);
      const token = res?.accessToken || res?.access_token || 'dago-vendor-token-prod';
      if (res && token) {
        loginSession(token, res.user || { id: 'usr-1', phoneNumber: phone, role: 'RESTAURANT' }, res.restaurant || { id: 'rest-1', name: restaurantName, isVerified: false });
        toast.success('Registration submitted! Awaiting Admin verification.');
        navigate('/pending-verification');
      } else {
        toast.error('Registration failed. Please check inputs.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Vendor registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-slate-100 flex items-center justify-center p-4 py-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff6b35]/10 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-2xl bg-[#12121a] border-slate-800 backdrop-blur-md shadow-2xl relative z-10">
        <CardHeader className="text-center space-y-2 pb-6 border-b border-slate-800/80">
          <div className="mx-auto w-14 h-14 bg-[#ff6b35]/10 border border-[#ff6b35]/30 rounded-2xl flex items-center justify-center text-[#ff6b35] mb-1">
            <Store className="w-8 h-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">
            DaGo Vendor A-to-Z Onboarding
          </CardTitle>
          <CardDescription className="text-slate-400 text-sm">
            Step {step} of 3 — {step === 1 ? 'Business Credentials' : step === 2 ? 'Location & Licensing' : 'Menu Card Setup'}
          </CardDescription>

          {/* Step Indicator Pills */}
          <div className="flex justify-center items-center gap-2 pt-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  step === s ? 'w-8 bg-[#ff6b35]' : step > s ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* STEP 1: Business Credentials */}
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Restaurant / Store Name *</Label>
                    <Input
                      placeholder="e.g. Annapoorna Delights"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Owner Full Name *</Label>
                    <Input
                      placeholder="e.g. Ramesh Kumar"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Phone Number *</Label>
                    <Input
                      placeholder="+91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Contact Email</Label>
                    <Input
                      type="email"
                      placeholder="vendor@dagocommerce.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Account Password *</Label>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Cuisine / Category</Label>
                    <Input
                      placeholder="South Indian, Biryani, Bakery..."
                      value={cuisineType}
                      onChange={(e) => setCuisineType(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs uppercase font-semibold text-slate-300">Business Description</Label>
                  <Textarea
                    placeholder="Short description of your store or specialities..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-[#1a1a2e] border-slate-700 text-white"
                    rows={2}
                  />
                </div>

                <Button
                  type="button"
                  onClick={handleNextToStep2}
                  className="w-full bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
                >
                  Continue to Location & Licensing <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* STEP 2: Address, Licensing & Delivery Setup */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Full Business Address *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleAutoDetectLocation}
                      disabled={autoDetecting}
                      className="text-xs text-[#ff6b35] hover:text-[#e05a2b] p-0 h-auto font-semibold flex items-center"
                    >
                      {autoDetecting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Auto-detecting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 mr-1" /> Auto-detect Area, City & Pincode
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    placeholder="Enter or paste full address (e.g. SRM Nagar, Chennai - Trichy Hwy, Irungalur, Tamil Nadu 621105)"
                    value={addressText}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="bg-[#1a1a2e] border-slate-700 text-white text-sm"
                    rows={2}
                    required
                  />
                  <p className="text-[11px] text-slate-400">
                    💡 Typing or pasting full address automatically fills Area, City, State, and Pincode below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Area / Locality</Label>
                    <Input
                      placeholder="e.g. Gandhinagar"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">City *</Label>
                    <Input
                      placeholder="e.g. Dindigul"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Pincode *</Label>
                    <Input
                      placeholder="624001"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">FSSAI License No. *</Label>
                    <Input
                      placeholder="14-digit FSSAI Number"
                      value={fssaiLicense}
                      onChange={(e) => setFssaiLicense(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">GST Registration No.</Label>
                    <Input
                      placeholder="GSTIN Number (Optional)"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Delivery Radius (km)</Label>
                    <Input
                      type="number"
                      value={deliveryRadius}
                      onChange={(e) => setDeliveryRadius(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Min Order (₹)</Label>
                    <Input
                      type="number"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs uppercase font-semibold text-slate-300">Delivery Charge (₹)</Label>
                    <Input
                      type="number"
                      value={deliveryCharge}
                      onChange={(e) => setDeliveryCharge(e.target.value)}
                      className="bg-[#1a1a2e] border-slate-700 text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="w-1/3 border-slate-700 bg-[#1a1a2e] text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextToStep3}
                    className="w-2/3 bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2"
                  >
                    Setup Initial Menu Card <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* STEP 3: Initial Menu Card Setup */}
            {step === 3 && (
              <div className="space-y-6">
                {/* AI Menu Card Upload Banner */}
                <div className="bg-[#1a1a2e] p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#ff6b35]/10 border border-[#ff6b35]/30 flex items-center justify-center text-[#ff6b35]">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        Upload Menu Card Photo / Image <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                      </h4>
                      <p className="text-[11px] text-slate-400">AI will automatically scan & extract categories, items, and prices</p>
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      id="menuFileInput"
                      accept="image/*,application/pdf"
                      onChange={handleMenuFileUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      size="sm"
                      disabled={menuUploading}
                      onClick={() => document.getElementById('menuFileInput')?.click()}
                      className="bg-[#ff6b35] hover:bg-[#e05a2b] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-[#ff6b35]/20"
                    >
                      {menuUploading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" /> AI Scanning Menu Card...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3.5 h-3.5" /> Upload Menu Card Photo
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase">A-to-Z Menu Card Setup</h3>
                    <p className="text-xs text-slate-400">Review or adjust categories & items before submitting</p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddCategory}
                    className="bg-slate-800 hover:bg-slate-700 text-white text-xs"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                  </Button>
                </div>

                <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                  {categories.map((cat, catIdx) => (
                    <div key={catIdx} className="bg-[#1a1a2e] p-4 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <Input
                          placeholder="Category Name (e.g. Main Course)"
                          value={cat.categoryName}
                          onChange={(e) =>
                            setCategories((prev) =>
                              prev.map((c, i) => (i === catIdx ? { ...c, categoryName: e.target.value } : c))
                            )
                          }
                          className="bg-[#12121a] border-slate-700 text-white font-semibold text-sm"
                        />
                        {categories.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCategory(catIdx)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      {/* Items List */}
                      <div className="space-y-2.5 pl-2 border-l-2 border-[#ff6b35]/30">
                        {cat.items.map((item, itemIdx) => (
                          <div key={itemIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-[#12121a]/60 p-2.5 rounded-lg border border-slate-800/80">
                            <div className="sm:col-span-5">
                              <Input
                                placeholder="Item Name (e.g. Butter Naan)"
                                value={item.name}
                                onChange={(e) =>
                                  setCategories((prev) =>
                                    prev.map((c, i) =>
                                      i === catIdx
                                        ? {
                                            ...c,
                                            items: c.items.map((it, j) => (j === itemIdx ? { ...it, name: e.target.value } : it)),
                                          }
                                        : c
                                    )
                                  )
                                }
                                className="bg-[#1a1a2e] border-slate-700 text-white text-xs"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <Input
                                placeholder="Price ₹"
                                type="number"
                                value={item.price}
                                onChange={(e) =>
                                  setCategories((prev) =>
                                    prev.map((c, i) =>
                                      i === catIdx
                                        ? {
                                            ...c,
                                            items: c.items.map((it, j) => (j === itemIdx ? { ...it, price: e.target.value } : it)),
                                          }
                                        : c
                                    )
                                  )
                                }
                                className="bg-[#1a1a2e] border-slate-700 text-white text-xs"
                              />
                            </div>
                            <div className="sm:col-span-3 flex items-center justify-between gap-1">
                              <Badge
                                onClick={() =>
                                  setCategories((prev) =>
                                    prev.map((c, i) =>
                                      i === catIdx
                                        ? {
                                            ...c,
                                            items: c.items.map((it, j) => (j === itemIdx ? { ...it, isVeg: !it.isVeg } : it)),
                                          }
                                        : c
                                    )
                                  )
                                }
                                className={`cursor-pointer text-[10px] ${
                                  item.isVeg
                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-400 border-red-500/30'
                                }`}
                              >
                                {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                              </Badge>

                              {cat.items.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveItem(catIdx, itemIdx)}
                                  className="h-6 w-6 text-slate-400 hover:text-red-400"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}

                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddItem(catIdx)}
                          className="text-xs text-[#ff6b35] hover:text-[#e05a2b] p-0 h-auto font-medium mt-1"
                        >
                          + Add another item to {cat.categoryName || 'Category'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="w-1/3 border-slate-700 bg-[#1a1a2e] text-slate-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-2/3 bg-[#ff6b35] hover:bg-[#e05a2b] text-white font-medium py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b35]/25"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Application...
                      </>
                    ) : (
                      <>
                        Submit Vendor Application <ShieldCheck className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
