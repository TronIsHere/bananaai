import { FaMagic, FaPalette } from "react-icons/fa";

export const stats = [
  { label: "تصویر ساخته شده", value: "5k+" },
  { label: "کاربر فعال", value: "۱k+" },
  { label: "دقت مدل", value: "۹۸.۷٪" },
];

export const features = [
  {
    title: "تبدیل متن به تصویر",
    subtitle: "Core Diffusion",
    description:
      "موتور تبدیل متن به تصویر با درک عمیق فارسی و کنترل کامل بر سبک، نور و جزئیات. از پرامپت‌های ساده تا دستورات پیچیده با دقت بالا.",
    accent: "from-cyan-400 via-blue-500 to-purple-500",
    icon: FaMagic,
  },
  {
    title: "تبدیل تصویر به تصویر",
    subtitle: "Vision Rebuild",
    description:
      "پردازش تصویر به تصویر با لایه‌های تشخیص سوژه و بازطراحی هوشمند با حفظ ترکیب‌بندی. تغییر سبک، نور و جزئیات بدون از دست دادن کیفیت.",
    accent: "from-fuchsia-500 via-pink-500 to-rose-500",
    icon: FaPalette,
  },
];

export const workflow = [
  {
    step: "۱",
    title: "ایده‌تان را بنویسید",
    body: "فقط کافیست تصویری که در ذهن دارید را به فارسی یا انگلیسی توصیف کنید. هر جزئیاتی که می‌خواهید اضافه کنید و بگذارید هوش مصنوعی جادو کند",
  },
  {
    step: "۲",
    title: "در چند ثانیه دریافت کنید",
    body: "با استفاده از قدرتمندترین GPUها و الگوریتم‌های بهینه‌شده، تصویر شما در کمتر از ۱۰ ثانیه آماده می‌شود",
  },
  {
    step: "۳",
    title: "کامل و آماده استفاده",
    body: "تصویر نهایی با کیفیت بالا، بدون نویز و آماده برای استفاده در پروژه‌های حرفه‌ای شما. در صورت نیاز می‌توانید آن را بزرگ‌نمایی کنید",
  },
];

export const plans = [
  {
    name: "رایگان",
    nameEn: "Free",
    price: "0",
    currency: "تومان",
    tagline: "برای شروع و امتحان سرویس",
    highlights: [
      "۱۲ اعتبار",
      "متن به تصویر",
      "کیفیت ۵۱۲×۵۱۲",
      "پردازش عادی",
      "واترمارک BananaAI",
      "بدون نگهداری تصاویر",
    ],
    cta: "شروع کنید",
  },
  {
    name: "کاوشگر",
    nameEn: "Explorer",
    price: "350,000",
    currency: "تومان",
    tagline: "برای شروع و آشنایی با قدرت هوش مصنوعی",
    highlights: [
      "۲۰۰ اعتبار",
      "متن به تصویر",
      "کیفیت ۵۱۲×۵۱۲",
      "پردازش عادی",
      "نگهداری ۷ روزه",
    ],
    cta: "شروع کنید",
  },
  {
    name: "خلاق",
    nameEn: "Creator",
    price: "999,000",
    currency: "تومان",
    tagline: "برای طراحان و فریلنسرها",
    highlights: [
      "۶۰۰ اعتبار",
      "متن به تصویر",
      "تصویر به تصویر",
      "کیفیت ۱۰۲۴×۱۰۲۴",
      "پردازش سریع",
      "بدون واترمارک",
      "نگهداری ۳۰ روزه",
    ],
    cta: "شروع کنید",
    featured: true,
  },
  {
    name: "استودیو",
    nameEn: "Studio",
    price: "2,990,000",
    currency: "تومان",
    tagline: "مناسب تیم‌ها و کسب‌وکارها",
    highlights: [
      "۲۰۰۰ اعتبار",
      "متن به تصویر",
      "تصویر به تصویر",
      "کیفیت ۱۰۲۴×۱۰۲۴",
      "پردازش فوری",
      "بدون واترمارک",
      "نگهداری ۹۰ روزه",
      "پشتیبانی تلگرام",
    ],
    cta: "فعال‌سازی",
  },
];

export const logos = ["دانشگاه شریف", "کاله", "بانک ملت", "دیجیکالا", "اسنپ"];

export const navigationItems = [
  { href: "#features", label: "ماژول‌ها" },
  { href: "#workflow", label: "نحوه کار" },
  { href: "#pricing", label: "تعرفه" },
  { href: "#about", label: "درباره" },
  { href: "#contact", label: "تماس با ما" },
];

export const demoPrompts = [
  "یک روبات نوازنده تار در بازار تبریز، نور نئون، سبک سینمایی، رندر Octane، لنز ۳۵mm",
  "یک گربه فضانورد در حال رانندگی با موتورسیکلت در مریخ، نور طلایی، سبک علمی تخیلی",
  "منظره کوهستان با دریاچه آینه‌ای، غروب خورشید، ابرهای دراماتیک، سبک عکاسی طبیعت",
];

export const STYLE_PRESETS = [
  {
    id: "realistic",
    name: "واقع‌گرایانه",
    icon: "ImageIcon",
    prompt: "ultra realistic, high detail, professional photography",
  },
  {
    id: "oil-painting",
    name: "نقاشی رنگ روغن",
    icon: "Palette",
    prompt: "oil painting style, artistic brushstrokes, classical art",
  },
  {
    id: "cartoon",
    name: "کارتونی",
    icon: "Sparkles",
    prompt: "cartoon style, animated, vibrant colors, playful",
  },
  {
    id: "sketch",
    name: "طراحی",
    icon: "Wand2",
    prompt: "pencil sketch, hand-drawn, artistic, monochrome",
  },
  {
    id: "vintage",
    name: "قدیمی",
    icon: "Zap",
    prompt: "vintage style, retro, aged photo effect, nostalgic",
  },
  {
    id: "cyberpunk",
    name: "سایبرپانک",
    icon: "Zap",
    prompt: "cyberpunk style, neon lights, futuristic, dark atmosphere",
  },
] as const;

export const IMAGE_SIZES = [
  { value: "1:1", label: "مربع (1:1)" },
  { value: "9:16", label: "عمودی موبایل (9:16)" },
  { value: "16:9", label: "افقی واید (16:9)" },
  { value: "3:4", label: "عمودی (3:4)" },
  { value: "4:3", label: "افقی کلاسیک (4:3)" },
  { value: "3:2", label: "افقی عکس (3:2)" },
  { value: "2:3", label: "عمودی عکس (2:3)" },
  { value: "5:4", label: "عمودی نزدیک به مربع (5:4)" },
  { value: "4:5", label: "عمودی نزدیک به مربع (4:5)" },
  { value: "21:9", label: "افقی اولترا واید (21:9)" },
] as const;
