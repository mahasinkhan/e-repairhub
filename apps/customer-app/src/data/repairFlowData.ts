/** Shared brand + service data for Home → Service → Pricing flow */

export type BrandCategory = "All" | "Android" | "iOS" | "Budget" | "Foldable";

export interface BrandRecord {
  id: number;
  name: string;
  image: string;
  category: BrandCategory[];
  popular?: boolean;
}

export const BRANDS: BrandRecord[] = [
  { id: 1, name: "Apple", popular: true, image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", category: ["iOS"] },
  { id: 2, name: "Samsung", popular: true, image: "https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/e/r/f/-original-imah56hkgehywn5b.jpeg?q=90", category: ["Android", "Foldable"] },
  { id: 3, name: "OnePlus", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT_N222Z-BQPrtLxJYpuOgTF1J42kAECTyBopmVnFg1iRKdum0xBoEnaPIAElkS-ueioEUdyFuA4rbNPVeET4rmc4anD7kvygBmymTcmgVmjZQfY5QcRod5QA", category: ["Android"] },
  { id: 4, name: "Xiaomi", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSdBgBe-jL9WxJkqmlB95fuaWyA_OfJRZSDcABlSvCPDPSnp0iJDJiQpjDCZT3MYS7tlSt_jB3ZXy1ZqBbizowKFRHz8AnXnC0eXVw1sq4lhzL0x4mnEyVkUw", category: ["Android", "Budget"] },
  { id: 5, name: "Realme", image: "https://m.media-amazon.com/images/I/61eHj6VXGgL.jpg", category: ["Android", "Budget"] },
  { id: 6, name: "Vivo", image: "https://sell.gameloot.in/wp-content/uploads/sites/4/2024/03/Vivo-X100-Pro-16GB-RAM-512GB-Storage_2.jpg", category: ["Android", "Budget"] },
  { id: 7, name: "Oppo", image: "https://m.media-amazon.com/images/I/71iJ802AmvL.jpg", category: ["Android"] },
  { id: 8, name: "Google", popular: true, image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR-FxvcPJtqpyB2tYCeyaOuKVjCYBSJh2EmJQwvaTrFhkmzcvVi5vok294nhnEB9BlYayEi91k8jIHisWM9u4Wv8jJsWxRCDJ5KQG5lrhpT2gHhKeoiQ8jHItQ", category: ["Android"] },
  { id: 9, name: "Nothing", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTeXESiqA0F0bwhc32s-UoEcuEgQxNomYVeKwpHA-ZoMKhHc-7-Vhz4sObdyaipaeFnuGTrwWRUoH73nWH4vkfaVpC1CF7q", category: ["Android"] },
  { id: 10, name: "Motorola", image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ9en_VyFLsD5ZLR74lrT3Sw-gIMj0pK9sV-MzgCo_YxOV8CMpwkdcj_kVFyVyefpQejhJ57tjyYHmqXp6XlqM0xvd-IehGOi4ur11X7Yx8Js95r_AZWVt5eBE", category: ["Android", "Budget"] },
  { id: 11, name: "Nokia", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTlxh2un8SH5nRADsC501G_6QhBjPE62-nGWiNPwm8ASHa5afh7r0cJrU3VY33AX5fSNCZe4T4aEAo9v_6Su4qEbzT8KxU4hnbbmTbpLjFAAIYjGl9FTUU7Gg", category: ["Android", "Budget"] },
  { id: 12, name: "iQOO", image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQD7PEemru9IjbFECVxnTHvewbmIKVY6cbbyMFydt3VmaZ_R8Meq2-TvJya57s737yHD5amMDpzsBeVut7LRBB33XwIMfcCkYk_VQmXi5INXEip5ESgMgDu", category: ["Android"] },





    { id: 13, name: "Apple", popular: true, image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg", category: ["iOS"] },
  { id: 14, name: "Samsung", popular: true, image: "https://rukminim2.flixcart.com/image/480/640/xif0q/mobile/e/r/f/-original-imah56hkgehywn5b.jpeg?q=90", category: ["Android", "Foldable"] },
  { id: 15, name: "OnePlus", image: "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcT_N222Z-BQPrtLxJYpuOgTF1J42kAECTyBopmVnFg1iRKdum0xBoEnaPIAElkS-ueioEUdyFuA4rbNPVeET4rmc4anD7kvygBmymTcmgVmjZQfY5QcRod5QA", category: ["Android"] },
  { id: 16, name: "Xiaomi", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSdBgBe-jL9WxJkqmlB95fuaWyA_OfJRZSDcABlSvCPDPSnp0iJDJiQpjDCZT3MYS7tlSt_jB3ZXy1ZqBbizowKFRHz8AnXnC0eXVw1sq4lhzL0x4mnEyVkUw", category: ["Android", "Budget"] },
  { id: 17, name: "Realme", image: "https://m.media-amazon.com/images/I/61eHj6VXGgL.jpg", category: ["Android", "Budget"] },
  { id: 18, name: "Vivo", image: "https://sell.gameloot.in/wp-content/uploads/sites/4/2024/03/Vivo-X100-Pro-16GB-RAM-512GB-Storage_2.jpg", category: ["Android", "Budget"] },
  { id: 19, name: "Oppo", image: "https://m.media-amazon.com/images/I/71iJ802AmvL.jpg", category: ["Android"] },
  { id: 18, name: "Google", popular: true, image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcR-FxvcPJtqpyB2tYCeyaOuKVjCYBSJh2EmJQwvaTrFhkmzcvVi5vok294nhnEB9BlYayEi91k8jIHisWM9u4Wv8jJsWxRCDJ5KQG5lrhpT2gHhKeoiQ8jHItQ", category: ["Android"] },
  { id: 19, name: "Nothing", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTeXESiqA0F0bwhc32s-UoEcuEgQxNomYVeKwpHA-ZoMKhHc-7-Vhz4sObdyaipaeFnuGTrwWRUoH73nWH4vkfaVpC1CF7q", category: ["Android"] },
  { id: 20, name: "Motorola", image: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcQ9en_VyFLsD5ZLR74lrT3Sw-gIMj0pK9sV-MzgCo_YxOV8CMpwkdcj_kVFyVyefpQejhJ57tjyYHmqXp6XlqM0xvd-IehGOi4ur11X7Yx8Js95r_AZWVt5eBE", category: ["Android", "Budget"] },
  { id: 21, name: "Nokia", image: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTlxh2un8SH5nRADsC501G_6QhBjPE62-nGWiNPwm8ASHa5afh7r0cJrU3VY33AX5fSNCZe4T4aEAo9v_6Su4qEbzT8KxU4hnbbmTbpLjFAAIYjGl9FTUU7Gg", category: ["Android", "Budget"] },
  { id: 22, name: "iQOO", image: "https://encrypted-tbn2.gstatic.com/shopping?q=tbn:ANd9GcQD7PEemru9IjbFECVxnTHvewbmIKVY6cbbyMFydt3VmaZ_R8Meq2-TvJya57s737yHD5amMDpzsBeVut7LRBB33XwIMfcCkYk_VQmXi5INXEip5ESgMgDu", category: ["Android"] },
];

export interface RepairServiceRecord {
  id: string;
  name: string;
  type: "Hardware" | "Software" | "Damage";
  image: string;
  /** Base repair labour + parts estimate (INR) before brand tier */
  basePrice: number;
  repairTime: string;
  delivery: string;
  warranty: string;
}

export const PHONE_COLORS = [
  "Black",
  "White",
  "Blue",
  "Green",
  "Red",
  "Gold",
  "Silver",
  "Purple",
] as const;

export type PhoneColor = (typeof PHONE_COLORS)[number];

const DEFAULT_MODELS = [
  "Model A",
  "Model B",
  "Model C",
  "Model D",
] as const;

const MODELS_BY_BRAND: Record<string, readonly string[]> = {
  Apple: [
    "iPhone 11",
    "iPhone 11 Pro",
    "iPhone 12",
    "iPhone 12 Pro",
    "iPhone 13",
    "iPhone 13 Pro",
    "iPhone 14",
    "iPhone 14 Pro",
    "iPhone 15",
    "iPhone 15 Pro",
    "iPhone 16",
    "iPhone 16 Pro",
  ],
  Samsung: [
    "Galaxy S21",
    "Galaxy S22",
    "Galaxy S23",
    "Galaxy S24",
    "Galaxy S24 Ultra",
    "Galaxy A34",
    "Galaxy A54",
    "Galaxy A55",
    "Galaxy M34",
    "Galaxy M54",
    "Galaxy Z Flip",
    "Galaxy Z Fold",
  ],
  OnePlus: [
    "OnePlus 9",
    "OnePlus 9R",
    "OnePlus 10",
    "OnePlus 10R",
    "OnePlus 10T",
    "OnePlus 11",
    "OnePlus 11R",
    "OnePlus 12",
    "OnePlus 12R",
    "Nord 2",
    "Nord 3",
    "Nord CE 3",
  ],
  Xiaomi: [
    "Redmi A1",
    "Redmi A2",
    "Redmi A3",
    "Redmi A5",
    "Redmi Note 12",
    "Redmi Note 13",
    "Redmi Note 14",
    "Mi 10",
    "Mi 11",
    "Mi 12",
    "Xiaomi 12",
    "Xiaomi 13",
  ],
  Realme: [
    "Realme 9",
    "Realme 10",
    "Realme 11",
    "Realme 12",
    "Realme 12 Pro",
    "Realme Narzo 50",
    "Realme Narzo 60",
    "Realme Narzo 70",
    "Realme GT 2",
    "Realme GT 3",
    "Realme C55",
    "Realme C67",
  ],
  Vivo: [
    "Vivo V27",
    "Vivo V29",
    "Vivo V30",
    "Vivo V30 Pro",
    "Vivo V40",
    "Vivo X80",
    "Vivo X90",
    "Vivo X100",
    "Vivo T2",
    "Vivo T3",
    "Vivo Y27",
    "Vivo Y36",
  ],
  Oppo: [
    "Oppo Reno 8",
    "Oppo Reno 10",
    "Oppo Reno 11",
    "Oppo Reno 12",
    "Oppo F19",
    "Oppo F21",
    "Oppo F23",
    "Oppo A78",
    "Oppo A79",
    "Oppo A98",
    "Oppo Find X5",
    "Oppo Find X6",
  ],
  Google: ["Pixel 6", "Pixel 6a", "Pixel 7", "Pixel 7a", "Pixel 8", "Pixel 8a", "Pixel 9", "Pixel 9a"],
  Nothing: ["Phone (1)", "Phone (2)", "Phone (2a)", "CMF Phone 1"],
  Motorola: ["Moto G54", "Moto G84", "Moto G73", "Edge 30", "Edge 40", "Edge 50"],
  Nokia: ["Nokia G21", "Nokia G42", "Nokia X30", "Nokia C32", "Nokia C22"],
  iQOO: ["iQOO Neo 7", "iQOO Neo 9", "iQOO 11", "iQOO 12", "iQOO Z7", "iQOO Z9"],
};

export function getModelsForBrand(brandName: string | null | undefined): readonly string[] {
  if (!brandName) return DEFAULT_MODELS;
  const decoded = decodeURIComponent(brandName.trim());
  return MODELS_BY_BRAND[decoded] ?? MODELS_BY_BRAND[decoded.toLowerCase()] ?? DEFAULT_MODELS;
}

export type PhoneModelRecord = {
  name: string;
  image: string;
};

const PLACEHOLDER_MODEL_IMAGE =
  "https://dummyimage.com/240x240/e5e7eb/111827.png&text=Phone";

export function getModelRecordsForBrand(brandName: string | null | undefined): PhoneModelRecord[] {
  const models = getModelsForBrand(brandName);
  const brandImage =
    (brandName
      ? BRANDS.find((b) => b.name.toLowerCase() === decodeURIComponent(brandName).toLowerCase())?.image
      : undefined) ?? PLACEHOLDER_MODEL_IMAGE;
  return models.map((name) => ({
    name,
    image: brandImage,
  }));
}

export const REPAIR_SERVICES: RepairServiceRecord[] = [
  {
    id: "screen-replacement",
    name: "Screen Replacement",
    type: "Hardware",
    image: "https://static.vecteezy.com/system/resources/thumbnails/069/190/907/small/first-person-view-of-hands-examining-cracked-smartphone-screen-for-repair-photo.jpg",
    basePrice: 2499,
    repairTime: "45–60 mins",
    delivery: "Same-day doorstep pickup & delivery (metro)",
    warranty: "6 months on replaced parts",
  },
  {
    id: "battery-replacement",
    name: "Battery Replacement",
    type: "Hardware",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRD5KetR19NweCdQ4Kahqh32SExy8fE_xfGUg&s",
    basePrice: 1299,
    repairTime: "30–40 mins",
    delivery: "Pickup within 2 hrs · Return same evening",
    warranty: "1 year on battery",
  },
  {
    id: "charging-port-repair",
    name: "Charging Port Repair",
    type: "Hardware",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSL8fa6nKunN0t32LlyzCT-TbUVhNFw_qLh_w&s",
    basePrice: 899,
    repairTime: "35–50 mins",
    delivery: "Doorstep engineer visit · Same day",
    warranty: "6 months service warranty",
  },
  {
    id: "software-update",
    name: "Software Update",
    type: "Software",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-kKkIKgNpgyvHeuCzhMFt9oPgWDgPqG45wQ&s",
    basePrice: 499,
    repairTime: "20–30 mins",
    delivery: "Remote / at-home session",
    warranty: "30 days support",
  },
  {
    id: "virus-removal",
    name: "Virus Removal",
    type: "Software",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY_p1IP5vBEgW-j7OIPFBxF63-Afy8HgsqqQ&s",
    basePrice: 599,
    repairTime: "40–60 mins",
    delivery: "Secure remote clean-up available",
    warranty: "14 days re-check",
  },
  {
    id: "water-damage-repair",
    name: "Water Damage Repair",
    type: "Damage",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDO9_xEpzlVYaobuSWvaGeyBNPANR3stnsug&s",
    basePrice: 1899,
    repairTime: "2–4 hrs (diagnosis + treatment)",
    delivery: "Lab pickup · Status updates on WhatsApp",
    warranty: "3 months on serviced modules",
  },
  {
    id: "speaker-repair",
    name: "Speaker Repair",
    type: "Hardware",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSttk17gc9KtwTbO8-c4xOGY-z2J9MkNLSp0g&s",
    basePrice: 799,
    repairTime: "30–45 mins",
    delivery: "Doorstep repair · Same day slots",
    warranty: "6 months on parts",
  },
  {
    id: "camera-repair",
    name: "Camera Repair",
    type: "Hardware",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-zKu5MMjeq2wmqjQetB3VkfiFpZQRlQxhrg&s",
    basePrice: 1599,
    repairTime: "40–55 mins",
    delivery: "Pickup & delivery included",
    warranty: "6 months on camera module",
  },

   {
    id: "Volumn Buttton ",
    name: "Side Button Repair",
    type: "Software",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQk7SCdzSNNVoBYJo0IIWK6b4acIiLsDvmi-w&s",
    basePrice: 499,
    repairTime: "20–30 mins",
    delivery: "Remote / at-home session",
    warranty: "30 days support",
  },
  {
    id: "Screen Gard ",
    name: "Screen Protector Installation",
    type: "Software",
    image: "https://www.onezeros.in/cdn/shop/products/9d-ag-matte-tempered-glass-for-iphone-12-mini-screen-protector-pack-of-2-onezeros-in-35319242260678.jpg?v=1722529269",
    basePrice: 599,
    repairTime: "40–60 mins",
    delivery: "Secure remote clean-up available",
    warranty: "14 days re-check",
  },
];

const PREMIUM_BRANDS = new Set(["Apple", "Samsung", "Google"]);

export function findBrandByName(name: string | null | undefined): BrandRecord | undefined {
  if (!name) return undefined;
  const decoded = decodeURIComponent(name.trim());
  return BRANDS.find((b) => b.name.toLowerCase() === decoded.toLowerCase());
}

export function findServiceById(id: string | null | undefined): RepairServiceRecord | undefined {
  if (!id) return undefined;
  return REPAIR_SERVICES.find((s) => s.id === id);
}

/** Final payable total: base + small tier fee for premium OEM parts */
export function getQuoteTotal(brandName: string, service: RepairServiceRecord): number {
  const tier = PREMIUM_BRANDS.has(brandName) ? 349 : 0;
  return service.basePrice + tier;
}

export function formatInr(n: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}
